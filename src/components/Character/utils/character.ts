import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadModel = (blobUrl: string) => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        loader.load(
          blobUrl,
          async (gltf) => {
            const model = gltf.scene;
            await renderer.compileAsync(model, camera, scene);
            model.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });
            resolve(gltf);
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

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const gltf = await loadModel("/models/model.glb");

        if (!gltf) {
          resolve(null);
          return;
        }

        const character = gltf.scene;
        const box = new THREE.Box3().setFromObject(character);
        const size = box.getSize(new THREE.Vector3());

        const targetHeight = 13;
        const scale = targetHeight / size.y;
        character.scale.setScalar(scale);

        const newBox = new THREE.Box3().setFromObject(character);
        const newCenter = newBox.getCenter(new THREE.Vector3());

        character.position.x = -newCenter.x;
        character.position.y = 2.0 - newBox.min.y;
        character.position.z = -newCenter.z;

        resolve(gltf);
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  const loadWhiteboard = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const gltf = await loadModel("/models/whiteboard.glb");

        if (!gltf) {
          resolve(null);
          return;
        }

        const whiteboard = gltf.scene;
        const box = new THREE.Box3().setFromObject(whiteboard);
        const size = box.getSize(new THREE.Vector3());
        const targetHeight = 7.5;
        const scale = targetHeight / size.y;
        whiteboard.scale.setScalar(scale);

        const newBox = new THREE.Box3().setFromObject(whiteboard);
        const newCenter = newBox.getCenter(new THREE.Vector3());

        whiteboard.position.x = 9.2 - newCenter.x;
        whiteboard.position.y = 7.4 - newBox.min.y;
        whiteboard.position.z = -1.6 - newCenter.z;
        whiteboard.rotation.y = -1.57;
        whiteboard.userData.presentationPose = {
          x: whiteboard.position.x,
          y: whiteboard.position.y,
          z: whiteboard.position.z,
          scale,
          rotationY: whiteboard.rotation.y,
        };
        whiteboard.visible = false;

        resolve(gltf);
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter, loadWhiteboard };
};

export default setCharacter;
