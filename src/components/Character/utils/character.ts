import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const blobUrl = "/models/model.glb";

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });

            // Adjust scale and position for Avaturn model
            const box = new THREE.Box3().setFromObject(character);
            const size = box.getSize(new THREE.Vector3());

            // Scale up large so only head/shoulders (headshot) is visible
            const targetHeight = 13;
            const scale = targetHeight / size.y;
            character.scale.setScalar(scale);

            // Recompute bounding box after scaling
            const newBox = new THREE.Box3().setFromObject(character);
            const newCenter = newBox.getCenter(new THREE.Vector3());

            // Position: center horizontally, push model down so face is at camera level (y=13.1)
            character.position.x = -newCenter.x;
            character.position.y = 2.0 - newBox.min.y;
            character.position.z = -newCenter.z;

            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();

            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
