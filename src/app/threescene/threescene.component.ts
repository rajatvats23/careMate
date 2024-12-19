import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-human-model',
  template: `<canvas #rendererCanvas></canvas>`,
  styles: [
    `canvas {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }`
  ]
})
export class ThreeSceneComponent implements OnInit {
  @ViewChild('rendererCanvas', { static: true })
  rendererCanvas!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private model!: THREE.Group;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  ngOnInit() {
    this.initScene();
    this.setupLighting();
    this.loadModel();
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.9, 3);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.rendererCanvas.nativeElement,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    // this.renderer.debug = true; // Enable Three.js debugger
    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 10;
    this.controls.target.set(0, 1, 0);
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      0.8
    );
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.load('./assets/HumanBase1122.glb', (gltf) => {
      this.model = gltf.scene;
      this.scene.add(this.model);
      console.log(this.model);
  
      this.model.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          
          if (mesh.material) {
            // Check if the material is an array
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((material) => {
                // Check for MeshStandardMaterial or MeshBasicMaterial
                if (material instanceof THREE.MeshStandardMaterial || 
                    material instanceof THREE.MeshBasicMaterial) {
                  material.color.set(Math.random() * 0xffffff);
                }
              });
            } else {
              // Check for MeshStandardMaterial or MeshBasicMaterial for single material
              if (mesh.material instanceof THREE.MeshStandardMaterial || 
                  mesh.material instanceof THREE.MeshBasicMaterial) {
                mesh.material.color.set(Math.random() * 0xffffff);
              }
            }
          }
        }
      });
  
      this.animate();
    });
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('window:resize')
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // @HostListener('click', ['$event'])
  // onClick(event: MouseEvent) {
  //   this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  //   this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  //   this.raycaster.setFromCamera(this.mouse, this.camera);
  //   const intersects = this.raycaster.intersectObjects(
  //     this.model.children,
  //     true
  //   );
  //   if (intersects.length > 0) {
  //     const clickedMesh = intersects[0].object as THREE.Mesh;
  //     console.log(`Clicked on mesh: ${clickedMesh.name}`);

  //     // Access custom properties
  //     if (clickedMesh.userData['customProperty']) {
  //       console.log('Custom property found!');
  //     }
  //   }
  // }

  @HostListener('click', ['$event'])
onClick(event: MouseEvent) {
  this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  this.raycaster.setFromCamera(this.mouse, this.camera);
  const intersects = this.raycaster.intersectObjects(
    this.model.children,
    true
  );
  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object as THREE.Mesh;
    console.log(`Clicked on mesh: ${clickedMesh.name}`);

    // Access custom properties
    if (clickedMesh.userData['customProperty']) {
      console.log('Custom property found!');
    }

    // Get the color of the clicked mesh
    if (clickedMesh.material) {
      // Check if the material is an array
      if (Array.isArray(clickedMesh.material)) {
        clickedMesh.material.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial || 
              material instanceof THREE.MeshBasicMaterial) {
            console.log(`Color of ${clickedMesh.name}:`, material.color.getHexString());
          }
        });
      } else {
        // For single material
        if (clickedMesh.material instanceof THREE.MeshStandardMaterial || 
            clickedMesh.material instanceof THREE.MeshBasicMaterial) {
          console.log(`Color of ${clickedMesh.name}:`, clickedMesh.material.color.getHexString());
        }
      }
    }
  }

}
}