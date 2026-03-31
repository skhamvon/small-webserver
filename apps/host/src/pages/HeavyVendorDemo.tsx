import { useEffect, useRef } from "react";
import * as THREE from "three";
import { chunk, merge } from "lodash-es";
import styles from "./HeavyVendorDemo.module.css";

/**
 * Chunk volontairement lourd : three + lodash-es (~600k+ JS minifié hors GSAP).
 */
export default function HeavyVendorDemo() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    merge({}, chunk(Array.from({ length: 400 }, (_, i) => i), 7));

    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = 280;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 2.4;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    el.appendChild(renderer.domElement);

    const geo = new THREE.TorusKnotGeometry(0.55, 0.18, 120, 16);
    const mat = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      mesh.rotation.x += 0.009;
      mesh.rotation.y += 0.012;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className={styles.section} aria-labelledby="heavy-vendor-title">
      <h2 id="heavy-vendor-title" className={styles.h2}>
        Rendu WebGL (Three.js) + lodash-es
      </h2>
      <p className={styles.p}>
        Bibliothèques regroupées dans un chunk dédié pour augmenter le coût réseau et
        d’analyse JS de cette page.
      </p>
      <div ref={mountRef} className={styles.mount} />
    </section>
  );
}
