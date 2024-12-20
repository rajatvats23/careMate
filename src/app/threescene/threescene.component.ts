import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-human-model',
  template: `<div class="renderer-container">
    <canvas #rendererCanvas></canvas>
  </div>`,
  styles: [`
    .renderer-container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
      display: block;
    }
  `]
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
    
    // Get the container dimensions
    const container = this.rendererCanvas.nativeElement.parentElement;
    const containerWidth = container?.clientWidth || window.innerWidth;
    const containerHeight = container?.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(
      50,
      containerWidth / containerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.9, 3);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.rendererCanvas.nativeElement,
      antialias: true
    });
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

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
    // Your existing lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }

  private loadModel() {
    // Your existing model loading code remains the same
    const loader = new GLTFLoader();
    loader.load('./assets/untitleddd.glb', (gltf) => {
      this.model = gltf.scene;
      this.scene.add(this.model);
      
      this.model.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((material) => {
                if (material instanceof THREE.MeshStandardMaterial || 
                    material instanceof THREE.MeshBasicMaterial) {
                  material.color.set(Math.random() * 0xffffff);
                }
              });
            } else {
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
    const container = this.rendererCanvas.nativeElement.parentElement;
    if (container) {
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  // Your existing click handler remains the same
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    // Calculate mouse position relative to the container
    const container = this.rendererCanvas.nativeElement.parentElement;
    const rect = container?.getBoundingClientRect();
    if (rect) {
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.model.children,
        true
      );
      
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        console.log(`Clicked on mesh: ${clickedMesh.name}`);

        if (clickedMesh.material) {
          if (Array.isArray(clickedMesh.material)) {
            clickedMesh.material.forEach((material) => {
              if (material instanceof THREE.MeshStandardMaterial || 
                  material instanceof THREE.MeshBasicMaterial) {
                console.log(`Color of ${clickedMesh.name}:`, material.color.getHexString());
              }
            });
          } else {
            if (clickedMesh.material instanceof THREE.MeshStandardMaterial || 
                clickedMesh.material instanceof THREE.MeshBasicMaterial) {
              console.log(`Color of ${clickedMesh.name}:`, clickedMesh.material.color.getHexString());
            }
          }
        }
      }
    }
  }
}