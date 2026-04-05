import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import { setAllTimeline, setCharTimeline } from "../utils/GsapScroll";

function createFootGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const gradient = context.createRadialGradient(128, 128, 18, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  gradient.addColorStop(0.25, "rgba(94, 234, 212, 0.55)");
  gradient.addColorStop(0.55, "rgba(34, 211, 238, 0.18)");
  gradient.addColorStop(1, "rgba(34, 211, 238, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createFootGlow(character: THREE.Object3D) {
  const texture = createFootGlowTexture();
  if (!texture) {
    return null;
  }

  const box = new THREE.Box3().setFromObject(character);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const worldPosition = new THREE.Vector3(
    center.x,
    box.min.y + 0.06,
    center.z
  );
  const localPosition = character.worldToLocal(worldPosition.clone());
  const glowDiameter = Math.max(Math.min(size.x * 0.21, 1.1625), 0.7125);

  const geometry = new THREE.PlaneGeometry(glowDiameter, glowDiameter);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0x8bf5e7,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const glow = new THREE.Mesh(geometry, material);
  glow.name = "footGlow";
  glow.rotation.x = -Math.PI / 2;
  glow.position.copy(localPosition);
  glow.renderOrder = 2;

  character.add(glow);
  return glow;
}

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  const [character, setChar] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let whiteboard: THREE.Object3D | null = null;
      let footGlow: THREE.Mesh | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter, loadWhiteboard } = setCharacter(
        renderer,
        scene,
        camera
      );

      Promise.all([loadCharacter(), loadWhiteboard()]).then(
        ([characterGltf, whiteboardGltf]) => {
          if (whiteboardGltf) {
            whiteboard = whiteboardGltf.scene;
            scene.add(whiteboard);
          }

          if (characterGltf) {
            const animations = setAnimations(characterGltf);
            hoverDivRef.current &&
              animations.hover(characterGltf, hoverDivRef.current);
            mixer = animations.mixer;
            let character = characterGltf.scene;
            setChar(character);
            scene.add(character);
            footGlow = createFootGlow(character);
            setCharTimeline(character, camera, whiteboard);
            setAllTimeline();
            headBone =
              character.getObjectByName("spine006") ||
              character.getObjectByName("Head") ||
              character.getObjectByName("head") ||
              null;
            screenLight = character.getObjectByName("screenlight") || null;
            progress.loaded().then(() => {
              setTimeout(() => {
                light.turnOnLights();
                if (footGlow?.material instanceof THREE.MeshBasicMaterial) {
                  gsap.to(footGlow.material, {
                    opacity: 0.5,
                    duration: 1.4,
                    ease: "power2.out",
                  });
                }
                animations.startIntro();
              }, 2500);
            });
            window.addEventListener("resize", () =>
              handleResize(renderer, camera, canvasDiv, character)
            );
          }
        }
      );

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", (event) => {
        onMouseMove(event);
      });
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const animate = () => {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          if (screenLight) light.setPointLight(screenLight);
        }
        renderer.render(scene, camera);
      };
      animate();
      return () => {
        clearTimeout(debounce);
        scene.clear();
        renderer.dispose();
        window.removeEventListener("resize", () =>
          handleResize(renderer, camera, canvasDiv, character!)
        );
        if (whiteboard) {
          scene.remove(whiteboard);
        }
        if (footGlow?.material instanceof THREE.Material) {
          footGlow.material.dispose();
        }
        if (footGlow?.geometry) {
          footGlow.geometry.dispose();
        }
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
