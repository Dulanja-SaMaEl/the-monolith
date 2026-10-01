import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  Terminal as TerminalIcon,
  Cpu,
  Shield,
  Layers,
  Activity,
  Zap,
  Globe,
  Database,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Code,
  Sliders,
  Server,
  Key,
  Compass,
  FileText,
  Lock,
  Radio,
  ChevronRight,
  X,
  Play,
  RotateCcw,
  Sparkles,
  GitBranch,
  Network,
  Maximize2,
  User,
  Mail,
  Briefcase,
  Award,
  Calculator,
  Workflow,
  CheckCircle2,
  Boxes,
  HelpCircle,
  TrendingUp,
  Megaphone,
  Palette,
  Cloud,
  MonitorSmartphone,
  LockKeyhole,
  MapPin,
  Phone,
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  Printer,
  Download,
  Search,
  Filter,
  LogOut,
  DollarSign,
  CreditCard,
  Clock,
  AlertCircle,
  FileCheck
} from 'lucide-react';

/* =========================================================================
   1. THREE.JS GLOBAL CANVAS: THE MAGNETIC SHARD-SWARM
   ========================================================================= */

function MonolithCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- SCENE, CAMERA, RENDERER ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0908, 0.028);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- LIGHTING (Warm-white, bone & taupe ambient) ---
    const ambientLight = new THREE.AmbientLight(0x2e2b27, 1.2);
    scene.add(ambientLight);

    // Blinding Core AI Point Light
    const coreLight = new THREE.PointLight(0xfff8ee, 6.0, 40, 1.4);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // Warm Rim Directional Light
    const dirLight = new THREE.DirectionalLight(0xe8e4dc, 2.2);
    dirLight.position.set(12, 18, 10);
    scene.add(dirLight);

    // Lower Taupe Bounce Light
    const bounceLight = new THREE.DirectionalLight(0x7a756f, 1.0);
    bounceLight.position.set(-10, -15, -8);
    scene.add(bounceLight);

    // --- CORE GLOWING SPHERE (Core AI) ---
    const coreGeo = new THREE.DodecahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfffcf7
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Core Halo Ring
    const haloGeo = new THREE.RingGeometry(1.2, 1.45, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xe3dfd8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);

    // --- VOLUMETRIC GOD RAYS ---
    const godRayGroup = new THREE.Group();
    const rayCount = 8;
    const rayGeo = new THREE.CylinderGeometry(0.15, 3.8, 22, 16, 1, true);
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xe3dfd8,
      transparent: true,
      opacity: 0.045,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    for (let r = 0; r < rayCount; r++) {
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.rotation.x = (r * Math.PI) / 4 + Math.PI / 6;
      ray.rotation.z = (r * Math.PI) / (rayCount / 2);
      godRayGroup.add(ray);
    }
    scene.add(godRayGroup);

    // --- 320 MAGNETIC SHARDS (INSTANCED MESH) ---
    const SHARD_COUNT = 320;
    const shardGeo = new THREE.ConeGeometry(0.32, 1.4, 4);
    shardGeo.rotateX(Math.PI / 3);

    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x141311,
      roughness: 0.18,
      metalness: 0.88,
      flatShading: true
    });

    const instancedShards = new THREE.InstancedMesh(shardGeo, shardMat, SHARD_COUNT);
    instancedShards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedShards);

    // Generate Shard Waypoints for Scroll Formations
    const shardData = [];
    for (let i = 0; i < SHARD_COUNT; i++) {
      const u = Math.random();
      const radius0 = 1.6 + Math.pow(u, 2) * 8.5;
      const theta0 = Math.random() * Math.PI * 2;
      const height0 = (Math.random() - 0.5) * 11;
      const p0 = new THREE.Vector3(
        radius0 * Math.cos(theta0),
        height0,
        radius0 * Math.sin(theta0)
      );

      const side = i % 2 === 0 ? 1 : -1;
      const p1 = new THREE.Vector3(
        side * (6.5 + Math.random() * 7.5),
        (Math.random() - 0.5) * 13,
        (Math.random() - 0.5) * 8
      );

      const p2 = new THREE.Vector3(
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 3.8,
        (Math.random() - 0.5) * 5
      );

      const phi = Math.acos(-1 + (2 * i) / SHARD_COUNT);
      const theta3 = Math.sqrt(SHARD_COUNT * Math.PI) * phi;
      const rad3 = 8.5 + (Math.random() - 0.5) * 2;
      const p3 = new THREE.Vector3(
        rad3 * Math.cos(theta3) * Math.sin(phi),
        rad3 * Math.sin(theta3) * Math.sin(phi) * 0.45,
        rad3 * Math.cos(phi)
      );

      const p4 = new THREE.Vector3(
        (Math.random() - 0.5) * 28,
        Math.random() * 16 - 2,
        (Math.random() - 0.5) * 22
      );

      shardData.push({
        p0,
        p1,
        p2,
        p3,
        p4,
        radius0,
        theta0,
        height0,
        currentPos: p0.clone(),
        baseRot: new THREE.Euler(
          (Math.random() - 0.5) * Math.PI,
          (Math.random() - 0.5) * Math.PI,
          (Math.random() - 0.5) * Math.PI
        ),
        rotSpeedY: 0.015 + Math.random() * 0.025,
        rotSpeedX: 0.008 + Math.random() * 0.015,
        orbitSpeed: 0.012 + (1.0 / (radius0 + 1.2)) * 0.018,
        phase: Math.random() * Math.PI * 2,
        scale: 0.55 + Math.random() * 0.75
      });
    }

    // --- WARM DUST PARTICLES ---
    const DUST_COUNT = 1400;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustVelocities = new Float32Array(DUST_COUNT * 3);

    for (let d = 0; d < DUST_COUNT * 3; d += 3) {
      dustPositions[d] = (Math.random() - 0.5) * 40;
      dustPositions[d + 1] = (Math.random() - 0.5) * 30;
      dustPositions[d + 2] = (Math.random() - 0.5) * 30;

      dustVelocities[d] = (Math.random() - 0.5) * 0.003;
      dustVelocities[d + 1] = 0.0015 + Math.random() * 0.003;
      dustVelocities[d + 2] = (Math.random() - 0.5) * 0.003;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xd6d2cd,
      size: 0.06,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // --- INTERACTION & SCROLL STATE ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const mouse3D = new THREE.Vector3();
    let scrollProgress = 0;
    let targetScrollProgress = 0;

    const handlePointerMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetScrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      }
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // --- RENDER LOOP ---
    const dummy = new THREE.Object3D();
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;
      mouse3D.set(mouse.x * 12, mouse.y * 7, 0);

      // Smooth scroll lerping
      scrollProgress += (targetScrollProgress - scrollProgress) * 0.04;

      // Rotate God Rays & Core
      godRayGroup.rotation.y = elapsedTime * 0.015;
      godRayGroup.rotation.x = Math.sin(elapsedTime * 0.04) * 0.06;
      coreMesh.rotation.y = elapsedTime * 0.035;
      coreMesh.rotation.x = elapsedTime * 0.02;
      haloMesh.rotation.z = -elapsedTime * 0.015;
      haloMesh.lookAt(camera.position);

      // Core Breathing Pulse
      coreLight.intensity = 5.2 + Math.sin(elapsedTime * 0.8) * 0.8;

      // Parallax Camera
      camera.position.x = mouse.x * 0.9;
      camera.position.y = mouse.y * 0.5;
      camera.lookAt(0, 0, 0);

      // Update Shard Swarm Formations
      for (let i = 0; i < SHARD_COUNT; i++) {
        const item = shardData[i];

        const currentAngle = item.theta0 + elapsedTime * item.orbitSpeed;
        const heroDynamicPos = new THREE.Vector3(
          item.radius0 * Math.cos(currentAngle),
          item.height0 + Math.sin(elapsedTime * 0.18 + item.phase) * 0.25,
          item.radius0 * Math.sin(currentAngle)
        );

        let targetPos = new THREE.Vector3();

        if (scrollProgress < 0.25) {
          const t = scrollProgress / 0.25;
          targetPos.lerpVectors(heroDynamicPos, item.p1, t);
        } else if (scrollProgress < 0.5) {
          const t = (scrollProgress - 0.25) / 0.25;
          targetPos.lerpVectors(item.p1, item.p2, t);
        } else if (scrollProgress < 0.75) {
          const t = (scrollProgress - 0.5) / 0.25;
          targetPos.lerpVectors(item.p2, item.p3, t);
        } else {
          const t = (scrollProgress - 0.75) / 0.25;
          targetPos.lerpVectors(item.p3, item.p4, t);
        }

        // Magnetic Cursor Repulsion & Drift
        const distToMouse = item.currentPos.distanceTo(mouse3D);
        if (distToMouse < 4.5) {
          const repelDir = item.currentPos.clone().sub(mouse3D).normalize();
          const force = (4.5 - distToMouse) * 0.55;
          targetPos.addScaledVector(repelDir, force);
          targetPos.y += Math.sin(elapsedTime * 1.5 + item.phase) * force * 0.2;
        }

        item.currentPos.lerp(targetPos, 0.035);

        dummy.position.copy(item.currentPos);
        dummy.rotation.set(
          item.baseRot.x + Math.sin(elapsedTime * 0.03 + item.phase) * 0.15,
          item.baseRot.y + elapsedTime * item.rotSpeedY,
          item.baseRot.z + Math.cos(elapsedTime * 0.025 + item.phase) * 0.12
        );
        dummy.scale.setScalar(item.scale);
        dummy.updateMatrix();

        instancedShards.setMatrixAt(i, dummy.matrix);
      }
      instancedShards.instanceMatrix.needsUpdate = true;

      // Update Floating Dust
      const posArray = dustParticles.geometry.attributes.position.array;
      for (let p = 0; p < DUST_COUNT * 3; p += 3) {
        posArray[p] += dustVelocities[p];
        posArray[p + 1] += dustVelocities[p + 1];
        posArray[p + 2] += dustVelocities[p + 2];

        if (posArray[p + 1] > 18) posArray[p + 1] = -18;
        if (posArray[p] > 22) posArray[p] = -22;
        if (posArray[p] < -22) posArray[p] = 22;
      }
      dustParticles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.95 }}
    />
  );
}

/* =========================================================================
   2. CUSTOM HOOKS: SCROLL REVEAL & TYPEWRITER
   ========================================================================= */

function useScrollReveal(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}

function useTypewriter(text, speed = 8, startTyping = true) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!startTyping) {
      setDisplayedText('');
      return;
    }
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, startTyping]);

  return { displayedText };
}

/* =========================================================================
   3. MINIMALIST VANGUARD ENTERPRISE CLIENT LOGOS
   ========================================================================= */

const VanguardLogos = {
  Fintech: () => (
    <svg className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 40 40" fill="none" stroke="currentColor">
      <polygon points="20,4 36,14 36,34 20,38 4,34 4,14" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="20" y1="4" x2="20" y2="38" strokeWidth="1.25" strokeDasharray="3 3" />
      <circle cx="20" cy="20" r="3" fill="currentColor" />
    </svg>
  ),
  Healthcare: () => (
    <svg className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 40 40" fill="none" stroke="currentColor">
      <rect x="7" y="7" width="26" height="26" strokeWidth="1.75" transform="rotate(45 20 20)" />
      <rect x="12" y="12" width="16" height="16" strokeWidth="1.25" />
      <circle cx="20" cy="20" r="2.5" fill="currentColor" />
    </svg>
  ),
  Hospitality: () => (
    <svg className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 40 40" fill="none" stroke="currentColor">
      <circle cx="20" cy="20" r="15" strokeWidth="1.75" />
      <ellipse cx="20" cy="20" rx="16" ry="6" strokeWidth="1.25" transform="rotate(-30 20 20)" />
      <circle cx="20" cy="20" r="3.5" fill="currentColor" />
    </svg>
  ),
  Academic: () => (
    <svg className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 40 40" fill="none" stroke="currentColor">
      <path d="M20 4 L35 12 L35 28 L20 36 L5 28 L5 12 Z" strokeWidth="1.75" />
      <line x1="20" y1="20" x2="20" y2="8" strokeWidth="1.5" />
      <line x1="20" y1="20" x2="28" y2="20" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="2" fill="currentColor" />
    </svg>
  ),
  Streaming: () => (
    <svg className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 40 40" fill="none" stroke="currentColor">
      <polygon points="20,5 35,32 5,32" strokeWidth="1.75" />
      <polygon points="20,14 28,29 12,29" strokeWidth="1.25" fill="currentColor" fillOpacity="0.15" />
    </svg>
  )
};

/* =========================================================================
   3.5 FINANCIAL SYSTEM UTILITIES & DEFAULT RECORDS
   ========================================================================= */

const safeStorage = {
  get: (key, fallback) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set: (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }
};

const calculateDocTotals = (items = [], discountPercent = 0, taxPercent = 0) => {
  const subtotal = items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0
  );
  const discount = (subtotal * (Number(discountPercent) || 0)) / 100;
  const afterDiscount = subtotal - discount;
  const tax = (afterDiscount * (Number(taxPercent) || 0)) / 100;
  const total = afterDiscount + tax;
  return { subtotal, discount, discountAmount: discount, tax, taxAmount: tax, total };
};

const formatDocCurrency = (amount, currency = 'LKR') => {
  const num = Number(amount) || 0;
  if (currency === 'LKR') {
    return `LKR ${num.toLocaleString('en-LK')}`;
  }
  return `$${num.toLocaleString('en-US')} USD`;
};

const getCurrencySymbol = (currency = 'LKR') => {
  return currency === 'LKR' ? 'Rs.' : '$';
};

const serviceLineItemPresets = [
  { label: 'Hospital LIS Analyzer Protocol Driver (ACL TOP / AU 480)', price: 4500, priceLkr: 1350000, priceUsd: 4500, category: 'healthcare' },
  { label: 'Outpatient Pharmacy Management Module with ACID Medication Ledger', price: 6200, priceLkr: 1860000, priceUsd: 6200, category: 'healthcare' },
  { label: 'NexusTopUp Microservice: JA3/JA4 TLS Fingerprint Spoofing Engine', price: 8500, priceLkr: 2550000, priceUsd: 8500, category: 'fintech' },
  { label: 'Redis Redlock Distributed Mutex for Anti-Double-Spending', price: 3800, priceLkr: 1140000, priceUsd: 3800, category: 'fintech' },
  { label: 'The Menu Enterprise: Contactless QR & WebSocket KDS Platform', price: 9200, priceLkr: 2760000, priceUsd: 9200, category: 'software' },
  { label: 'Multi-Depot Supply Chain ERP with Automated Inventory Balancing', price: 14500, priceLkr: 4350000, priceUsd: 14500, category: 'software' },
  { label: 'Zero-Downtime AWS Cloud Infrastructure & Automated CI/CD Pipeline', price: 4800, priceLkr: 1440000, priceUsd: 4800, category: 'cloud' },
  { label: 'Zero-Trust Network Perimeter & Role-Based Access Control Architecture', price: 5600, priceLkr: 1680000, priceUsd: 5600, category: 'security' },
  { label: 'Private Retrieval-Augmented Generation (RAG) LLM Intelligence Pipeline', price: 7800, priceLkr: 2340000, priceUsd: 7800, category: 'ai' },
  { label: 'National Volunteer Campaign: 12 Editorial Print Flyers & Digital Posters', price: 1800, priceLkr: 540000, priceUsd: 1800, category: 'creative' },
  { label: '30-Day Multi-Platform Social Media Content Calendar & Storytelling Visuals', price: 1400, priceLkr: 420000, priceUsd: 1400, category: 'creative' },
  { label: 'Full Monochromatic Vector Asset Identity & Brand Typography Guidelines', price: 1500, priceLkr: 450000, priceUsd: 1500, category: 'creative' },
  { label: 'Paid Ad Campaign Funnel Orchestration (Meta Ads & Google Search/Display)', price: 2000, priceLkr: 600000, priceUsd: 2000, category: 'creative' },
  { label: '24/7 SLA Telemetry Monitoring & Emergency Triage Retainer (Monthly)', price: 1200, priceLkr: 360000, priceUsd: 1200, category: 'support' }
];

const defaultCompanyProfile = {
  name: 'The Monolith Systems & Creative Studio',
  legalEntity: 'The Monolith Architecture Labs (Pvt) Ltd',
  regNo: 'PV-2026-MNL8824',
  tagline: 'High-Consequence Software Engineering, Cloud Infrastructure & Creative Venture Studio',
  address: 'No. 405, Giriulla / Kurunegala, Sri Lanka · Global Edge Lattice',
  email1: 'dulanja150abeysinghe@gmail.com',
  email2: 'diyanamashi@gmail.com',
  phone1: '+94 76 591 7189',
  phone2: '+94 713765861',
  directors: [
    { name: 'Dulanja Abeysinghe', title: 'Principal Systems Architect' },
    { name: 'Remashi Diyana', title: 'Head of Creative Strategy' }
  ],
  bankDetails: {
    bankName: 'Commercial Bank of Ceylon PLC',
    accountName: 'The Monolith Systems',
    accountNumber: '8014920481',
    branch: 'Kurunegala Corporate Banking',
    swift: 'CCEYLKFX',
    currency: 'LKR & USD Accounts'
  }
};

const defaultInvoices = [
  {
    id: 'inv-2026-001',
    invoiceNumber: 'INV-2026-001',
    quotationRef: 'QUO-2026-085',
    clientName: 'Dr. M. Wickramasinghe',
    clientCompany: 'Biotech Software Solutions (Pvt) Ltd',
    clientEmail: 'procurement@biotechsoftware.com',
    clientAddress: 'Peradeniya Teaching Hospital Complex, Kandy, Sri Lanka',
    issueDate: '2026-09-15',
    dueDate: '2026-10-15',
    domain: 'healthcare',
    currency: 'LKR',
    status: 'Paid',
    items: [
      {
        description: 'Hospital LIS Analyzer Protocol Driver Integration (ACL TOP & AU 480 WAMP bridge)',
        quantity: 1,
        unitPrice: 1350000
      },
      {
        description: 'Outpatient Department (OPD) Pharmacy OS Module with ACID Medication Ledger',
        quantity: 1,
        unitPrice: 1860000
      },
      {
        description: 'On-Site Staff Training, HHIMS Automated Data Sync & Backup Hardening',
        quantity: 1,
        unitPrice: 690000
      }
    ],
    discountPercent: 0,
    taxPercent: 0,
    notes: 'Payment confirmed via Commercial Bank wire transfer. Production SLA telemetry active with 24/7 monitoring.',
    paymentTerms: 'Full settlement received. Thank you for your partnership.'
  },
  {
    id: 'inv-2026-002',
    invoiceNumber: 'INV-2026-002',
    quotationRef: 'QUO-2026-087',
    clientName: 'K. Tan & Partners',
    clientCompany: 'Garena Global Reseller Alliance',
    clientEmail: 'payments@garenareload.net',
    clientAddress: 'Level 18, Marina Bay Financial Tower, Singapore',
    issueDate: '2026-09-28',
    dueDate: '2026-10-28',
    domain: 'fintech',
    currency: 'USD',
    status: 'Pending',
    items: [
      {
        description: 'NexusTopUp Microservice: JA3/JA4 TLS Fingerprint Spoofing & Cloudflare WAF Bypass Engine',
        quantity: 1,
        unitPrice: 8500
      },
      {
        description: 'Redis Redlock Distributed Mutex Implementation for Anti-Double-Spending Protection',
        quantity: 1,
        unitPrice: 3800
      }
    ],
    discountPercent: 0,
    taxPercent: 0,
    notes: 'Milestone 2/2: Final balance due following 14-day production load testing.',
    paymentTerms: 'Payment due within 30 days of invoice date via international wire transfer.'
  },
  {
    id: 'inv-2026-003',
    invoiceNumber: 'INV-2026-003',
    quotationRef: 'QUO-2026-088',
    clientName: 'S. Jayawardena',
    clientCompany: 'The Volunteers Academy',
    clientEmail: 'director@volunteersacademy.org',
    clientAddress: 'Torrington Avenue, Colombo 07, Sri Lanka',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    domain: 'creative_marketing',
    currency: 'LKR',
    status: 'Pending',
    items: [
      {
        description: 'National Volunteer Recruitment Campaign: 12 Editorial Print Flyers & Digital Poster Series',
        quantity: 1,
        unitPrice: 540000
      },
      {
        description: '30-Day Multi-Platform Social Media Content Calendar & Storytelling Visuals',
        quantity: 1,
        unitPrice: 420000
      },
      {
        description: 'Full Monochromatic Vector Asset Identity & Brand Typography Guidelines',
        quantity: 1,
        unitPrice: 450000
      }
    ],
    discountPercent: 0,
    taxPercent: 0,
    notes: 'Creative direction supervised by Remashi Diyana. High-contrast editorial print files provided in CMYK 300DPI.',
    paymentTerms: 'Payment due upon asset delivery via Commercial Bank wire transfer.'
  }
];

const defaultQuotations = [
  {
    id: 'quo-2026-088',
    quotationNumber: 'QUO-2026-088',
    clientName: 'S. Jayawardena',
    clientCompany: 'The Volunteers Academy',
    clientEmail: 'director@volunteersacademy.org',
    clientAddress: 'Torrington Avenue, Colombo 07, Sri Lanka',
    issueDate: '2026-09-20',
    validUntil: '2026-10-20',
    domain: 'creative_marketing',
    currency: 'LKR',
    status: 'Approved',
    items: [
      {
        description: 'National Volunteer Recruitment Campaign: 12 Editorial Print Flyers & Digital Poster Series',
        quantity: 1,
        unitPrice: 540000
      },
      {
        description: '30-Day Multi-Platform Social Media Content Calendar & Storytelling Visuals',
        quantity: 1,
        unitPrice: 420000
      },
      {
        description: 'Full Monochromatic Vector Asset Identity & Brand Typography Guidelines',
        quantity: 1,
        unitPrice: 450000
      }
    ],
    discountPercent: 0,
    taxPercent: 0,
    notes: 'Creative direction led by Remashi Diyana. Includes vector master files, CMYK print files, and digital banners.',
    paymentTerms: '50% upon project kickoff, 50% upon final creative vector asset delivery.'
  },
  {
    id: 'quo-2026-089',
    quotationNumber: 'QUO-2026-089',
    clientName: 'Marcus Vance',
    clientCompany: 'Apex Logistics International',
    clientEmail: 'm.vance@apexlogistics.io',
    clientAddress: '100 King Street West, Suite 5600, Toronto, ON, Canada',
    issueDate: '2026-09-25',
    validUntil: '2026-10-25',
    domain: 'software',
    currency: 'USD',
    status: 'Sent',
    items: [
      {
        description: 'Multi-Depot Supply Chain ERP with Automated Inventory Replenishment & Dynamic PDF Invoicing',
        quantity: 1,
        unitPrice: 14500
      },
      {
        description: 'Zero-Downtime AWS Cloud Infrastructure & Automated CI/CD Docker Pipeline',
        quantity: 1,
        unitPrice: 4800
      },
      {
        description: '24/7 SLA Telemetry Monitoring & Emergency Incident Response (Quarterly Retainer)',
        quantity: 3,
        unitPrice: 1200
      }
    ],
    discountPercent: 5,
    taxPercent: 0,
    notes: 'Quotation valid for 30 calendar days. Systems architecture supervised by Dulanja Abeysinghe.',
    paymentTerms: '40% upfront deposit, 30% after UAT staging delivery, 30% upon final production deployment.'
  },
  {
    id: 'quo-2026-090',
    quotationNumber: 'QUO-2026-090',
    clientName: 'Elena Rostova',
    clientCompany: 'Aura Hospitality Group',
    clientEmail: 'tech@auradining.co.uk',
    clientAddress: 'Mayfair, London W1J 8AJ, United Kingdom',
    issueDate: '2026-09-30',
    validUntil: '2026-10-30',
    domain: 'software',
    currency: 'LKR',
    status: 'Draft',
    items: [
      {
        description: 'The Menu Enterprise: Contactless QR Dining & Real-Time Pusher WebSocket Kitchen Display System',
        quantity: 1,
        unitPrice: 2760000
      },
      {
        description: 'Multi-Tenant Billing Engine, Stripe Connect Integration & Dynamic RBAC Permission Layer',
        quantity: 1,
        unitPrice: 1260000
      },
      {
        description: 'Bespoke Tactile Restaurant Menu Flyer & Table QR Standee Print Collateral Package',
        quantity: 1,
        unitPrice: 360000
      }
    ],
    discountPercent: 0,
    taxPercent: 0,
    notes: 'Full venture integration combining real-time dining software with in-venue physical marketing collateral.',
    paymentTerms: '50% upon contract signing, 50% upon venue deployment and staff hardware training.'
  }
];

/* =========================================================================
   3.5 EXECUTIVE ADMIN PORTAL SUB-COMPONENTS
   ========================================================================= */

function AdminLoginModal({
  isOpen,
  onClose,
  username,
  setUsername,
  password,
  setPassword,
  error,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#141311] border border-[#a39d96]/30 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#a39d96]/15 bg-[#181614]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#252320] border border-[#a39d96]/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#f5f4f0]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#a39d96] uppercase block">
                EXECUTIVE CONSOLE // LEVEL 5 ACCESS
              </span>
              <span className="text-sm font-bold text-[#f5f4f0] font-sans">
                The Monolith Portal Authentication
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7a756f] hover:text-[#f5f4f0] transition-colors"
            aria-label="Close authentication"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 bg-[#0a0908]">
          <div className="p-3.5 rounded-xl bg-[#141311] border border-[#a39d96]/15 text-xs text-[#a39d96] leading-relaxed">
            Restricted executive security enclave. Enter your authorized operator credentials to access company invoicing, sales quotations, and financial ledger.
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#a39d96] block">
              Architect Operator ID (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#141311] border border-[#a39d96]/20 text-[#f5f4f0] font-mono text-sm focus:outline-none focus:border-[#d6d2cd] transition-colors placeholder:text-[#7a756f]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#a39d96] block">
              Security Cipher (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#141311] border border-[#a39d96]/20 text-[#f5f4f0] font-mono text-sm focus:outline-none focus:border-[#d6d2cd] transition-colors placeholder:text-[#7a756f]"
            />
          </div>

          <div className="pt-1 text-[11px] font-mono text-[#7a756f] flex items-center justify-between">
            <span>Security: Level 5 Enclave</span>
            <span className="text-[#a39d96]">Dual-Key Protected</span>
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-3 rounded-xl bg-[#e3dfd8] text-[#0a0908] font-bold text-xs tracking-wider uppercase hover:bg-[#f5f4f0] transition-colors flex items-center justify-center gap-2 shadow-taupe-glow"
          >
            <Key className="w-4 h-4 text-[#0a0908]" />
            AUTHENTICATE & ENTER PORTAL
          </button>
        </form>
      </div>
    </div>
  );
}

function DocumentEditorModal({
  isOpen,
  type,
  mode,
  data,
  onClose,
  onSave
}) {
  if (!isOpen || !data) return null;

  const isInvoice = type === 'invoice';

  const [formData, setFormData] = useState(() => {
    const cloned = JSON.parse(JSON.stringify(data));
    if (!cloned.currency) cloned.currency = 'LKR';
    return cloned;
  });

  const totals = useMemo(() => {
    return calculateDocTotals(formData.items || [], formData.discountPercent || 0, formData.taxPercent || 0);
  }, [formData.items, formData.discountPercent, formData.taxPercent]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const items = [...(prev.items || [])];
      items[index] = {
        ...items[index],
        [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) || 0 : value
      };
      return { ...prev, items };
    });
  };

  const handleAddItem = () => {
    const isLkr = (formData.currency || 'LKR') === 'LKR';
    setFormData((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          description: 'Bespoke Software / Creative Architecture Module',
          quantity: 1,
          unitPrice: isLkr ? 450000 : 1500
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleAddPreset = (preset) => {
    const isLkr = (formData.currency || 'LKR') === 'LKR';
    const unitPrice = isLkr
      ? (preset.priceLkr || (preset.price ? preset.price * 300 : 300000))
      : (preset.priceUsd || (preset.price ? preset.price : 1000));

    setFormData((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        { description: preset.label, quantity: 1, unitPrice }
      ]
    }));
  };

  const handleConvertAllRates = () => {
    const isCurrentlyLkr = (formData.currency || 'LKR') === 'LKR';
    const targetCurr = isCurrentlyLkr ? 'USD' : 'LKR';
    const factor = isCurrentlyLkr ? (1 / 300) : 300;

    setFormData((prev) => ({
      ...prev,
      currency: targetCurr,
      items: (prev.items || []).map((it) => ({
        ...it,
        unitPrice: Math.round((Number(it.unitPrice) || 0) * factor)
      }))
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.items || formData.items.length === 0) {
      alert('Please add at least one line item to the document.');
      return;
    }
    onSave(formData);
  };

  const currentCurrency = formData.currency || 'LKR';
  const currencySymbol = getCurrencySymbol(currentCurrency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-3xl bg-[#141311] border border-[#a39d96]/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#a39d96]/15 bg-[#181614]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#252320] border border-[#a39d96]/20 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-[#f5f4f0]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#a39d96] uppercase block">
                {mode === 'create' ? 'NEW DOCUMENT GENERATOR' : 'DOCUMENT REVISION ENGINE'}
              </span>
              <span className="text-sm font-bold text-[#f5f4f0] font-sans">
                {isInvoice ? 'Invoice' : 'Sales Quotation'} : {isInvoice ? formData.invoiceNumber : formData.quotationNumber}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7a756f] hover:text-[#f5f4f0] transition-colors"
            aria-label="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0a0908] text-xs">
          {/* Currency Selector & Quick Converter Strip */}
          <div className="p-4 rounded-2xl bg-[#141311] border border-[#a39d96]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#a39d96]">
                Billing Currency:
              </span>
              <div className="inline-flex rounded-xl p-1 bg-[#0a0908] border border-[#a39d96]/20 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleFieldChange('currency', 'LKR')}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                    currentCurrency === 'LKR'
                      ? 'bg-[#f5f4f0] text-[#0a0908] shadow-sm'
                      : 'text-[#a39d96] hover:text-[#f5f4f0]'
                  }`}
                >
                  🇱🇰 LKR (Rs.)
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('currency', 'USD')}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                    currentCurrency === 'USD'
                      ? 'bg-[#f5f4f0] text-[#0a0908] shadow-sm'
                      : 'text-[#a39d96] hover:text-[#f5f4f0]'
                  }`}
                >
                  🌐 USD ($)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConvertAllRates}
              className="px-3 py-1.5 rounded-lg bg-[#1c1a17] text-[#d6d2cd] border border-[#a39d96]/20 hover:text-[#f5f4f0] hover:bg-[#252320] font-mono text-[11px] transition-colors"
              title="Automatically convert line item prices between USD and LKR (using standard 1:300 rate)"
            >
              🔄 Auto-Convert Rates ({currentCurrency === 'LKR' ? 'LKR → USD' : 'USD → LKR'})
            </button>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#141311] border border-[#a39d96]/15">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                Document Number
              </label>
              <input
                type="text"
                value={isInvoice ? formData.invoiceNumber : formData.quotationNumber}
                onChange={(e) =>
                  handleFieldChange(isInvoice ? 'invoiceNumber' : 'quotationNumber', e.target.value)
                }
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono focus:outline-none focus:border-[#d6d2cd]"
              />
            </div>

            {isInvoice && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                  Quotation Ref
                </label>
                <input
                  type="text"
                  value={formData.quotationRef || ''}
                  onChange={(e) => handleFieldChange('quotationRef', e.target.value)}
                  placeholder="Optional QUO Ref"
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono focus:outline-none focus:border-[#d6d2cd]"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issueDate || ''}
                onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono focus:outline-none focus:border-[#d6d2cd]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                {isInvoice ? 'Payment Due Date' : 'Valid Until'}
              </label>
              <input
                type="date"
                value={isInvoice ? formData.dueDate || '' : formData.validUntil || ''}
                onChange={(e) =>
                  handleFieldChange(isInvoice ? 'dueDate' : 'validUntil', e.target.value)
                }
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono focus:outline-none focus:border-[#d6d2cd]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono focus:outline-none focus:border-[#d6d2cd]"
              >
                {isInvoice ? (
                  <>
                    <option value="Paid">Paid (Settled)</option>
                    <option value="Pending">Pending (Outstanding)</option>
                    <option value="Draft">Draft</option>
                  </>
                ) : (
                  <>
                    <option value="Sent">Sent (Awaiting Approval)</option>
                    <option value="Approved">Approved (Ready to Invoice)</option>
                    <option value="Draft">Draft</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Client Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#141311] border border-[#a39d96]/15">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                Client Contact Person
              </label>
              <input
                type="text"
                value={formData.clientName || ''}
                onChange={(e) => handleFieldChange('clientName', e.target.value)}
                placeholder="e.g. Dr. Wickramasinghe / S. Jayawardena"
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] focus:outline-none focus:border-[#d6d2cd]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                Client Company / Organization
              </label>
              <input
                type="text"
                value={formData.clientCompany || ''}
                onChange={(e) => handleFieldChange('clientCompany', e.target.value)}
                placeholder="e.g. Biotech Software / The Volunteers Academy"
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] focus:outline-none focus:border-[#d6d2cd]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={formData.clientEmail || ''}
                onChange={(e) => handleFieldChange('clientEmail', e.target.value)}
                placeholder="client@company.com"
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] focus:outline-none focus:border-[#d6d2cd]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                Physical / Corporate Address
              </label>
              <input
                type="text"
                value={formData.clientAddress || ''}
                onChange={(e) => handleFieldChange('clientAddress', e.target.value)}
                placeholder="Colombo / London / Singapore"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] focus:outline-none focus:border-[#d6d2cd]"
              />
            </div>
          </div>

          {/* Quick Presets Strip */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#a39d96] uppercase tracking-wider block">
              + QUICK SERVICE PRESETS (CLICK TO APPEND TO LINE ITEMS IN {currentCurrency}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {serviceLineItemPresets.slice(0, 8).map((preset, idx) => {
                const displayPrice = currentCurrency === 'LKR'
                  ? `Rs. ${(preset.priceLkr || preset.price * 300).toLocaleString()}`
                  : `$${(preset.priceUsd || preset.price).toLocaleString()}`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-[#1c1a17] text-[11px] font-mono text-[#d6d2cd] border border-[#a39d96]/15 hover:border-[#f5f4f0]/50 hover:bg-[#252320] transition-colors"
                  >
                    + {preset.label.slice(0, 30)}... ({displayPrice})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#f5f4f0] font-semibold">
                Itemized Service Breakdown ({formData.items?.length || 0})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 rounded-lg bg-[#1c1a17] text-xs font-mono text-[#f5f4f0] border border-[#a39d96]/20 hover:bg-[#252320] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item ({currentCurrency})
              </button>
            </div>

            <div className="space-y-2">
              {formData.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl bg-[#141311] border border-[#a39d96]/15"
                >
                  <span className="text-[10px] font-mono text-[#7a756f] w-6 shrink-0 text-center">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Service description"
                    required
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] text-xs focus:outline-none focus:border-[#d6d2cd]"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        required
                        className="w-full px-2 py-1.5 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono text-xs text-right focus:outline-none focus:border-[#d6d2cd]"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        min="0"
                        step={currentCurrency === 'LKR' ? '1000' : '50'}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        placeholder={`Rate (${currencySymbol})`}
                        required
                        className="w-full px-2 py-1.5 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono text-xs text-right focus:outline-none focus:border-[#d6d2cd]"
                      />
                    </div>
                    <span className="w-32 text-right font-mono text-[#f5f4f0] font-semibold text-xs truncate">
                      {formatDocCurrency((item.quantity || 1) * (item.unitPrice || 0), currentCurrency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={formData.items.length <= 1}
                      className="p-1.5 rounded-lg text-[#7a756f] hover:text-red-400 hover:bg-[#1c1a17] transition-colors disabled:opacity-30"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financials & Calculation */}
          <div className="p-4 rounded-2xl bg-[#141311] border border-[#a39d96]/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercent || 0}
                  onChange={(e) => handleFieldChange('discountPercent', Number(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono text-xs text-right"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                  Tax / VAT (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.taxPercent || 0}
                  onChange={(e) => handleFieldChange('taxPercent', Number(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 rounded-lg bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono text-xs text-right"
                />
              </div>
            </div>

            <div className="w-full md:w-80 font-mono space-y-1 text-right">
              <div className="flex justify-between text-[#a39d96]">
                <span>SUBTOTAL:</span>
                <span>{formatDocCurrency(totals.subtotal, currentCurrency)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-[#7a756f]">
                  <span>DISCOUNT ({formData.discountPercent}%):</span>
                  <span>-{formatDocCurrency(totals.discountAmount, currentCurrency)}</span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-[#a39d96]">
                  <span>TAX ({formData.taxPercent}%):</span>
                  <span>+{formatDocCurrency(totals.taxAmount, currentCurrency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#f5f4f0] pt-2 border-t border-[#a39d96]/20">
                <span>GRAND TOTAL:</span>
                <span>{formatDocCurrency(totals.total, currentCurrency)}</span>
              </div>
              <div className="text-[10px] text-[#7a756f] pt-0.5">
                {currentCurrency === 'LKR'
                  ? `≈ $${Math.round(totals.total / 300).toLocaleString()} USD (@ 300 LKR/USD)`
                  : `≈ LKR ${(totals.total * 300).toLocaleString()} (@ 300 LKR/USD)`}
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                Project Notes & Scope Specifications
              </label>
              <textarea
                rows="3"
                value={formData.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Specific architecture milestones, deliverables, and SLAs..."
                className="w-full p-3 rounded-xl bg-[#141311] border border-[#a39d96]/20 text-[#f5f4f0] focus:outline-none focus:border-[#d6d2cd]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#a39d96] block mb-1">
                Payment Terms & Remittance Guidance
              </label>
              <textarea
                rows="3"
                value={formData.paymentTerms || ''}
                onChange={(e) => handleFieldChange('paymentTerms', e.target.value)}
                placeholder="Payment due within 30 days via Commercial Bank of Ceylon PLC wire transfer."
                className="w-full p-3 rounded-xl bg-[#141311] border border-[#a39d96]/20 text-[#f5f4f0] focus:outline-none focus:border-[#d6d2cd]"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#a39d96]/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#141311] text-[#a39d96] border border-[#a39d96]/20 font-mono text-xs hover:text-[#f5f4f0] hover:bg-[#1c1a17] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#e3dfd8] text-[#0a0908] font-bold text-xs tracking-wider uppercase hover:bg-[#f5f4f0] transition-colors flex items-center gap-2 shadow-taupe-glow"
            >
              <FileCheck className="w-4 h-4 text-[#0a0908]" />
              {mode === 'create' ? 'Save & Register Document' : 'Update Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DocumentPrintModal({
  isOpen,
  type,
  data,
  companyProfile,
  onClose,
  onEdit
}) {
  if (!isOpen || !data) return null;

  const isInvoice = type === 'invoice';
  const totals = calculateDocTotals(data.items || [], data.discountPercent || 0, data.taxPercent || 0);
  const docCurrency = data.currency || 'LKR';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="monolith-print-modal-wrapper"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="monolith-print-modal-inner"
        className="w-full max-w-4xl rounded-3xl bg-[#141311] border border-[#a39d96]/30 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Top Control Bar (Hidden when printing via CSS) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-[#a39d96]/15 bg-[#181614]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#252320] border border-[#a39d96]/20 flex items-center justify-center">
              <Printer className="w-4 h-4 text-[#f5f4f0]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#a39d96] uppercase block">
                OFFICIAL MONOLITH DOSSIER PREVIEW
              </span>
              <span className="text-sm font-bold text-[#f5f4f0] font-sans">
                {isInvoice ? 'Commercial Invoice' : 'Sales Quotation'} : {isInvoice ? data.invoiceNumber : data.quotationNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(type, data)}
              className="px-4 py-2 rounded-xl bg-[#1c1a17] text-[#f5f4f0] border border-[#a39d96]/20 font-mono text-xs hover:bg-[#252320] transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Document
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#e3dfd8] text-[#0a0908] font-bold text-xs tracking-wider uppercase hover:bg-[#f5f4f0] transition-colors flex items-center gap-1.5 shadow-taupe-glow"
            >
              <Printer className="w-3.5 h-3.5 text-[#0a0908]" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7a756f] hover:text-[#f5f4f0] transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-6 sm:p-12 overflow-y-auto flex-1 bg-[#0a0908] text-xs">
          <div id="monolith-printable-doc" className="max-w-3xl mx-auto space-y-8 bg-[#141311] p-8 sm:p-10 rounded-2xl border border-[#a39d96]/20 text-[#f5f4f0]">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#a39d96]/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-5 rounded-sm bg-[#e3dfd8] flex items-center justify-center">
                    <div className="w-1.5 h-2.5 bg-[#0a0908] rounded-[0.5px]" />
                  </div>
                  <span className="font-display font-bold tracking-widest text-sm uppercase text-[#f5f4f0]">
                    The Monolith
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#a39d96]">
                  Systems Architecture Labs & Creative Venture Studio
                </p>
                <p className="text-[10px] font-mono text-[#7a756f]">
                  Kurunegala / Colombo, Sri Lanka · Global Edge Lattice
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1 font-mono">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#f5f4f0] text-[#0a0908]">
                  {isInvoice ? 'TAX INVOICE' : 'SALES QUOTATION'}
                </span>
                <p className="text-sm font-bold text-[#f5f4f0]">
                  {isInvoice ? data.invoiceNumber : data.quotationNumber}
                </p>
                <p className="text-[11px] text-[#a39d96]">
                  Status: <strong className="text-[#f5f4f0]">{data.status}</strong>
                </p>
              </div>
            </div>

            {/* From & Bill To Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-mono">
              <div className="space-y-1 p-4 rounded-xl bg-[#0a0908] border border-[#a39d96]/15">
                <span className="text-[10px] text-[#7a756f] uppercase tracking-wider block mb-1">
                  // ISSUING AUTHORITY (FOUNDING ARCHITECTS)
                </span>
                <p className="font-bold text-[#f5f4f0]">The Monolith Architecture Labs (Pvt) Ltd</p>
                <p className="text-[#d6d2cd]">Dulanja Abeysinghe (Principal Systems Architect)</p>
                <p className="text-[#d6d2cd]">Remashi Diyana (Head of Creative Strategy)</p>
                <p className="text-[#a39d96]">dulanja150abeysinghe@gmail.com · +94 76 591 7189</p>
                <p className="text-[#a39d96]">diyanamashi@gmail.com · +94 713765861</p>
              </div>

              <div className="space-y-1 p-4 rounded-xl bg-[#0a0908] border border-[#a39d96]/15">
                <span className="text-[10px] text-[#7a756f] uppercase tracking-wider block mb-1">
                  // BILLED / QUOTED TO CLIENT
                </span>
                <p className="font-bold text-[#f5f4f0]">{data.clientCompany || 'Client Enterprise'}</p>
                <p className="text-[#d6d2cd]">Attn: {data.clientName}</p>
                <p className="text-[#a39d96]">{data.clientEmail}</p>
                <p className="text-[#7a756f]">{data.clientAddress || 'Global Deployment'}</p>
                <div className="pt-2 text-[10px] text-[#a39d96] flex justify-between">
                  <span>Issued: {data.issueDate}</span>
                  <span>{isInvoice ? `Due: ${data.dueDate}` : `Valid Until: ${data.validUntil}`}</span>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#a39d96]/20 text-[#a39d96] uppercase text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Scope Description</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate ({docCurrency})</th>
                    <th className="py-2.5 px-3 text-right">Amount ({docCurrency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#a39d96]/10">
                  {data.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 text-[#7a756f]">0{idx + 1}</td>
                      <td className="py-3 px-3 text-[#f5f4f0] font-sans font-medium">
                        {item.description}
                      </td>
                      <td className="py-3 px-3 text-right text-[#d6d2cd]">{item.quantity}</td>
                      <td className="py-3 px-3 text-right text-[#d6d2cd]">
                        {formatDocCurrency(item.unitPrice, docCurrency)}
                      </td>
                      <td className="py-3 px-3 text-right text-[#f5f4f0] font-semibold">
                        {formatDocCurrency((item.quantity || 1) * (item.unitPrice || 0), docCurrency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Wire Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#a39d96]/20">
              <div className="p-4 rounded-xl bg-[#0a0908] border border-[#a39d96]/15 font-mono text-[11px] space-y-1">
                <span className="text-[10px] text-[#7a756f] uppercase tracking-wider block mb-1">
                  OFFICIAL WIRE REMITTANCE DETAILS ({docCurrency})
                </span>
                <p className="text-[#f5f4f0] font-semibold">Bank: Commercial Bank of Ceylon PLC</p>
                <p className="text-[#d6d2cd]">Account Name: The Monolith Systems</p>
                <p className="text-[#d6d2cd]">Account No: 8014920481 ({docCurrency === 'USD' ? 'FCBU USD Wire' : 'LKR Operating'})</p>
                <p className="text-[#a39d96]">Branch: Kurunegala Corporate Banking (034)</p>
                <p className="text-[#a39d96]">SWIFT / BIC: CCEYLKFX</p>
              </div>

              <div className="font-mono text-xs space-y-1.5 self-end">
                <div className="flex justify-between text-[#a39d96]">
                  <span>SUBTOTAL:</span>
                  <span>{formatDocCurrency(totals.subtotal, docCurrency)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-[#7a756f]">
                    <span>DISCOUNT ({data.discountPercent}%):</span>
                    <span>-{formatDocCurrency(totals.discountAmount, docCurrency)}</span>
                  </div>
                )}
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-[#a39d96]">
                    <span>TAX / VAT ({data.taxPercent}%):</span>
                    <span>+{formatDocCurrency(totals.taxAmount, docCurrency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#f5f4f0] pt-2 border-t border-[#a39d96]/30">
                  <span>TOTAL DUE:</span>
                  <span>{formatDocCurrency(totals.total, docCurrency)}</span>
                </div>
                <div className="text-[10px] text-[#7a756f] text-right pt-0.5">
                  {docCurrency === 'LKR'
                    ? `≈ $${Math.round(totals.total / 300).toLocaleString()} USD (@ 300 LKR/USD)`
                    : `≈ LKR ${(totals.total * 300).toLocaleString()} (@ 300 LKR/USD)`}
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(data.notes || data.paymentTerms) && (
              <div className="p-4 rounded-xl bg-[#0a0908] border border-[#a39d96]/10 font-mono text-[11px] space-y-2 text-[#a39d96]">
                {data.notes && (
                  <p>
                    <strong className="text-[#d6d2cd]">Scope & Notes:</strong> {data.notes}
                  </p>
                )}
                {data.paymentTerms && (
                  <p>
                    <strong className="text-[#d6d2cd]">Payment Terms:</strong> {data.paymentTerms}
                  </p>
                )}
              </div>
            )}

            {/* Signatures */}
            <div className="pt-8 border-t border-[#a39d96]/20 flex flex-col sm:flex-row justify-between items-center gap-6 font-mono text-[11px]">
              <div className="text-center sm:text-left space-y-1">
                <div className="w-44 border-b border-[#a39d96]/40 pb-1 mb-1 font-serif italic text-sm text-[#f5f4f0]">
                  Dulanja Abeysinghe
                </div>
                <p className="font-bold text-[#f5f4f0]">Dulanja Abeysinghe</p>
                <p className="text-[#7a756f]">Co-Founder & Principal Systems Architect</p>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <div className="w-44 border-b border-[#a39d96]/40 pb-1 mb-1 font-serif italic text-sm text-[#f5f4f0] sm:ml-auto">
                  Remashi Diyana
                </div>
                <p className="font-bold text-[#f5f4f0]">Remashi Diyana</p>
                <p className="text-[#7a756f]">Co-Founder & Head of Creative Strategy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPortalModal({
  isOpen,
  onClose,
  onLogout,
  activeTab,
  setActiveTab,
  invoices,
  quotations,
  companyProfile,
  kpiStats,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onOpenCreateInvoice,
  onOpenCreateQuotation,
  onOpenEditDocument,
  onOpenPreviewDocument,
  onDuplicateDocument,
  onDeleteDocument,
  onConvertQuotationToInvoice,
  onToggleStatus
}) {
  if (!isOpen) return null;

  const [currencyFilter, setCurrencyFilter] = useState('ALL');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientCompany.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    const invCurr = inv.currency || 'LKR';
    const matchesCurrency = currencyFilter === 'ALL' || invCurr === currencyFilter;
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const filteredQuotations = quotations.filter((quo) => {
    const matchesSearch =
      quo.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      quo.clientName.toLowerCase().includes(search.toLowerCase()) ||
      quo.clientCompany.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || quo.status === statusFilter;
    const quoCurr = quo.currency || 'LKR';
    const matchesCurrency = currencyFilter === 'ALL' || quoCurr === currencyFilter;
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-6xl rounded-3xl bg-[#141311] border border-[#a39d96]/30 shadow-2xl overflow-hidden flex flex-col h-[94vh]">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-[#a39d96]/15 bg-[#181614] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#252320] border border-[#a39d96]/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#f5f4f0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-widest text-xs uppercase text-[#f5f4f0]">
                  The Monolith
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#252320] text-[#d6d2cd] border border-[#a39d96]/20">
                  EXECUTIVE PORTAL
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#a39d96]">
                Authenticated: <strong className="text-[#f5f4f0]">duladiya</strong> // Principal Systems Architect
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0a0908] border border-[#a39d96]/15 font-mono text-xs">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setStatusFilter('All');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#e3dfd8] text-[#0a0908] font-bold shadow-sm'
                  : 'text-[#a39d96] hover:text-[#f5f4f0]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('invoices');
                setStatusFilter('All');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'invoices'
                  ? 'bg-[#e3dfd8] text-[#0a0908] font-bold shadow-sm'
                  : 'text-[#a39d96] hover:text-[#f5f4f0]'
              }`}
            >
              Invoices
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#141311] text-[#f5f4f0]">
                {invoices.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('quotations');
                setStatusFilter('All');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'quotations'
                  ? 'bg-[#e3dfd8] text-[#0a0908] font-bold shadow-sm'
                  : 'text-[#a39d96] hover:text-[#f5f4f0]'
              }`}
            >
              Quotations
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#141311] text-[#f5f4f0]">
                {quotations.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                setStatusFilter('All');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#e3dfd8] text-[#0a0908] font-bold shadow-sm'
                  : 'text-[#a39d96] hover:text-[#f5f4f0]'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateInvoice}
              className="px-3 py-1.5 rounded-xl bg-[#1c1a17] text-[#f5f4f0] border border-[#a39d96]/20 font-mono text-xs hover:bg-[#252320] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Invoice
            </button>
            <button
              onClick={onOpenCreateQuotation}
              className="px-3 py-1.5 rounded-xl bg-[#1c1a17] text-[#f5f4f0] border border-[#a39d96]/20 font-mono text-xs hover:bg-[#252320] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Quotation
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl text-[#7a756f] hover:text-red-400 hover:bg-[#1c1a17] transition-colors"
              title="Logout from Executive Portal"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#7a756f] hover:text-[#f5f4f0] transition-colors"
              aria-label="Close portal modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0908] text-xs">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              {/* KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#141311] border border-[#a39d96]/15 space-y-1">
                  <div className="flex items-center justify-between text-[#a39d96] font-mono text-[10px] uppercase">
                    <span>Total Invoiced</span>
                    <DollarSign className="w-3.5 h-3.5 text-[#d6d2cd]" />
                  </div>
                  <div className="text-xl font-bold font-sans text-[#f5f4f0]">
                    LKR {(kpiStats.lkrInvoiced || 0).toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-[#d6d2cd]">
                    + ${(kpiStats.usdInvoiced || 0).toLocaleString()} USD
                  </div>
                  <p className="text-[10px] font-mono text-[#7a756f]">
                    {kpiStats.invoicesCount} total registered invoices
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#141311] border border-[#a39d96]/15 space-y-1">
                  <div className="flex items-center justify-between text-[#a39d96] font-mono text-[10px] uppercase">
                    <span>Settled / Paid</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d6d2cd]" />
                  </div>
                  <div className="text-xl font-bold font-sans text-[#f5f4f0]">
                    LKR {(kpiStats.lkrPaid || 0).toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-[#d6d2cd]">
                    + ${(kpiStats.usdPaid || 0).toLocaleString()} USD
                  </div>
                  <p className="text-[10px] font-mono text-[#7a756f]">
                    {kpiStats.paidCount} fulfilled enterprise accounts
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#141311] border border-[#a39d96]/15 space-y-1">
                  <div className="flex items-center justify-between text-[#a39d96] font-mono text-[10px] uppercase">
                    <span>Outstanding</span>
                    <Clock className="w-3.5 h-3.5 text-[#d6d2cd]" />
                  </div>
                  <div className="text-xl font-bold font-sans text-[#f5f4f0]">
                    LKR {(kpiStats.lkrPending || 0).toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-[#d6d2cd]">
                    + ${(kpiStats.usdPending || 0).toLocaleString()} USD
                  </div>
                  <p className="text-[10px] font-mono text-[#7a756f]">
                    Awaiting client wire settlement
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#141311] border border-[#a39d96]/15 space-y-1">
                  <div className="flex items-center justify-between text-[#a39d96] font-mono text-[10px] uppercase">
                    <span>Quotation Pipeline</span>
                    <FileText className="w-3.5 h-3.5 text-[#d6d2cd]" />
                  </div>
                  <div className="text-xl font-bold font-sans text-[#f5f4f0]">
                    LKR {(kpiStats.lkrQuotations || 0).toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-[#d6d2cd]">
                    + ${(kpiStats.usdQuotations || 0).toLocaleString()} USD
                  </div>
                  <p className="text-[10px] font-mono text-[#7a756f]">
                    {kpiStats.approvedQuotes} approved proposals
                  </p>
                </div>
              </div>

              {/* Quick Launch Banner */}
              <div className="p-6 rounded-2xl bg-[#141311] border border-[#a39d96]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#a39d96]">
                    // EXECUTIVE ACTIONS & BILLING DISPATCH
                  </span>
                  <h3 className="text-lg font-bold text-[#f5f4f0] font-sans">
                    Generate an Invoice or Proposal in Seconds
                  </h3>
                  <p className="text-[#a39d96] text-xs">
                    Pre-populated with Commercial Bank of Ceylon wire details and co-founder signatures.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onOpenCreateInvoice}
                    className="px-5 py-2.5 rounded-xl bg-[#e3dfd8] text-[#0a0908] font-bold text-xs uppercase tracking-wider hover:bg-[#f5f4f0] transition-colors flex items-center gap-1.5 shadow-taupe-glow"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0a0908]" />
                    Generate Invoice
                  </button>
                  <button
                    onClick={onOpenCreateQuotation}
                    className="px-5 py-2.5 rounded-xl bg-[#1c1a17] text-[#f5f4f0] border border-[#a39d96]/30 font-bold text-xs uppercase tracking-wider hover:bg-[#252320] transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#f5f4f0]" />
                    Sales Quotation
                  </button>
                </div>
              </div>

              {/* Two Column Section: Recent Invoices & Recent Quotations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Invoices */}
                <div className="p-5 rounded-2xl bg-[#141311] border border-[#a39d96]/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#f5f4f0] font-semibold">
                      Recent Invoices
                    </span>
                    <button
                      onClick={() => setActiveTab('invoices')}
                      className="text-[11px] font-mono text-[#a39d96] hover:text-[#f5f4f0] flex items-center gap-1"
                    >
                      View All ({invoices.length}) <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {invoices.slice(0, 3).map((inv) => {
                      const { total } = calculateDocTotals(inv.items, inv.discountPercent, inv.taxPercent);
                      return (
                        <div
                          key={inv.id}
                          className="p-3 rounded-xl bg-[#0a0908] border border-[#a39d96]/10 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#f5f4f0] text-xs">
                                {inv.invoiceNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                  inv.status === 'Paid'
                                    ? 'bg-[#f5f4f0] text-[#0a0908] font-bold'
                                    : 'bg-[#1c1a17] text-[#d6d2cd] border border-[#a39d96]/20'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#a39d96] mt-0.5">{inv.clientCompany}</p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <span className="font-mono font-bold text-[#f5f4f0] text-xs block">
                                {formatDocCurrency(total, inv.currency)}
                              </span>
                              <span className="text-[10px] font-mono text-[#7a756f]">
                                Due {inv.dueDate}
                              </span>
                            </div>
                            <button
                              onClick={() => onOpenPreviewDocument('invoice', inv)}
                              className="p-1.5 rounded-lg bg-[#1c1a17] text-[#d6d2cd] hover:text-[#f5f4f0] hover:bg-[#252320]"
                              title="Print / Preview"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenEditDocument('invoice', inv)}
                              className="p-1.5 rounded-lg bg-[#1c1a17] text-[#d6d2cd] hover:text-[#f5f4f0] hover:bg-[#252320]"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Quotations */}
                <div className="p-5 rounded-2xl bg-[#141311] border border-[#a39d96]/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#f5f4f0] font-semibold">
                      Recent Sales Quotations
                    </span>
                    <button
                      onClick={() => setActiveTab('quotations')}
                      className="text-[11px] font-mono text-[#a39d96] hover:text-[#f5f4f0] flex items-center gap-1"
                    >
                      View All ({quotations.length}) <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {quotations.slice(0, 3).map((quo) => {
                      const { total } = calculateDocTotals(quo.items, quo.discountPercent, quo.taxPercent);
                      return (
                        <div
                          key={quo.id}
                          className="p-3 rounded-xl bg-[#0a0908] border border-[#a39d96]/10 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#f5f4f0] text-xs">
                                {quo.quotationNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                  quo.status === 'Approved'
                                    ? 'bg-[#f5f4f0] text-[#0a0908] font-bold'
                                    : 'bg-[#1c1a17] text-[#d6d2cd] border border-[#a39d96]/20'
                                }`}
                              >
                                {quo.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#a39d96] mt-0.5">{quo.clientCompany}</p>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <span className="font-mono font-bold text-[#f5f4f0] text-xs block">
                                {formatDocCurrency(total, quo.currency)}
                              </span>
                              <span className="text-[10px] font-mono text-[#7a756f]">
                                Valid {quo.validUntil}
                              </span>
                            </div>
                            <button
                              onClick={() => onConvertQuotationToInvoice(quo)}
                              className="px-2 py-1 rounded bg-[#1c1a17] text-[10px] font-mono text-[#e3dfd8] border border-[#a39d96]/20 hover:bg-[#252320]"
                              title="Convert to Invoice"
                            >
                              Convert
                            </button>
                            <button
                              onClick={() => onOpenPreviewDocument('quotation', quo)}
                              className="p-1.5 rounded-lg bg-[#1c1a17] text-[#d6d2cd] hover:text-[#f5f4f0] hover:bg-[#252320]"
                              title="Print / Preview"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#141311] border border-[#a39d96]/15">
                <div className="flex-1 flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#7a756f] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search invoices by number, client, company..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono text-xs focus:outline-none focus:border-[#d6d2cd]"
                    />
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {['All', 'Paid', 'Pending', 'Draft'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          statusFilter === status
                            ? 'bg-[#e3dfd8] text-[#0a0908] font-bold'
                            : 'bg-[#0a0908] text-[#a39d96] border border-[#a39d96]/15 hover:text-[#f5f4f0]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <div className="hidden sm:flex items-center gap-1 font-mono text-xs pl-2 border-l border-[#a39d96]/20">
                    {['ALL', 'LKR', 'USD'].map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setCurrencyFilter(curr)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] transition-colors ${
                          currencyFilter === curr
                            ? 'bg-[#f5f4f0] text-[#0a0908] font-bold'
                            : 'bg-[#0a0908] text-[#7a756f] border border-[#a39d96]/15 hover:text-[#f5f4f0]'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onOpenCreateInvoice}
                  className="px-5 py-2.5 rounded-xl bg-[#e3dfd8] text-[#0a0908] font-bold text-xs uppercase tracking-wider hover:bg-[#f5f4f0] transition-colors flex items-center justify-center gap-1.5 shadow-taupe-glow"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0a0908]" />
                  Generate Invoice
                </button>
              </div>

              {/* Table */}
              <div className="rounded-2xl bg-[#141311] border border-[#a39d96]/15 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-[#a39d96]/20 bg-[#181614] text-[#a39d96] text-[10px] uppercase">
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Client / Company</th>
                        <th className="py-3 px-4">Dates</th>
                        <th className="py-3 px-4 text-right">Items</th>
                        <th className="py-3 px-4 text-center">Curr</th>
                        <th className="py-3 px-4 text-right">Total</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#a39d96]/10">
                      {filteredInvoices.map((inv) => {
                        const { total } = calculateDocTotals(inv.items, inv.discountPercent, inv.taxPercent);
                        return (
                          <tr key={inv.id} className="hover:bg-[#1a1816] transition-colors">
                            <td className="py-3.5 px-4 font-bold text-[#f5f4f0]">
                              <div>{inv.invoiceNumber}</div>
                              {inv.quotationRef && (
                                <span className="text-[10px] text-[#7a756f]">Ref: {inv.quotationRef}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-sans font-medium text-[#f5f4f0]">{inv.clientCompany}</div>
                              <div className="text-[11px] text-[#a39d96]">{inv.clientName}</div>
                            </td>
                            <td className="py-3.5 px-4 text-[#a39d96]">
                              <div>Issued: {inv.issueDate}</div>
                              <div className="text-[10px] text-[#7a756f]">Due: {inv.dueDate}</div>
                            </td>
                            <td className="py-3.5 px-4 text-right text-[#d6d2cd]">
                              {inv.items?.length || 0} items
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                  inv.currency === 'USD'
                                    ? 'bg-blue-950/40 text-blue-300 border-blue-800/40'
                                    : 'bg-[#252320] text-[#e3dfd8] border-[#a39d96]/30'
                                }`}
                              >
                                {inv.currency || 'LKR'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-[#f5f4f0]">
                              {formatDocCurrency(total, inv.currency)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <select
                                value={inv.status}
                                onChange={(e) => onToggleStatus('invoice', inv.id, e.target.value)}
                                className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer border ${
                                  inv.status === 'Paid'
                                    ? 'bg-[#f5f4f0] text-[#0a0908] font-bold border-[#f5f4f0]'
                                    : 'bg-[#0a0908] text-[#d6d2cd] border-[#a39d96]/30'
                                }`}
                              >
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Draft">Draft</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onOpenPreviewDocument('invoice', inv)}
                                  className="p-1.5 rounded-lg bg-[#0a0908] text-[#d6d2cd] hover:text-[#f5f4f0] hover:bg-[#252320] border border-[#a39d96]/15"
                                  title="Print / View Invoice"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onOpenEditDocument('invoice', inv)}
                                  className="p-1.5 rounded-lg bg-[#0a0908] text-[#d6d2cd] hover:text-[#f5f4f0] hover:bg-[#252320] border border-[#a39d96]/15"
                                  title="Edit Invoice"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDuplicateDocument('invoice', inv)}
                                  className="p-1.5 rounded-lg bg-[#0a0908] text-[#d6d2cd] hover:text-[#f5f4f0] hover:bg-[#252320] border border-[#a39d96]/15"
                                  title="Duplicate Invoice"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteDocument('invoice', inv.id)}
                                  className="p-1.5 rounded-lg bg-[#0a0908] text-[#7a756f] hover:text-red-400 hover:bg-[#252320] border border-[#a39d96]/15"
                                  title="Delete Invoice"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredInvoices.length === 0 && (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-[#7a756f]">
                            No invoices matching query. Click "Generate Invoice" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quotations' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#141311] border border-[#a39d96]/15">
                <div className="flex-1 flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#7a756f] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search quotations by number, client, company..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0a0908] border border-[#a39d96]/20 text-[#f5f4f0] font-mono text-xs focus:outline-none focus:border-[#d6d2cd]"
                    />
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {['All', 'Approved', 'Sent', 'Draft'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          statusFilter === status
                            ? 'bg-[#e3dfd8] text-[#0a0908] font-bold'
                            : 'bg-[#0a0908] text-[#a39d96] border border-[#a39d96]/15 hover:text-[#f5f4f0]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <div className="hidden sm:flex items-center gap-1 font-mono text-xs pl-2 border-l border-[#a39d96]/20">
                    {['ALL', 'LKR', 'USD'].map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setCurrencyFilter(curr)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] transition-colors ${
                          currencyFilter === curr
                            ? 'bg-[#f5f4f0] text-[#0a0908] font-bold'
                            : 'bg-[#0a0908] text-[#7a756f] border border-[#a39d96]/15 hover:text-[#f5f4f0]'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onOpenCreateQuotation}
                  className="px-5 py-2.5 rounded-xl bg-[#e3dfd8] text-[#0a0908] font-bold text-xs uppercase tracking-wider hover:bg-[#f5f4f0] transition-colors flex items-center justify-center gap-1.5 shadow-taupe-glow"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0a0908]" />
                  Generate Quotation
                </button>
              </div>

              {/* Table */}
              <div className="rounded-2xl bg-[#141311] border border-[#a39d96]/15 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-[#a39d96]/20 bg-[#181614] text-[#a39d96] text-[10px] uppercase">
                        <th className="py-3 px-4">Quotation #</th>
                        <th className="py-3 px-4">Client / Company</th>
                        <th className="py-3 px-4">Dates</th>
                        <th className="py-3 px-4 text-right">Items</th>
                        <th className="py-3 px-4 text-center">Curr</th>
                        <th className="py-3 px-4 text-right">Total</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Workflow</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#a39d96]/10">
                      {filteredQuotations.map((quo) => {
                        const { total } = calculateDocTotals(quo.items, quo.discountPercent, quo.taxPercent);
                        return (
                          <tr key={quo.id} className="hover:bg-[#1a1816] transition-colors">
                            <td className="py-3.5 px-4 font-bold text-[#f5f4f0]">
                              {quo.quotationNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-sans font-medium text-[#f5f4f0]">{quo.clientCompany}</div>
                              <div className="text-[11px] text-[#a39d96]">{quo.clientName}</div>
                            </td>
                            <td className="py-3.5 px-4 text-[#a39d96]">
                              <div>Issued: {quo.issueDate}</div>
                              <div className="text-[10px] text-[#7a756f]">Valid: {quo.validUntil}</div>
                            </td>
                            <td className="py-3.5 px-4 text-right text-[#d6d2cd]">
                              {quo.items?.length || 0} items
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                  quo.currency === 'USD'
                                    ? 'bg-blue-950/40 text-blue-300 border-blue-800/40'
                                    : 'bg-[#252320] text-[#e3dfd8] border-[#a39d96]/30'
                                }`}
                              >
                                {quo.currency || 'LKR'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-[#f5f4f0]">
                              {formatDocCurrency(total, quo.currency)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <select
                                value={quo.status}
                                onChange={(e) => onToggleStatus('quotation', quo.id, e.target.value)}
                                className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer border ${
                                  quo.status === 'Approved'
                                    ? 'bg-[#f5f4f0] text-[#0a0908] font-bold border-[#f5f4f0]'
                                    : 'bg-[#0a0908] text-[#d6d2cd] border-[#a39d96]/30'
                                }`}
                              >
                                <option value="Approved">Approved</option>
                                <option value="Sent">Sent</option>
                                <option value="Draft">Draft</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => onConvertQuotationToInvoice(quo)}
                                className="px-3 py-1 rounded-lg bg-[#1c1a17] text-[#f5f4f0] border border-[#a39d96]/30 hover:bg-[#252320] text-[11px] font-mono transition-colors"
                                title="Convert this quotation into an active invoice"
                              >
                                ⚡ To Invoice
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onOpenPreviewDocument('quotation', quo)}
                                  className="p-1.5 rounded-lg bg-[#0a0908] text-[#d6d2cd] hover:text-[#f5f4f0] hover:bg-[#252320] border border-[#a39d96]/15"
                                  title="Print / View Quotation"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onOpenEditDocument('quotation', quo)}
                                  className="p-1.5 rounded-lg bg-[#0a0908] text-[#d6d2cd] hover:text-[#f5f4f0] hover:bg-[#252320] border border-[#a39d96]/15"
                                  title="Edit Quotation"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDuplicateDocument('quotation', quo)}
                                  className="p-1.5 rounded-lg bg-[#0a0908] text-[#d6d2cd] hover:text-[#f5f4f0] hover:bg-[#252320] border border-[#a39d96]/15"
                                  title="Duplicate Quotation"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteDocument('quotation', quo.id)}
                                  className="p-1.5 rounded-lg bg-[#0a0908] text-[#7a756f] hover:text-red-400 hover:bg-[#252320] border border-[#a39d96]/15"
                                  title="Delete Quotation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredQuotations.length === 0 && (
                        <tr>
                          <td colSpan="9" className="py-8 text-center text-[#7a756f]">
                            No quotations matching query. Click "Generate Quotation" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-2xl bg-[#141311] border border-[#a39d96]/15 space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#a39d96]">
                  // OFFICIAL ENTERPRISE CORPORATE IDENTITY
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-[#0a0908] border border-[#a39d96]/10 space-y-1">
                    <span className="text-[10px] text-[#7a756f] uppercase">Company Title</span>
                    <p className="text-sm font-bold text-[#f5f4f0]">{companyProfile.name}</p>
                    <p className="text-[#a39d96]">{companyProfile.legalEntity}</p>
                    <p className="text-[10px] text-[#7a756f]">Reg: {companyProfile.regNo}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0a0908] border border-[#a39d96]/10 space-y-1">
                    <span className="text-[10px] text-[#7a756f] uppercase">Founding Architects</span>
                    <p className="text-[#f5f4f0] font-semibold">Dulanja Abeysinghe (Principal Systems Architect)</p>
                    <p className="text-[#f5f4f0] font-semibold">Remashi Diyana (Head of Creative Strategy)</p>
                    <p className="text-[#7a756f] text-[10px]">{companyProfile.address}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#141311] border border-[#a39d96]/15 space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#a39d96]">
                  // OFFICIAL BANKING & WIRE REMITTANCE PROFILE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-[#0a0908] border border-[#a39d96]/10 space-y-1">
                    <span className="text-[10px] text-[#7a756f] uppercase">Banking Institution</span>
                    <p className="text-[#f5f4f0] font-bold">{companyProfile.bankDetails.bankName}</p>
                    <p className="text-[#a39d96]">{companyProfile.bankDetails.branch}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0a0908] border border-[#a39d96]/10 space-y-1">
                    <span className="text-[10px] text-[#7a756f] uppercase">Account Coordinates</span>
                    <p className="text-[#f5f4f0] font-bold">{companyProfile.bankDetails.accountNumber}</p>
                    <p className="text-[#a39d96]">{companyProfile.bankDetails.accountName}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0a0908] border border-[#a39d96]/10 space-y-1">
                    <span className="text-[10px] text-[#7a756f] uppercase">Wire Codes & Currency</span>
                    <p className="text-[#f5f4f0] font-bold">SWIFT: {companyProfile.bankDetails.swift}</p>
                    <p className="text-[#a39d96]">Currency: {companyProfile.bankDetails.currency}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. MAIN REACT COMPONENT: THE MONOLITH
   ========================================================================= */

export default function TheMonolith() {
  const [activeSection, setActiveSection] = useState('hero');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('ts');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [selectedNode, setSelectedNode] = useState('IAD-01');

  // Technical Arsenal Matrix active tab
  const [activeStackTab, setActiveStackTab] = useState('backend');

  // Core Services Active Pillar Tab
  const [activeServicePillar, setActiveServicePillar] = useState('software');

  // Interactive Project Scoper state
  const [estimatorDomain, setEstimatorDomain] = useState('software');
  const [estimatorScale, setEstimatorScale] = useState('high');
  const [estimatorFeatures, setEstimatorFeatures] = useState([
    'websockets',
    'redis',
    'acid',
    'marketing_flyers'
  ]);
  const [briefCopied, setBriefCopied] = useState(false);

  // Terminal Commands State
  const [terminalCommands, setTerminalCommands] = useState([
    { type: 'system', text: 'THE MONOLITH OS [Version 5.2.0-Core]' },
    { type: 'system', text: 'Principal Systems Architect: Dulanja Abeysinghe' },
    { type: 'system', text: '320 Magnetic Shards Synchronized. Core AI Light at 100% nominal output.' },
    { type: 'system', text: 'Type "help", "services", or "architect" for a list of available cluster operations.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef(null);

  // Scroll Reveal Refs
  const [heroRef, heroVisible] = useScrollReveal(0.1);
  const [logosRef, logosVisible] = useScrollReveal(0.15);
  const [architectRef, architectVisible] = useScrollReveal(0.15);
  const [stackRef, stackVisible] = useScrollReveal(0.15);
  const [casesRef, casesVisible] = useScrollReveal(0.15);
  const [servicesRef, servicesVisible] = useScrollReveal(0.15);
  const [solutionsRef, solutionsVisible] = useScrollReveal(0.15);
  const [apiRef, apiVisible] = useScrollReveal(0.15);
  const [estimatorRef, estimatorVisible] = useScrollReveal(0.15);
  const [infraRef, infraVisible] = useScrollReveal(0.15);
  const [ctaRef, ctaVisible] = useScrollReveal(0.15);

  const [projectFilter, setProjectFilter] = useState('All');
  const [copiedContact, setCopiedContact] = useState('');

  // Admin & Financial Systems State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('monolith_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState('dashboard');

  const [invoices, setInvoices] = useState(() => {
    return safeStorage.get('monolith_invoices_v1', defaultInvoices);
  });
  const [quotations, setQuotations] = useState(() => {
    return safeStorage.get('monolith_quotations_v1', defaultQuotations);
  });
  const [companyProfile, setCompanyProfile] = useState(() => {
    return safeStorage.get('monolith_company_profile_v1', defaultCompanyProfile);
  });

  const [editorModal, setEditorModal] = useState({
    open: false,
    type: 'invoice',
    mode: 'create',
    data: null
  });

  const [previewModal, setPreviewModal] = useState({
    open: false,
    type: 'invoice',
    data: null
  });

  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');
  const [adminToast, setAdminToast] = useState(null);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Auto-sync invoices & quotations to localStorage
  useEffect(() => {
    safeStorage.set('monolith_invoices_v1', invoices);
  }, [invoices]);

  useEffect(() => {
    safeStorage.set('monolith_quotations_v1', quotations);
  }, [quotations]);

  useEffect(() => {
    safeStorage.set('monolith_company_profile_v1', companyProfile);
  }, [companyProfile]);

  const showAdminToast = (message, type = 'success') => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 3500);
  };

  const handleAdminLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loginUsername.trim() === 'duladiya' && loginPassword === 'diyanaabeysinghe@9454') {
      try {
        localStorage.setItem('monolith_admin_auth', 'true');
      } catch (err) {}
      setIsAdminLoggedIn(true);
      setAdminLoginModalOpen(false);
      setAdminPortalOpen(true);
      setLoginError('');
      showAdminToast('AUTHENTICATION CONFIRMED // ACCESS GRANTED', 'success');
    } else {
      setLoginError('INVALID SECURITY CREDENTIALS // ACCESS DENIED');
    }
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('monolith_admin_auth');
    } catch (err) {}
    setIsAdminLoggedIn(false);
    setAdminPortalOpen(false);
    setLoginUsername('');
    setLoginPassword('');
    showAdminToast('SESSION TERMINATED // LOGGED OUT', 'info');
  };

  const handleSaveDocument = (docData) => {
    if (!docData) return;
    const isInvoice = editorModal.type === 'invoice';

    if (editorModal.mode === 'create') {
      if (isInvoice) {
        setInvoices((prev) => [docData, ...prev]);
        showAdminToast(`INVOICE CREATED // ${docData.invoiceNumber}`, 'success');
      } else {
        setQuotations((prev) => [docData, ...prev]);
        showAdminToast(`QUOTATION CREATED // ${docData.quotationNumber}`, 'success');
      }
    } else {
      if (isInvoice) {
        setInvoices((prev) => prev.map((item) => (item.id === docData.id ? docData : item)));
        showAdminToast(`INVOICE UPDATED // ${docData.invoiceNumber}`, 'success');
      } else {
        setQuotations((prev) => prev.map((item) => (item.id === docData.id ? docData : item)));
        showAdminToast(`QUOTATION UPDATED // ${docData.quotationNumber}`, 'success');
      }
    }

    setEditorModal({ open: false, type: 'invoice', mode: 'create', data: null });
  };

  const handleDeleteDocument = (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;

    if (type === 'invoice') {
      setInvoices((prev) => prev.filter((item) => item.id !== id));
      showAdminToast('INVOICE DELETED', 'info');
    } else {
      setQuotations((prev) => prev.filter((item) => item.id !== id));
      showAdminToast('QUOTATION DELETED', 'info');
    }
  };

  const handleDuplicateDocument = (type, doc) => {
    const isInvoice = type === 'invoice';
    const newId = `${type}-${Date.now()}`;
    const newNum = isInvoice
      ? `INV-2026-00${invoices.length + 1}`
      : `QUO-2026-09${quotations.length + 1}`;

    const cloned = {
      ...JSON.parse(JSON.stringify(doc)),
      id: newId,
      [isInvoice ? 'invoiceNumber' : 'quotationNumber']: newNum,
      issueDate: new Date().toISOString().slice(0, 10),
      status: 'Draft'
    };

    if (isInvoice) {
      setInvoices((prev) => [cloned, ...prev]);
      showAdminToast(`INVOICE DUPLICATED // ${newNum}`, 'success');
    } else {
      setQuotations((prev) => [cloned, ...prev]);
      showAdminToast(`QUOTATION DUPLICATED // ${newNum}`, 'success');
    }
  };

  const handleConvertQuotationToInvoice = (quotation) => {
    const newInvoiceNumber = `INV-2026-00${invoices.length + 1}`;
    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      quotationRef: quotation.quotationNumber,
      clientName: quotation.clientName,
      clientCompany: quotation.clientCompany,
      clientEmail: quotation.clientEmail,
      clientAddress: quotation.clientAddress,
      currency: quotation.currency || 'LKR',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      domain: quotation.domain || 'software',
      status: 'Pending',
      items: JSON.parse(JSON.stringify(quotation.items || [])),
      discountPercent: quotation.discountPercent || 0,
      taxPercent: quotation.taxPercent || 0,
      notes: `Generated from Approved Quotation ${quotation.quotationNumber}. ${quotation.notes || ''}`,
      paymentTerms: quotation.paymentTerms || 'Payment due within 30 days of invoice date via international wire transfer.'
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotation.id ? { ...q, status: 'Approved' } : q))
    );
    setAdminActiveTab('invoices');
    showAdminToast(`CONVERTED TO INVOICE // ${newInvoiceNumber}`, 'success');
  };

  const handleToggleStatus = (type, id, nextStatus) => {
    if (type === 'invoice') {
      setInvoices((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
      showAdminToast(`STATUS: ${nextStatus.toUpperCase()}`, 'success');
    } else {
      setQuotations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
      showAdminToast(`STATUS: ${nextStatus.toUpperCase()}`, 'success');
    }
  };

  const handleOpenCreateInvoice = () => {
    const nextNum = `INV-2026-00${invoices.length + 1}`;
    setEditorModal({
      open: true,
      type: 'invoice',
      mode: 'create',
      data: {
        id: `inv-${Date.now()}`,
        invoiceNumber: nextNum,
        quotationRef: '',
        clientName: '',
        clientCompany: '',
        clientEmail: '',
        clientAddress: '',
        currency: 'LKR',
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        domain: 'software',
        status: 'Pending',
        items: [
          {
            description: 'Enterprise Systems Architecture & Engineering Sprint',
            quantity: 1,
            unitPrice: 1500000
          }
        ],
        discountPercent: 0,
        taxPercent: 0,
        notes: 'Payment via Commercial Bank of Ceylon PLC wire transfer.',
        paymentTerms: 'Payment due within 30 days of invoice date.'
      }
    });
  };

  const handleOpenCreateQuotation = () => {
    const nextNum = `QUO-2026-09${quotations.length + 1}`;
    setEditorModal({
      open: true,
      type: 'quotation',
      mode: 'create',
      data: {
        id: `quo-${Date.now()}`,
        quotationNumber: nextNum,
        clientName: '',
        clientCompany: '',
        clientEmail: '',
        clientAddress: '',
        currency: 'LKR',
        issueDate: new Date().toISOString().slice(0, 10),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        domain: 'software',
        status: 'Sent',
        items: [
          {
            description: 'Full-Lifecycle Venture Architecture (Software Engineering & Marketing)',
            quantity: 1,
            unitPrice: 2550000
          }
        ],
        discountPercent: 0,
        taxPercent: 0,
        notes: 'Quotation valid for 30 calendar days. Supervised by Dulanja Abeysinghe & Remashi Diyana.',
        paymentTerms: '50% upon project kickoff, 50% upon final production deployment.'
      }
    });
  };

  const handleOpenEditDocument = (type, doc) => {
    setEditorModal({
      open: true,
      type,
      mode: 'edit',
      data: JSON.parse(JSON.stringify(doc))
    });
  };

  const handleOpenPreviewDocument = (type, doc) => {
    setPreviewModal({
      open: true,
      type,
      data: doc
    });
  };

  const kpiStats = useMemo(() => {
    let lkrInvoiced = 0;
    let usdInvoiced = 0;
    let lkrPaid = 0;
    let usdPaid = 0;
    let lkrPending = 0;
    let usdPending = 0;
    let lkrQuotations = 0;
    let usdQuotations = 0;

    invoices.forEach((inv) => {
      const { total } = calculateDocTotals(inv.items, inv.discountPercent, inv.taxPercent);
      const curr = inv.currency || 'LKR';
      if (curr === 'USD') {
        usdInvoiced += total;
        if (inv.status === 'Paid') usdPaid += total;
        else usdPending += total;
      } else {
        lkrInvoiced += total;
        if (inv.status === 'Paid') lkrPaid += total;
        else lkrPending += total;
      }
    });

    quotations.forEach((quo) => {
      const { total } = calculateDocTotals(quo.items, quo.discountPercent, quo.taxPercent);
      const curr = quo.currency || 'LKR';
      if (quo.status === 'Approved' || quo.status === 'Sent') {
        if (curr === 'USD') usdQuotations += total;
        else lkrQuotations += total;
      }
    });

    return {
      lkrInvoiced,
      usdInvoiced,
      lkrPaid,
      usdPaid,
      lkrPending,
      usdPending,
      lkrQuotations,
      usdQuotations,
      paidCount: invoices.filter((i) => i.status === 'Paid').length,
      approvedQuotes: quotations.filter((q) => q.status === 'Approved').length,
      invoicesCount: invoices.length,
      quotationsCount: quotations.length
    };
  }, [invoices, quotations]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(id);
    setTimeout(() => setCopiedContact(''), 2000);
  };

  // Active section scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'architects', 'architect', 'services', 'cases', 'stack', 'solutions', 'api', 'estimator', 'infra', 'cta'];
      const scrollPos = window.scrollY + 250;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section === 'architect' ? 'architects' : section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalOpen && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalCommands, terminalOpen]);

  // Terminal Command Execution
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const newLogs = [...terminalCommands, { type: 'user', text: `> ${terminalInput}` }];

    switch (cmd) {
      case 'help':
        newLogs.push({
          type: 'response',
          text: 'AVAILABLE OPERATIONS:\n  admin       - Open Executive Admin Portal (Protected Console)\n  invoices    - Access Invoices & Financial Register\n  quotations  - Access Sales Quotations & Proposals Pipeline\n  architects  - Display Founding Architects (Dulanja Abeysinghe & Remashi Diyana) dossier\n  dulanja     - Inspect Principal Systems Architect technical credentials & stack\n  remashi     - Inspect Head of Creative Strategy, Flyer Design & Brand Direction profile\n  services    - Enumerate the 7 Core Services offered by The Monolith\n  marketing   - Inspect Creative Studio, Flyer Design & Paid Ad Campaign services\n  projects    - Output inventory of 12 production systems & engineering deployments\n  stack       - Inspect comprehensive technical stack and architecture matrix\n  estimate    - Run dynamic architecture & marketing scoping calculation\n  status      - Query real-time magnetic shard coherence & core AI state\n  deploy      - Initialize autonomous enclave compute pod\n  nodes       - Output latency matrix across 6 global edge points\n  api         - Inspect latest TypeScript / Python client SDK release\n  benchmark   - Run synthetic 1,000,000 state mutation test\n  contact     - Display direct secure contact coordinates for both architects\n  clear       - Purge terminal buffer'
        });
        break;
      case 'admin':
      case 'portal':
      case 'login':
        if (isAdminLoggedIn) {
          setAdminPortalOpen(true);
          newLogs.push({
            type: 'response',
            text: 'ADMIN SESSION ACTIVE // LAUNCHING EXECUTIVE MANAGEMENT PORTAL...'
          });
        } else {
          setAdminLoginModalOpen(true);
          newLogs.push({
            type: 'response',
            text: 'SECURITY CHALLENGE INITIATED // OPENING AUTHENTICATION CONSOLE...\nEnter authorized credentials to proceed.'
          });
        }
        break;
      case 'invoices':
      case 'billing':
        if (isAdminLoggedIn) {
          setAdminActiveTab('invoices');
          setAdminPortalOpen(true);
          newLogs.push({
            type: 'response',
            text: `ACCESSING INVOICE REGISTER // ${invoices.length} INVOICES FOUND.`
          });
        } else {
          setAdminLoginModalOpen(true);
          newLogs.push({
            type: 'response',
            text: 'RESTRICTED FINANCIAL ACCESS // AUTHENTICATION REQUIRED.'
          });
        }
        break;
      case 'quotations':
      case 'quotes':
        if (isAdminLoggedIn) {
          setAdminActiveTab('quotations');
          setAdminPortalOpen(true);
          newLogs.push({
            type: 'response',
            text: `ACCESSING QUOTATION REGISTER // ${quotations.length} QUOTATIONS FOUND.`
          });
        } else {
          setAdminLoginModalOpen(true);
          newLogs.push({
            type: 'response',
            text: 'RESTRICTED FINANCIAL ACCESS // AUTHENTICATION REQUIRED.'
          });
        }
        break;
      case 'architect':
      case 'architects':
      case 'team':
      case 'leadership':
      case 'whoami':
        newLogs.push({
          type: 'response',
          text: 'THE MONOLITH ARCHITECTS & EXECUTIVE LEADERSHIP:\n\n[01] DULANJA ABEYSINGHE // CO-FOUNDER & PRINCIPAL SYSTEMS ARCHITECT\n  Domain: Backend Systems, High-Concurrency Distributed Systems, Cloud & AI Engineering\n  Education: BSc (Hons) Software Engineering (2nd Upper, Birmingham City Univ, UK)\n  Key Experience: Biotech Software Solutions (Hospital LIS), GrayNode DevOps / NerdTech Labs, r-pac Printcare Lanka, Dula AI\n  Stack: Jakarta EE, Spring Boot, Laravel 11/12, Node.js/Fastify, Redis Redlock, Docker, PostgreSQL\n  Contact: dulanja150abeysinghe@gmail.com | +94 76 591 7189 | linkedin.com/in/dulanja-abeysinghe\n\n[02] REMASHI DIYANA // CO-FOUNDER & HEAD OF CREATIVE STRATEGY & UI/UX\n  Domain: Visual Brand Identity, Tactical Flyer Design, Social Media Marketing & Design Thinking\n  Education: BSW (Hons) NISD Sri Lanka | Dip. International Studies UOK | HND Software Engineering (London Met)\n  Key Experience: Lead Graphic Designer (The Volunteers Academy, The Movement Projects, University Clubs, DIA Academy), Founder DIA Academy, Silvermill Group\n  Toolkit: Canva (Fluent), Adobe Illustrator & Photoshop, Figma Wireframing, Front-End Coding\n  Contact: diyanamashi@gmail.com | +94 713765861 | linkedin.com/in/remashi-diyana-b332a3272'
        });
        break;
      case 'dulanja':
        newLogs.push({
          type: 'response',
          text: 'ARCHITECT DOSSIER // DULANJA ABEYSINGHE:\n  Title: Co-Founder & Principal Systems Architect\n  Domain: Mission-critical enterprise SaaS, hospital LIS, high-concurrency fintech automation, Redis Redlock distributed locks, and RAG pipelines.\n  Education: BSc (Hons) Software Engineering (Second Upper), Birmingham City University, UK.\n  Certifications: Deep Learning A-Z, Machine Learning, The AI Engineer Course, Complete Ethical Hacking.\n  Coordinates: dulanja150abeysinghe@gmail.com | +94 76 591 7189\n  GitHub: github.com/Dulanja-SaMaEl | LinkedIn: linkedin.com/in/dulanja-abeysinghe'
        });
        break;
      case 'remashi':
      case 'diyana':
        newLogs.push({
          type: 'response',
          text: 'ARCHITECT DOSSIER // REMASHI DIYANA:\n  Title: Co-Founder & Head of Creative Strategy, Brand Direction & UI/UX\n  Domain: Editorial & tactical flyer design, multi-platform social media campaigns, brand identity systems, and human-centered design thinking.\n  Education: BSW (Hons) NISD Sri Lanka, Dip. International Studies (Univ. of Kelaniya), HND Software Engineering (London Met / ESOFT).\n  Key Projects: Primary Graphic Designer at The Volunteers Academy, The Movement Projects, University Clubs, Founder at DIA Academy.\n  Coordinates: diyanamashi@gmail.com | +94 713765861\n  LinkedIn: linkedin.com/in/remashi-diyana-b332a3272'
        });
        break;
      case 'services':
      case 'offerings':
        newLogs.push({
          type: 'response',
          text: 'CORE ENTERPRISE SERVICES OFFERED:\n  1. Custom Software Engineering (Enterprise Apps, SaaS, Web/Mobile PWAs, Monolith Modernization)\n  2. AI, Data & Machine Learning (Predictive Analytics, Custom RAG, Data Lakes, Computer Vision)\n  3. Cloud Infrastructure & DevOps (Zero-Downtime Migration, CI/CD, Kubernetes, Serverless)\n  4. Cybersecurity & Risk Management (Zero-Trust, Red Teaming, HIPAA/SOC2 Compliance, JA3 TLS Bypass)\n  5. Strategy, UI/UX & Consulting (Digital Transformation, Rapid Prototyping, Brutalist Design Systems)\n  6. Managed IT & 24/7 SLA Support (Continuous Engineering, 24/7 Telemetry Triage, Auto-Backups)\n  7. Brand Growth & Creative Studio (Flyer Designing, Social Media Marketing, Meta/Google Ad Campaigns)'
        });
        break;
      case 'marketing':
      case 'creative':
      case 'flyers':
        newLogs.push({
          type: 'response',
          text: 'BRAND GROWTH, SOCIAL MEDIA MARKETING & CREATIVE STUDIO:\n  - Tactical Flyer & Collateral Design: Editorial print & digital event flyers, promotional banners, pitch decks.\n  - Social Media Marketing: Audience expansion, organic content calendar strategy, viral campaign distribution.\n  - Paid Ad Campaign Orchestration: Multi-channel conversion funnels across Meta Ads, Google Ads, LinkedIn.\n  - Visual Identity & Brand Positioning: Bespoke vector logos, custom typography guidelines, social media asset kits.'
        });
        break;
      case 'projects':
      case 'allprojects':
        newLogs.push({
          type: 'response',
          text: 'PRODUCTION SYSTEMS CATALOGUE (12 FLAGSHIP BUILDS):\n  [1]  ShadowTopup Engine        : Automated Garena API Top-Up & Wallet Gateway [DEPLOYED]\n  [2]  NexusTopUp Automation     : Low-Level Microservice with JA3 TLS Spoofing & Redlock [ACTIVE]\n  [3]  The Menu Enterprise       : Multi-Tenant QR Order & Live Kitchen Display (KDS) [ACTIVE]\n  [4]  Clinical Pharmacy OS      : Medication Dispensation & Batch Audit OS [VERIFIED]\n  [5]  Old Devans Legacy Hub     : Supabase Digital Museum, Archival Trophy Room & CMS [DEPLOYED]\n  [6]  Engineering OS            : 168h Capacity Budgeting & Spaced Repetition OS [ACTIVE]\n  [7]  Glaciar Water Logistics   : Automated Route Replenishment & Dynamic DomPDF Invoicing [DEPLOYED]\n  [8]  Harvard Inquiry System    : Admissions Multi-Channel Ingestion & SLA Routing [DEPLOYED]\n  [9]  ThiraPlus & Thirai Shorts : Low-Latency Video Streaming & Short-Form Fabric [OPERATIONAL]\n  [10] Sagaki Supply Chain Engine: Multi-Depot Distribution & Restock Automation [DEPLOYED]\n  [11] Canadian Talent Crawler   : Distributed Job Board Indexing & Deduplication [ACTIVE]\n  [12] Shopify Webhook Gateway   : Idempotent Payment & Custom Checkout Integrity [VERIFIED]'
        });
        break;
      case 'stack':
      case 'arsenal':
        newLogs.push({
          type: 'response',
          text: 'TECHNICAL ARSENAL MATRIX:\n  Backend Core     : Laravel 11/12 (PHP 8.3), Node.js, Express, Docker Compose, Redis (Redlock Mutex)\n  Frontend & Craft : Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Alpine.js, Three.js\n  Real-Time Comms  : Pusher WebSockets, Laravel Echo, JA3/JA4 TLS Spoofing, HMAC Webhooks\n  Data Storage     : PostgreSQL, MySQL (ACID Transactions), Supabase, Prometheus, Grafana'
        });
        break;
      case 'estimate':
        newLogs.push({
          type: 'response',
          text: 'ARCHITECTURE ESTIMATION TELEMETRY:\n  Default Scoped Tier: TIER 3 HIGH-CONCURRENCY DISTRIBUTED LATTICE\n  Recommended Base: Laravel 11 + Next.js 16 + Redis Redlock + Pusher WS + Creative Studio Pack\n  Expected Deployment Window: 4 - 8 Weeks\n  Inquiry Channel: dulanja150abeysinghe@gmail.com, diyanamashi@gmail.com'
        });
        break;
      case 'contact':
        newLogs.push({
          type: 'response',
          text: 'DIRECT CONTACT CHANNELS // THE MONOLITH ARCHITECTS:\n  Principal Systems Architect : Dulanja Abeysinghe (dulanja150abeysinghe@gmail.com | +94 76 591 7189)\n  Head of Creative Strategy    : Remashi Diyana (diyanamashi@gmail.com | +94 713765861)\n  Availability: Enterprise Architecture Consulting, System Builds & Creative Marketing Campaigns\n  Status: AVAILABLE FOR BESPOKE ENGAGEMENTS'
        });
        break;
      case 'status':
        newLogs.push({
          type: 'response',
          text: 'SYSTEM STATUS:\n  Principal Architect: Dulanja Abeysinghe\n  Core AI State: BLINDING COHERENCE (100% NOMINAL)\n  Magnetic Shards: 320/320 Synchronized\n  P99 Lattice Latency: 0.14 ms\n  Byzantine Proof: Validated (Zero side-channel drift)\n  Volumetric Absorption: 0.00 dB'
        });
        break;
      case 'deploy':
        newLogs.push({
          type: 'response',
          text: 'DEPLOYING ENCLAVE...\n  [1/3] Generating hardware-isolated Null-Field... OK\n  [2/3] Linking to nearest optical shard bus... OK\n  [3/3] Enclave #MNL-8824-TX is active and immutable.'
        });
        break;
      case 'nodes':
        newLogs.push({
          type: 'response',
          text: 'GLOBAL NODE TELEMETRY:\n  IAD-01 (Virginia)   : 0.42 ms  [ACTIVE]\n  FRA-01 (Frankfurt)  : 0.81 ms  [ACTIVE]\n  LHR-02 (London)     : 0.94 ms  [ACTIVE]\n  NRT-01 (Tokyo)      : 1.18 ms  [ACTIVE]\n  SIN-01 (Singapore)  : 1.62 ms  [ACTIVE]\n  GRU-01 (São Paulo)  : 2.15 ms  [ACTIVE]'
        });
        break;
      case 'api':
        newLogs.push({
          type: 'response',
          text: 'MONOLITH SDK v5.2.0\n  npm install @the-monolith/sdk\n  pip install the-monolith-ai\n  Docs: https://themonolith.systems/docs'
        });
        break;
      case 'benchmark':
        newLogs.push({
          type: 'response',
          text: 'SYNTHETIC STRESS BENCHMARK (1,000,000 requests):\n  Total Execution: 0.078 ms\n  Throughput: 12,820,512 ops/sec\n  Memory Allocation: 0.00 MB overhead (Zero-copy)\n  Result: PEAK PERFORMANCE'
        });
        break;
      case 'clear':
        setTerminalCommands([]);
        setTerminalInput('');
        return;
      default:
        newLogs.push({
          type: 'error',
          text: `Unknown command "${cmd}". Type "help" to inspect valid cluster commands.`
        });
    }

    setTerminalCommands(newLogs);
    setTerminalInput('');
  };

  // Code Snippets for Technical Protocols
  const tsCode = `import { MonolithClient, EnclaveTier } from '@the-monolith/sdk';

// Initialize bare-metal connection to the Magnetic Shard Fabric
const monolith = new MonolithClient({
  clusterEndpoint: 'lattice://szarekhan-prime.mesh',
  apiKey: process.env.MONOLITH_CORE_SECRET,
  isolation: EnclaveTier.HARDWARE_NULL_FIELD,
});

// Deploy real-time distributed neural pipeline
const pipeline = await monolith.pipelines.deploy({
  nodes: 64_000,
  opticalSync: true,
  maxDriftNanos: 0.04,
  encryption: 'post-quantum-dilithium-5',
});

// Execute sub-millisecond tensor state mutation
const response = await pipeline.mutate({
  batchSize: 1024,
  zeroCopy: true,
  retentionHorizon: '1000y',
});

console.log('Synchronized in', response.telemetry.p99LatencyMs, 'ms');`;

  const pyCode = `from the_monolith import MonolithClient, IsolationRing

# Connect to the Monolith Tomb-World compute fabric
client = MonolithClient(
    endpoint="lattice://szarekhan-prime.mesh",
    auth_token=os.environ["MONOLITH_TOKEN"],
    isolation=IsolationRing.NULL_FIELD_LEVEL_5
)

# Provision high-throughput zero-trust enclave
enclave = client.enclaves.create(
    accelerators=32,
    memory_coherence="sub-light-optical",
    fault_tolerance="byzantine-3f-1"
)

# Stream training state updates with deterministic persistence
stream = enclave.create_stream(buffer_size_mb=4096)
stream.ingest(batch_tensors, verify_cryptographic_seal=True)

print(f"Lattice status: {stream.get_metrics().coherence_percent}%")`;

  const activeCodeString = codeLanguage === 'ts' ? tsCode : pyCode;
  const { displayedText: typedCode } = useTypewriter(activeCodeString, 8, apiVisible);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 12 Production Systems Engineered by Dulanja Abeysinghe
  const caseStudies = [
    {
      id: 'shadowtopup',
      title: 'ShadowTopup Engine',
      client: 'ShadowTopup Global',
      category: 'Fintech & Gaming API',
      filter: 'Fintech & APIs',
      headline: 'Automated High-Concurrency Garena API Top-Up & Wallet Payment Gateway',
      summary: 'Engineered an automated digital currency fulfillment platform connecting Next.js 14 frontend and high-throughput Laravel microservices. Automated Garena player validation, webhook reconciliations, and secure instant wallet balances with sub-second transaction dispatching.',
      stack: ['Next.js 14', 'Laravel 11', 'Garena API', 'MySQL', 'Webhooks', 'Tailwind CSS'],
      metrics: [
        { label: 'Transactions', val: '50,000+' },
        { label: 'Dispatch Speed', val: '< 850 ms' },
        { label: 'Fulfillment', val: '99.98%' }
      ],
      architectNote: 'Engineered sub-second webhook reconciliation between external payment providers and the Garena player validation gateway.'
    },
    {
      id: 'nexustopup',
      title: 'NexusTopUp Automation Gateway',
      client: 'NexusTopUp Infrastructure',
      category: 'Distributed Microservices & Security',
      filter: 'Fintech & APIs',
      headline: 'High-Performance Gaming Automation Gateway with JA3/JA4 TLS Spoofing & Redlock',
      summary: 'Engineered a low-level microservice gateway automating digital gaming top-ups. Implemented warm Redis session pools (12h TTL), 2FA TOTP generation from seed, distributed Redlock double-claim prevention, and Chrome JA3/JA4 TLS fingerprint mimicry to bypass strict WAF security.',
      stack: ['Node.js / TypeScript', 'Docker Compose', 'Redis / Redlock', 'TLS Fingerprinting', 'Prometheus', 'Telegram Bot'],
      metrics: [
        { label: 'Session Latency', val: '8s → 1.4s' },
        { label: '2FA TOTP Engine', val: '100% Automated' },
        { label: 'Double Claims', val: '0.00% Zero-Loss' }
      ],
      architectNote: 'Implemented JA3/JA4 TLS fingerprint spoofing with Redlock distributed mutexes to eliminate race conditions under concurrent payment callbacks.'
    },
    {
      id: 'the-menu',
      title: 'The Menu Enterprise',
      client: 'The Menu Hospitality Group',
      category: 'Enterprise SaaS & WebSockets',
      filter: 'Enterprise SaaS',
      headline: 'Multi-Tenant Contactless QR Ordering & Live Kitchen Display System (KDS)',
      summary: 'Architected a full real-time restaurant operations platform with dynamic Alpine.js modals, Pusher/Laravel Echo WebSocket dispatching, live kitchen order queues, multi-tenant billing, and comprehensive inventory management.',
      stack: ['Laravel 11', 'Vite', 'Alpine.js', 'Pusher WebSockets', 'Laravel Echo', 'Tailwind CSS'],
      metrics: [
        { label: 'Event Engine', val: 'Pusher WS' },
        { label: 'Page Reload', val: '0ms Dynamic' },
        { label: 'Security', val: 'Multi-Tenant RBAC' }
      ],
      architectNote: 'Implemented zero-page-reload Alpine.js modals synced with Pusher WebSockets for instant chef-to-waiter order status transitions.'
    },
    {
      id: 'pharmacy-system',
      title: 'Clinical Pharmacy OS',
      client: 'Healthcare & Clinical Centers',
      category: 'Healthcare & Compliance',
      filter: 'Healthcare & Clinical',
      headline: 'Clinical Medication Dispensation, Prescription Verification & Batch Tracking OS',
      summary: 'Engineered an immutable medical dispensary management system handling prescription auditing, real-time batch and expiry tracking, drug interaction guardrails, barcode scanning, and multi-tier pharmaceutical billing with zero ledger discrepancies.',
      stack: ['Laravel Core', 'MySQL ACID Transactions', 'Livewire / Alpine.js', 'Hardware Barcode Scanner', 'Audit Trail'],
      metrics: [
        { label: 'Audit Trail', val: '100% Verified' },
        { label: 'Expiry Waste', val: '0.00% Zero-Loss' },
        { label: 'Compliance', val: 'HIPAA-Grade' }
      ],
      architectNote: 'Guaranteed ACID compliance across multi-station clinical dispensations with automated batch expiry quarantine.'
    },
    {
      id: 'old-devans',
      title: 'Old Devans Legacy Platform & Museum',
      client: 'Old Devans Basketball Club',
      category: 'Digital Heritage & Realtime CMS',
      filter: 'Enterprise SaaS',
      headline: 'Living Historical Archive, Archival Trophy Cabinet & Alumni Memory Hub',
      summary: 'Architected a high-craft historical legacy and alumni platform with an interactive milestone timeline, digital championship trophy room, yearbook Hall of Fame, archival memory wall with Lightbox, and an authenticated administrative CRUD content studio.',
      stack: ['React 18', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Express.js REST API', 'Supabase PostgreSQL', 'JWT Auth'],
      metrics: [
        { label: 'Archive Span', val: '1980s - 2020s' },
        { label: 'API Response', val: '< 25ms P95' },
        { label: 'Trophy Museum', val: '100% Interactive' }
      ],
      architectNote: 'Designed a dual-layer data architecture with Supabase PostgreSQL and a fallback resilient in-memory store for 100% offline-tolerant rendering.'
    },
    {
      id: 'engineering-os',
      title: 'Engineering OS',
      client: 'Personal Systems Architecture',
      category: 'Developer Tooling & AI',
      filter: 'Dev Tooling & AI',
      headline: 'Production-Quality Capacity Budgeting, Active Recall & Knowledge Retention OS',
      summary: 'Built a private command center for senior software and AI engineers. Computes 168-hour weekly capacity budgets across 7 simultaneous engineering tracks, protected client buffers, spaced repetition flashcard retention, and real-time telemetry analytics.',
      stack: ['Next.js 16 (App Router)', 'React 19', 'TypeScript', 'Tailwind CSS', 'Recharts', 'SM-2 Algorithm'],
      metrics: [
        { label: 'Weekly Engine', val: '168h Budget' },
        { label: 'Active Recall', val: 'SM-2 Algorithm' },
        { label: 'Transitions', val: '< 10ms P99' }
      ],
      architectNote: 'Designed dynamic capacity algorithms that trigger automatic schedule rebalancing when weekly cognitive load exceeds thresholds.'
    },
    {
      id: 'glaciar-water',
      title: 'Glaciar Water Logistics & Enterprise ERP',
      client: 'Glaciar Water Bottling & Distribution',
      category: 'Supply Chain & Logistics ERP',
      filter: 'Enterprise SaaS',
      headline: 'Commercial Bottling Replenishment, Route Fleet Scheduling & Automated Invoicing',
      summary: 'Engineered an enterprise resource management platform managing water distribution fleets, customer deposit containers, dynamic route allocations, and automated DomPDF invoice dispatching.',
      stack: ['Laravel 11', 'Laravel Sanctum', 'DomPDF Engine', 'PostgreSQL', 'Tailwind UI'],
      metrics: [
        { label: 'Invoicing', val: 'Automated DomPDF' },
        { label: 'Route Dispatch', val: 'Real-Time Sync' },
        { label: 'Container Parity', val: '100% Reconciled' }
      ],
      architectNote: 'Engineered a batch PDF generation queue with automated customer email dispatching and recurring balance reconciliations.'
    },
    {
      id: 'harvard-inquiry',
      title: 'Harvard Centralized Inquiry',
      client: 'Academic & Higher Education',
      category: 'Distributed Ingestion',
      filter: 'Enterprise SaaS',
      headline: 'Centralized Inquiry Ingestion, Ticket Triaging & Admissions Escalation Engine',
      summary: 'Centralized multi-channel academic inquiries into a single unified queue with automated department routing, SLA tracking, prioritized escalation matrix, and real-time student communications.',
      stack: ['Laravel Architecture', 'Queue Workers', 'Relational DB', 'Tailwind UI'],
      metrics: [
        { label: 'Routing SLA', val: '< 2h Response' },
        { label: 'Queue Engine', val: 'Zero Dropouts' },
        { label: 'Triaging', val: 'Auto-Priority' }
      ],
      architectNote: 'Architected queue worker pipelines to ensure automated triage of critical admissions escalations.'
    },
    {
      id: 'thiraplus',
      title: 'ThiraPlus & Thirai Shorts',
      client: 'Digital Media & Entertainment',
      category: 'Media Streaming & CDN',
      filter: 'Media & Streaming',
      headline: 'Low-Latency Video Streaming & Short-Form Content Delivery Infrastructure',
      summary: 'Engineered a distributed media delivery engine powering high-definition streaming and bite-sized vertical video feeds with edge caching, automated video processing, and low-latency playback.',
      stack: ['Laravel Backend', 'Next.js App', 'FFmpeg Transcoding', 'Cloud Storage CDN'],
      metrics: [
        { label: 'Latency', val: 'Sub-second Start' },
        { label: 'Transcoding', val: 'Adaptive Bitrate' },
        { label: 'Playback', val: 'Zero Buffering' }
      ],
      architectNote: 'Integrated automated FFmpeg chunking with edge CDN pre-warming for seamless vertical video feed navigation.'
    },
    {
      id: 'sagaki-distribution',
      title: 'Sagaki Supply Chain Engine',
      client: 'Sagaki Supply Chain Logistics',
      category: 'Supply Chain & ERP',
      filter: 'Enterprise SaaS',
      headline: 'Automated Multi-Warehouse Distribution, Stock Replenishment & Invoicing',
      summary: 'High-reliability enterprise logistics engine tracking wholesale stock movements, automated invoice dispatching, distributor credit control, and predictive restock thresholds across distributed depots.',
      stack: ['Laravel Enterprise', 'PostgreSQL', 'Tailwind CSS', 'REST Services'],
      metrics: [
        { label: 'Multi-Depot', val: 'Live Rebalance' },
        { label: 'Invoicing', val: 'Automated Dispatch' },
        { label: 'Stock Audits', val: 'Real-Time Sync' }
      ],
      architectNote: 'Created automated ledger synchronization across regional depots with predictive reorder notifications.'
    },
    {
      id: 'canadian-scraper',
      title: 'Canadian Talent Scraper',
      client: 'Market Intelligence & Data Mining',
      category: 'Distributed Web Crawling',
      filter: 'Dev Tooling & AI',
      headline: 'Distributed Web Crawling Pipeline Indexing National Technical Job Boards',
      summary: 'Automated distributed scraping system aggregating, deduplicating, and parsing job postings across top Canadian talent boards with automated salary normalization and daily alert digests.',
      stack: ['Node.js / Puppeteer', 'Python Crawlers', 'PostgreSQL Data Lake', 'Anti-Bot Bypasses'],
      metrics: [
        { label: 'Daily Indexing', val: '100,000+ Docs' },
        { label: 'Pipeline Speed', val: '3,200 docs/min' },
        { label: 'Data Fidelity', val: '99.9% Validated' }
      ],
      architectNote: 'Constructed an anti-detection residential proxy rotater paired with heuristic salary parsing.'
    },
    {
      id: 'shopify-gateway',
      title: 'Shopify Checkout & Webhook Gateway',
      client: 'High-Volume E-Commerce',
      category: 'E-Commerce & Payment Consistency',
      filter: 'Fintech & APIs',
      headline: 'Idempotent Webhook Synchronization & Custom Checkout Pipeline Hardening',
      summary: 'Designed resilient webhook listeners and custom checkout synchronizations resolving state desynchronization between Shopify Admin APIs, third-party payment gateways, and custom inventory databases.',
      stack: ['Shopify Admin API', 'Shopify Liquid', 'Laravel Middleware', 'HMAC Validation', 'MySQL'],
      metrics: [
        { label: 'Idempotency', val: '100% Cryptographic' },
        { label: 'Double Charges', val: '0.00% Zero-Loss' },
        { label: 'Callback ACK', val: '< 250 ms' }
      ],
      architectNote: 'Implemented cryptographic HMAC signature verification with database-backed idempotency keys to prevent duplicate transaction state fulfillment.'
    }
  ];

  const filteredProjects = useMemo(() => {
    if (projectFilter === 'All') return caseStudies;
    return caseStudies.filter((item) => item.filter === projectFilter);
  }, [projectFilter, caseStudies]);

  // Global Infrastructure Nodes
  const edgeNodes = [
    { id: 'IAD-01', name: 'North Virginia', region: 'Americas East', ping: '0.42 ms', status: 'PRIMARY' },
    { id: 'FRA-01', name: 'Frankfurt', region: 'Europe Central', ping: '0.81 ms', status: 'PRIMARY' },
    { id: 'LHR-02', name: 'London', region: 'Europe West', ping: '0.94 ms', status: 'SYNCHRONIZED' },
    { id: 'NRT-01', name: 'Tokyo', region: 'Asia Northeast', ping: '1.18 ms', status: 'PRIMARY' },
    { id: 'SIN-01', name: 'Singapore', region: 'Asia Southeast', ping: '1.62 ms', status: 'SYNCHRONIZED' },
    { id: 'GRU-01', name: 'São Paulo', region: 'South America', ping: '2.15 ms', status: 'SYNCHRONIZED' }
  ];

  // Technical Arsenal Matrix Content
  const stackArsenal = {
    backend: [
      { name: 'Laravel 11 / 12 (PHP 8.3)', role: 'Microservice Core & Queue Pipelines', desc: 'High-throughput enterprise APIs, asynchronous queue workers, custom artisan daemons, and Sanctum token security.' },
      { name: 'Node.js & Express.js', role: 'High-Concurrency Ingestion & Proxy', desc: 'Non-blocking I/O event loops, headless browser crawler managers, and low-latency webhook ingestion layers.' },
      { name: 'Docker & Docker Compose', role: 'Containerized Enclaves', desc: 'Isolated multi-container orchestration with deterministic production parity, health monitoring, and automated restarts.' },
      { name: 'Redis & Redlock Mutex', role: 'Warm Session Pools & Mutex Locks', desc: 'Sub-millisecond key-value caching, 12-hour session lifetime management, and distributed mutexes preventing double-execution.' }
    ],
    frontend: [
      { name: 'Next.js 16 (App Router)', role: 'Enterprise Server-Side Architecture', desc: 'Hybrid static/SSR rendering, React Server Components, server actions, dynamic routing, and sub-10ms P99 client transitions.' },
      { name: 'React 19 & TypeScript', role: 'Strict-Type Interface Layer', desc: 'Predictable unidirectional state trees, custom reactive hooks, and strict compile-time verification across complex domain models.' },
      { name: 'Tailwind CSS & Framer Motion', role: 'Tactile Spatial Design & Polish', desc: '8pt spatial grid layouts, bespoke dark-mode tokens, smooth layout spring animations, and WCAG AA accessible contrast.' },
      { name: 'Alpine.js & Livewire', role: 'Dynamic Zero-Reload Reactive DOM', desc: 'Lightweight reactive components in traditional SSR Laravel architectures for lightning-fast modal workflows without full bundle overhead.' }
    ],
    realtime: [
      { name: 'Pusher WebSockets & Echo', role: 'Bidirectional State Broadcasting', desc: 'Sub-second event synchronization powering live kitchen display queues, chat streams, and immediate order status transitions.' },
      { name: 'JA3 / JA4 TLS Spoofing', role: 'Anti-WAF Protocol Mimicry', desc: 'Low-level HTTP client TLS signature synthesis mimicking standard Chrome browser handshakes to bypass aggressive firewall blocks.' },
      { name: 'HMAC Webhook Verification', role: 'Cryptographic Callback Security', desc: 'Signature authentication and replay attack prevention protecting fintech payment gateways and third-party webhook relays.' },
      { name: 'FFmpeg Transcoding Pipeline', role: 'Adaptive Video Processing', desc: 'Automated chunking and multi-resolution transcoding for vertical short-form reels and low-latency streaming delivery.' }
    ],
    data: [
      { name: 'PostgreSQL & Supabase', role: 'Relational Data Lakes & Realtime DB', desc: 'Complex relational indexing, row-level security policies, JSONB document querying, and realtime table subscription listeners.' },
      { name: 'MySQL ACID Transactions', role: 'Financial & Clinical Ledgers', desc: 'Row-level locking, foreign key constraints, and multi-step transactional boundaries with zero ledger discrepancies.' },
      { name: 'Prometheus & Grafana', role: 'Telemetry & P95/P99 Monitoring', desc: 'Real-time metrics scraping, queue depth observability, shell balance monitoring, and automated anomaly alert thresholds.' },
      { name: 'DomPDF Dynamic Invoicing', role: 'Compliant Document Generation', desc: 'Automated wholesale tax invoices, clinical batch reports, and balance reconciliations compiled directly to immutable PDF storage.' }
    ]
  };

  // 7 Industry-Standard Core Services & Creative Studio Offerings
  const coreServicesPillars = {
    software: {
      id: 'software',
      title: 'Custom Software Engineering',
      tagline: 'Bespoke, ground-up systems architecture tailored to corporate workflows',
      icon: Code,
      badge: 'PILLAR 01 // BESPOKE ENGINEERING',
      subservices: [
        {
          title: 'Enterprise Application Development',
          desc: 'Building massive, scalable internal tools, bespoke ERPs, and automated CRMs tailored to complex corporate workflows and multi-role operations.',
          deliverables: ['Custom ERP / CRM', 'Multi-Station Dispatch', 'ACID Transactions']
        },
        {
          title: 'SaaS Product Architecture',
          desc: 'Architecting subscription-based multi-tenant cloud platforms with dynamic billing, role-based access controls, and strict tenant isolation.',
          deliverables: ['Multi-Tenant Billing', 'Tenant Isolation', 'Stripe / Payment Sync']
        },
        {
          title: 'Web & Mobile Application Development',
          desc: 'High-performance Progressive Web Apps (PWAs), reactive web interfaces, and responsive cross-platform applications built for sub-second interactions.',
          deliverables: ['Next.js 16 / React 19', 'PWAs & Mobile Views', 'Zero-Reload State']
        },
        {
          title: 'Legacy System Modernization',
          desc: 'Deconstructing outdated, fragile monolithic codebases and refactoring them into decoupled, high-throughput microservices and API gateways.',
          deliverables: ['Monolith Decomposition', 'Zero-Downtime Cutover', 'Microservice Enclaves']
        }
      ]
    },
    ai: {
      id: 'ai',
      title: 'AI, Data, & Machine Learning',
      tagline: 'Deep intelligence, predictive pipelines, and automated retrieval systems',
      icon: Sparkles,
      badge: 'PILLAR 02 // INTELLIGENCE & DATA',
      subservices: [
        {
          title: 'Predictive Analytics & Forecasting',
          desc: 'Training regression and classification models on historical enterprise data to forecast future trends, supply chain demand, and user behavior.',
          deliverables: ['Trend Forecasting Models', 'Anomaly Detection', 'Predictive Replenishment']
        },
        {
          title: 'Generative AI & Custom RAG Pipelines',
          desc: 'Implementing LLMs, custom vector embeddings, and Retrieval-Augmented Generation (RAG) pipelines for automated customer triage and internal knowledge retrieval.',
          deliverables: ['Custom RAG Knowledge Bases', 'Vector DB Integration', 'LLM Agent Orchestration']
        },
        {
          title: 'Data Engineering & Mass Pipelines',
          desc: 'Architecting scalable infrastructure to ingest, normalize, clean, and store massive data volumes across Data Lakes and analytical warehouses.',
          deliverables: ['ETL / ELT Pipelines', 'Distributed Crawling', 'Relational Data Lakes']
        },
        {
          title: 'Computer Vision & Real-Time NLP',
          desc: 'Building neural systems capable of parsing images, processing video streams, and extracting structured semantic sentiment from human language in real-time.',
          deliverables: ['Edge Video Processing', 'Barcode / OCR Ingestion', 'Semantic Sentiment Triage']
        }
      ]
    },
    cloud: {
      id: 'cloud',
      title: 'Cloud Infrastructure & DevOps',
      tagline: 'High-availability infrastructure, automated CI/CD, and serverless scaling',
      icon: Cloud,
      badge: 'PILLAR 03 // INFRASTRUCTURE & DEVOPS',
      subservices: [
        {
          title: 'Cloud Architecture & Zero-Downtime Migration',
          desc: 'Migrating legacy on-premise hardware and erratic servers to AWS, Google Cloud, or Azure with deterministic parity and zero operational downtime.',
          deliverables: ['Multi-Cloud Migration', 'VPC & Subnet Hardening', 'Zero-Downtime Switch']
        },
        {
          title: 'DevOps & Automated CI/CD Pipelines',
          desc: 'Automating continuous integration, automated regression testing, Docker artifact creation, and seamless rolling production deployments.',
          deliverables: ['Automated Test Suites', 'GitHub Actions / GitLab CI', 'Instant Rollback Protocols']
        },
        {
          title: 'Kubernetes & Container Orchestration',
          desc: 'Managing containerized microservice clusters to guarantee high availability, automatic load balancing, and self-healing worker pods under load.',
          deliverables: ['Docker Microservices', 'High-Availability Pods', 'Horizontal Auto-Scaling']
        },
        {
          title: 'Serverless & Event-Driven Topology',
          desc: 'Architecting event-driven pipelines that cost zero dollars during idle periods and scale instantly to absorb tens of thousands of concurrent requests.',
          deliverables: ['Event-Driven Micro-Functions', 'Zero-Idle Cost Model', 'Sub-Millisecond Cold Starts']
        }
      ]
    },
    cybersecurity: {
      id: 'cybersecurity',
      title: 'Cybersecurity & Risk Management',
      tagline: 'Zero-trust architecture, red teaming, and regulatory compliance',
      icon: Shield,
      badge: 'PILLAR 04 // DEFENSE & COMPLIANCE',
      subservices: [
        {
          title: 'Zero-Trust Network Architecture',
          desc: 'Designing security models where no user, service, or device is implicitly trusted, enforcing hardware-level token verification across all boundary crossings.',
          deliverables: ['Null-Field Perimeters', 'Hardware-Enforced Enclaves', 'Role-Based RBAC']
        },
        {
          title: 'Penetration Testing (Red Teaming)',
          desc: 'Ethically probing software layers, API endpoints, and network conduits to expose vulnerabilities and race conditions before malicious actors exploit them.',
          deliverables: ['Vulnerability Assessment', 'API Fuzzing & Exploit Audits', 'Hardened Remediation Plan']
        },
        {
          title: 'Compliance & Regulatory Auditing',
          desc: 'Ensuring architectures satisfy rigorous regulatory mandates including HIPAA medical ledgers, SOC2 Type II, and GDPR European privacy frameworks.',
          deliverables: ['HIPAA Clinical Compliance', 'Immutable Audit Trails', 'GDPR / SOC2 Preparedness']
        },
        {
          title: 'Anti-WAF & Low-Level Security Mimicry',
          desc: 'Engineering custom TLS fingerprint spoofing (JA3/JA4) and distributed Redlock mutexes to protect fintech and automation pipelines from bot blocks and double charges.',
          deliverables: ['JA3 / JA4 TLS Spoofing', 'Redlock Distributed Locks', 'Anti-Bot Evasion']
        }
      ]
    },
    design: {
      id: 'design',
      title: 'Strategy, UI/UX, & Consulting',
      tagline: 'Digital transformation consulting, rapid prototyping, and brutalist design systems',
      icon: Compass,
      badge: 'PILLAR 05 // STRATEGY & UI/UX',
      subservices: [
        {
          title: 'Digital Transformation Consulting',
          desc: 'Advising executive leadership and legacy enterprises on digitizing manual workflows, eliminating operational friction, and upgrading legacy business models.',
          deliverables: ['Digital Roadmap Blueprints', 'Tech Stack Selection', 'Operational Automation']
        },
        {
          title: 'Product Discovery & Prototyping',
          desc: 'Rapidly wireframing, building interactive prototypes, and testing technical concepts with real users before committing capital to full-scale development.',
          deliverables: ['Interactive Clickable Mocks', 'User Flow Architecture', 'Feasibility Audits']
        },
        {
          title: 'Bespoke UI/UX Design Systems',
          desc: 'Creating unified, high-craft design languages (like the cinematic brutalism of The Monolith) with accessible 8pt spatial grids and reusable component libraries.',
          deliverables: ['Tactile Glassmorphism', 'WCAG AA Accessibility', 'Reusable Component Library']
        },
        {
          title: 'Systems & Performance Auditing',
          desc: 'Conducting comprehensive audits on existing codebases, pinpointing database query bottlenecks, and providing step-by-step optimization blueprints.',
          deliverables: ['P99 Latency Profiling', 'DB Index Optimization', 'Architectural Refactor Plan']
        }
      ]
    },
    managed_it: {
      id: 'managed_it',
      title: 'Managed IT & Post-Launch Support',
      tagline: '24/7 SLA server health monitoring, disaster recovery, and continuous iteration',
      icon: Activity,
      badge: 'PILLAR 06 // RELIABILITY & SLAS',
      subservices: [
        {
          title: '24/7 SLA Telemetry & Emergency Triage',
          desc: 'Dedicated around-the-clock cluster monitoring, automated anomaly alerts, and rapid sub-hour response teams resolving critical edge failures.',
          deliverables: ['24/7 Automated Paging', 'Sub-Hour Critical SLA', 'Live Telemetry Dashboards']
        },
        {
          title: 'Continuous Feature Iteration',
          desc: 'Acting as an embedded, long-term engineering partner continuously rolling out performance enhancements, user feature requests, and API updates.',
          deliverables: ['Bi-Weekly Feature Sprints', 'Backlog Prioritization', 'Continuous Code Refactoring']
        },
        {
          title: 'Database Maintenance & Disaster Backups',
          desc: 'Routine zero-downtime database optimization, automated table vacuuming, and encrypted offsite multi-region backups guaranteeing rapid disaster recovery.',
          deliverables: ['Automated Offsite Snapshots', 'Disaster Recovery Drill', 'Zero-Downtime Maintenance']
        },
        {
          title: 'Security Patching & Kernel Upgrades',
          desc: 'Proactive vulnerability scanning, automated dependency patching, and operating system kernel updates to protect production servers from emerging CVEs.',
          deliverables: ['Proactive CVE Patching', 'Dependency Hardening', 'Zero-Downtime Kernel Updates']
        }
      ]
    },
    creative_marketing: {
      id: 'creative_marketing',
      title: 'Brand Growth, Social Media Marketing & Creative Studio',
      tagline: 'Social media marketing, flyer design, performance ad campaigns & visual assets',
      icon: Megaphone,
      badge: 'PILLAR 07 // MARKETING & CREATIVE STUDIO',
      subservices: [
        {
          title: 'Social Media Marketing & Brand Strategy',
          desc: 'End-to-end social media growth campaigns, viral content calendars, community management, and multi-platform organic audience expansion.',
          deliverables: ['Social Content Calendar', 'Brand Voice Guidelines', 'Organic Growth Funnels']
        },
        {
          title: 'Tactical Flyer & Collateral Design',
          desc: 'High-impact editorial event flyers, digital product promotional banners, print marketing collateral, investor pitch decks, and commercial brochures.',
          deliverables: ['Print & Digital Flyers', 'Product Promo Banners', 'Investor Pitch Decks']
        },
        {
          title: 'Paid Ad Campaign Orchestration',
          desc: 'Data-driven paid conversion campaigns across Meta (Facebook & Instagram Ads), Google Ads (Search & Display), and LinkedIn Ads with continuous ROAS optimization.',
          deliverables: ['Meta & Google Ad Sets', 'A/B Creative Split-Testing', 'Conversion Funnel Tracking']
        },
        {
          title: 'Brand Identity & Visual Positioning',
          desc: 'Bespoke vector logo design, custom typographic styling, social media kit templates, vector icon packs, and comprehensive visual style guides.',
          deliverables: ['Vector Logo Marks', 'Typography & Palette Guide', 'Social Media Asset Kit']
        }
      ]
    }
  };

  // Dynamic Scoper Calculation
  const estimatedBrief = useMemo(() => {
    let tier = 'TIER 2: RESILIENT PRODUCTION ARCHITECTURE';
    let window = '3 - 6 Weeks';
    let baseStack = 'Laravel 11 + React 19 / Next.js';

    if (estimatorDomain === 'creative_marketing') {
      tier = 'TIER 1: CREATIVE GROWTH & MARKETING CAMPAIGN';
      window = '1 - 3 Weeks';
      baseStack = 'Figma Design System + Meta/Google Ad Manager + Content Engine';
    } else if (estimatorDomain === 'full_launch') {
      tier = 'TIER 4: COMPLETE VENTURE LAUNCH (SOFTWARE + MARKETING)';
      window = '8 - 14 Weeks';
      baseStack = 'Full-Stack Architecture + GTM Paid Ads + Tactical Flyer Campaign';
    } else if (estimatorScale === 'extreme' || estimatorDomain === 'fintech') {
      tier = 'TIER 3: HIGH-CONCURRENCY DISTRIBUTED LATTICE';
      window = '6 - 10 Weeks';
      baseStack = 'Laravel Microservices + Docker + Redis Redlock + Next.js 16';
    } else if (estimatorDomain === 'healthcare') {
      tier = 'TIER 3: REGULATED ACID CLINICAL PLATFORM';
      window = '5 - 8 Weeks';
      baseStack = 'Laravel Core + MySQL ACID Transactions + Barcode Hardware Sync';
    } else if (estimatorScale === 'sub-1k') {
      tier = 'TIER 1: HIGH-CRAFT MVP ARCHITECTURE';
      window = '2 - 4 Weeks';
      baseStack = 'Laravel + Inertia / Tailwind UI';
    }

    const featureNames = estimatorFeatures.join(', ');
    return {
      tier,
      window,
      baseStack,
      subject: `[Engagement Inquiry] Scoped Package: ${estimatorDomain.toUpperCase()} (${estimatorScale.toUpperCase()})`,
      body: `Hello Dulanja & Remashi,\n\nI scoped an enterprise engagement via The Monolith platform:\n\n- Primary Service Domain: ${estimatorDomain.toUpperCase()}\n- Target Concurrency / Reach: ${estimatorScale.toUpperCase()}\n- Selected Capabilities: ${featureNames}\n- Target Architecture Tier: ${tier}\n- Estimated Window: ${window}\n\nLet's discuss onboarding and delivery.`
    };
  }, [estimatorDomain, estimatorScale, estimatorFeatures]);

  const toggleFeature = (id) => {
    setEstimatorFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const currentPillar = coreServicesPillars[activeServicePillar];
  const PillarIcon = currentPillar.icon;

  return (
    <div className="relative min-h-screen bg-[#0a0908] text-[#f5f4f0] font-sans antialiased selection:bg-[#d6d2cd]/20 selection:text-[#f5f4f0]">
      {/* 3D WEBGL GLOBAL CANVAS: THE MAGNETIC SHARD-SWARM */}
      <MonolithCanvas />

      {/* ATMOSPHERIC DUST & CINEMATIC GRAIN OVERLAY */}
      <div className="fixed inset-0 pointer-events-none bg-noise opacity-25 z-[1]" />

      {/* FLOATING TOP NAVIGATION */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-6">
        <nav className="flex items-center justify-between w-full max-w-6xl px-6 py-3 rounded-full bg-[#141311]/75 backdrop-blur-xl border border-[#a39d96]/15 shadow-2xl transition-all duration-300 hover:border-[#a39d96]/30">
          {/* Monolith Architectural Brand */}
          <a
            href="#hero"
            className="flex items-center gap-2.5 text-[#f5f4f0] font-semibold tracking-wider text-sm transition-opacity hover:opacity-80"
          >
            <div className="w-5 h-6 rounded-sm bg-gradient-to-b from-[#f5f4f0] via-[#d6d2cd] to-[#7a756f] flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-[#0a0908] rounded-[1px] flex items-center justify-center">
                <div className="w-1.5 h-3 bg-[#e3dfd8] rounded-[0.5px]" />
              </div>
            </div>
            <span className="font-display font-bold tracking-widest text-xs uppercase text-[#f5f4f0]">
              The Monolith
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-medium tracking-wider uppercase text-[#a39d96]">
            <a
              href="#architects"
              className={`transition-colors duration-200 hover:text-[#f5f4f0] flex items-center gap-1.5 ${
                activeSection === 'architects' || activeSection === 'architect' ? 'text-[#f5f4f0]' : ''
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#d6d2cd]" />
              Architects
            </a>
            <a
              href="#services"
              className={`transition-colors duration-200 hover:text-[#f5f4f0] ${
                activeSection === 'services' ? 'text-[#f5f4f0]' : ''
              }`}
            >
              Services
            </a>
            <a
              href="#cases"
              className={`transition-colors duration-200 hover:text-[#f5f4f0] ${
                activeSection === 'cases' ? 'text-[#f5f4f0]' : ''
              }`}
            >
              Projects
            </a>
            <a
              href="#stack"
              className={`transition-colors duration-200 hover:text-[#f5f4f0] ${
                activeSection === 'stack' ? 'text-[#f5f4f0]' : ''
              }`}
            >
              Stack
            </a>
            <a
              href="#solutions"
              className={`transition-colors duration-200 hover:text-[#f5f4f0] ${
                activeSection === 'solutions' ? 'text-[#f5f4f0]' : ''
              }`}
            >
              Solutions
            </a>
            <a
              href="#estimator"
              className={`transition-colors duration-200 hover:text-[#f5f4f0] ${
                activeSection === 'estimator' ? 'text-[#f5f4f0]' : ''
              }`}
            >
              Scoper
            </a>
            <a
              href="#api"
              className={`transition-colors duration-200 hover:text-[#f5f4f0] ${
                activeSection === 'api' ? 'text-[#f5f4f0]' : ''
              }`}
            >
              API
            </a>
            <a
              href="#infra"
              className={`transition-colors duration-200 hover:text-[#f5f4f0] ${
                activeSection === 'infra' ? 'text-[#f5f4f0]' : ''
              }`}
            >
              Infra
            </a>
          </div>

          {/* Action Buttons: Terminal & Executive Admin */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setTerminalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono tracking-wide rounded-full bg-[#1c1a17]/80 text-[#e3dfd8] border border-[#a39d96]/20 transition-all duration-300 hover:bg-[#252320] hover:border-[#d6d2cd]/40 hover:text-[#f5f4f0] shadow-taupe-glow"
              aria-label="Open Interactive Terminal"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d6d2cd] opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f5f4f0]" />
              </span>
              <TerminalIcon className="w-3.5 h-3.5 text-[#d6d2cd]" />
              <span className="hidden sm:inline">TERMINAL</span>
            </button>

            <button
              onClick={() => (isAdminLoggedIn ? setAdminPortalOpen(true) : setAdminLoginModalOpen(true))}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono tracking-wide rounded-full transition-all duration-300 ${
                isAdminLoggedIn
                  ? 'bg-[#f5f4f0] text-[#0a0908] font-bold border border-[#f5f4f0] shadow-[0_0_15px_rgba(245,244,240,0.3)] hover:bg-white'
                  : 'bg-[#141311] text-[#a39d96] border border-[#a39d96]/25 hover:border-[#f5f4f0]/50 hover:text-[#f5f4f0]'
              }`}
              aria-label="Executive Portal"
            >
              <Lock className={`w-3.5 h-3.5 ${isAdminLoggedIn ? 'text-[#0a0908]' : 'text-[#a39d96]'}`} />
              <span className="hidden sm:inline">
                {isAdminLoggedIn ? 'ADMIN PORTAL' : 'ADMIN LOGIN'}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* 1. HERO SECTION */}
      <section
        id="hero"
        ref={heroRef}
        className={`relative z-10 min-h-screen flex items-center justify-start pt-32 pb-24 px-6 sm:px-12 lg:px-24 transition-all duration-700 ease-out ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-3xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#141311]/70 border border-[#a39d96]/20 backdrop-blur-md mb-6 animate-pulse-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d6d2cd]" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#a39d96]">
              STUDIO DIRECTORY // FOUNDING ARCHITECTS: DULANJA ABEYSINGHE & REMASHI DIYANA
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-sans tracking-tight text-[#f5f4f0] leading-[1.08] mb-6">
            Architecting the{' '}
            <span className="bg-gradient-to-r from-[#f5f4f0] via-[#d6d2cd] to-[#a39d96] bg-clip-text text-transparent">
              Impossible.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#a39d96] font-light leading-relaxed max-w-2xl mb-10">
            Bespoke enterprise software, high-throughput distributed systems, real-time architectures,
            and high-impact creative marketing campaigns built for absolute permanence.
          </p>

          {/* Call-To-Action Pill Buttons */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            <a
              href="#services"
              className="px-8 py-3.5 rounded-full bg-[#e3dfd8] text-[#0a0908] font-bold text-xs tracking-widest uppercase transition-all duration-300 hover:bg-[#f5f4f0] shadow-taupe-glow hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              EXPLORE 7 SERVICES
              <ArrowRight className="w-3.5 h-3.5 text-[#0a0908]" />
            </a>

            <a
              href="#estimator"
              className="px-7 py-3.5 rounded-full bg-[#141311]/60 text-[#f5f4f0] border border-[#a39d96]/30 font-medium text-xs tracking-widest uppercase backdrop-blur-md transition-all duration-300 hover:border-[#d6d2cd] hover:bg-[#7a756f]/20 hover:text-[#f5f4f0]"
            >
              SCOPE AN ENGAGEMENT
            </a>
          </div>

          {/* Telemetry Stats Strip */}
          <div className="mt-16 pt-8 border-t border-[#a39d96]/15 flex flex-wrap items-center gap-8 sm:gap-14 text-xs font-mono text-[#7a756f]">
            <div>
              <span className="text-[#f5f4f0] block text-sm font-semibold">7 Core Pillars</span>
              <span>Full Lifecycle Engineering & Marketing</span>
            </div>
            <div>
              <span className="text-[#f5f4f0] block text-sm font-semibold">12 Repositories</span>
              <span>Production Systems Engineered</span>
            </div>
            <div>
              <span className="text-[#f5f4f0] block text-sm font-semibold">100% Zero-Loss</span>
              <span>ACID Medical & Payment Ledgers</span>
            </div>
          </div>
        </div>

        {/* Ambient Cursor Magnetism Hint */}
        <div className="absolute bottom-8 right-8 sm:right-16 hidden lg:flex flex-col items-end gap-2 text-[#7a756f] pointer-events-none">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
            <span>MOVE CURSOR TO MAGNETIZE SHARDS</span>
            <Sparkles className="w-3.5 h-3.5 text-[#d6d2cd]" />
          </div>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-[#7a756f]" />
        </div>
      </section>

      {/* 2. LOGO STRIP (DOMAINS & CLIENT PROOF) */}
      <section
        id="logos"
        ref={logosRef}
        className={`relative z-10 py-16 px-6 sm:px-12 border-y border-[#a39d96]/10 bg-[#0a0908]/60 backdrop-blur-md transition-all duration-700 ease-out ${
          logosVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-mono uppercase tracking-[0.3em] text-[#7a756f] mb-10">
            Trusted Across Mission-Critical Domains
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 items-center justify-items-center">
            <div className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-[#141311]/50 transition-all duration-300">
              <div className="text-[#7a756f] group-hover:text-[#f5f4f0] transition-colors mb-2">
                <VanguardLogos.Fintech />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#a39d96] group-hover:text-[#f5f4f0] transition-colors">
                Gaming Fintech
              </span>
            </div>

            <div className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-[#141311]/50 transition-all duration-300">
              <div className="text-[#7a756f] group-hover:text-[#f5f4f0] transition-colors mb-2">
                <VanguardLogos.Healthcare />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#a39d96] group-hover:text-[#f5f4f0] transition-colors">
                Clinical Healthcare
              </span>
            </div>

            <div className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-[#141311]/50 transition-all duration-300">
              <div className="text-[#7a756f] group-hover:text-[#f5f4f0] transition-colors mb-2">
                <VanguardLogos.Hospitality />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#a39d96] group-hover:text-[#f5f4f0] transition-colors">
                Real-Time Dining
              </span>
            </div>

            <div className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-[#141311]/50 transition-all duration-300">
              <div className="text-[#7a756f] group-hover:text-[#f5f4f0] transition-colors mb-2">
                <VanguardLogos.Academic />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#a39d96] group-hover:text-[#f5f4f0] transition-colors">
                Academic Admissions
              </span>
            </div>

            <div className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-[#141311]/50 transition-all duration-300">
              <div className="text-[#7a756f] group-hover:text-[#f5f4f0] transition-colors mb-2">
                <VanguardLogos.Streaming />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#a39d96] group-hover:text-[#f5f4f0] transition-colors">
                Media Streaming
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE ARCHITECTS: EXECUTIVE LEADERSHIP & FOUNDING DIRECTORS */}
      <section
        id="architects"
        ref={architectRef}
        className={`relative z-10 py-32 px-6 sm:px-12 lg:px-24 bg-[#0a0908]/85 border-t border-[#a39d96]/15 backdrop-blur-md transition-all duration-700 ease-out ${
          architectVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141311] border border-[#a39d96]/20 text-[10px] font-mono tracking-widest uppercase text-[#d6d2cd] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f5f4f0] animate-pulse" />
                EXECUTIVE LEADERSHIP & FOUNDING ARCHITECTS
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold font-sans text-[#f5f4f0] tracking-tight mb-4">
                The Architects of The Monolith
              </h2>
              <p className="text-base sm:text-lg text-[#a39d96] font-light leading-relaxed">
                A complementary executive council uniting high-throughput distributed systems, cloud infrastructure,
                and mission-critical software with human-centered brand strategy, editorial flyer design, and conversion campaigns.
              </p>
            </div>

            {/* Photo System Badge / Status Indicator */}
            <div className="flex flex-col sm:items-end gap-1.5 text-xs font-mono text-[#7a756f]">
              <div className="px-3.5 py-1.5 rounded-full bg-[#141311] border border-[#a39d96]/20 text-[#a39d96] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d6d2cd]" />
                <span>PORTRAIT MATRIX: DUAL-MODE VISUALS READY</span>
              </div>
              <span className="text-[10px] text-[#7a756f]">Cryptographic Glyphs Active &middot; High-Contrast Photography Supported</span>
            </div>
          </div>

          {/* Dual Architects Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* ARCHITECT 1: DULANJA ABEYSINGHE */}
            <div className="group relative p-8 sm:p-10 rounded-3xl bg-[#141311]/80 backdrop-blur-xl border border-[#a39d96]/15 transition-all duration-500 hover:border-[#d6d2cd]/40 hover:shadow-taupe-glow flex flex-col justify-between">
              <div>
                {/* Header Row: Avatar + Core Bio */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6 pb-6 border-b border-[#a39d96]/15">
                  {/* Portrait / Cryptographic Monogram Container */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#1c1a17] border border-[#a39d96]/20 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                    {/* Live Image (supports /team/dulanja.jpg) */}
                    <img
                      src="/team/dulanja.jpg"
                      alt="Dulanja Abeysinghe"
                      className="w-full h-full object-cover object-top grayscale contrast-125 hover:grayscale-0 transition-all duration-500 z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Cryptographic Fallback Monogram */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none bg-gradient-to-b from-[#1c1a17] to-[#121110]">
                      <span className="font-display font-black text-3xl sm:text-4xl text-[#f5f4f0] tracking-tighter leading-none mb-1">
                        DA
                      </span>
                      <span className="text-[9px] font-mono tracking-widest text-[#a39d96] uppercase">
                        SYS // 01
                      </span>
                      <span className="text-[8px] font-mono text-[#7a756f] mt-0.5">
                        7.4863° N, 80.3623° E
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#1c1a17] text-[#d6d2cd] border border-[#a39d96]/20 uppercase tracking-widest">
                        ARCHITECT // 01
                      </span>
                      <span className="text-[10px] font-mono text-[#a39d96] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f5f4f0] animate-pulse" />
                        ACTIVE
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold font-sans text-[#f5f4f0] tracking-tight">
                      Dulanja Abeysinghe
                    </h3>
                    <p className="text-xs font-mono text-[#d6d2cd] mt-0.5">
                      Co-Founder & Principal Systems Architect
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#7a756f]">
                      <MapPin className="w-3.5 h-3.5 text-[#a39d96]" />
                      <span>Kurunegala, Sri Lanka &middot; UTC+5:30</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Bio */}
                <p className="text-sm text-[#a39d96] font-light leading-relaxed mb-6">
                  Hands-on software engineer specializing in high-concurrency enterprise multi-tier applications,
                  high-throughput gaming fintech gateways, on-site hospital Laboratory Information Systems (LIS),
                  and asynchronous event-driven pipelines. Experienced in designing Redis-backed distributed locks (Redlock),
                  idempotent transaction handling, and retrieval-augmented generation (RAG) AI tooling.
                </p>

                {/* Education & Credentials */}
                <div className="p-4 rounded-2xl bg-[#0a0908]/70 border border-[#a39d96]/10 mb-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#f5f4f0]">
                    <GraduationCap className="w-4 h-4 text-[#d6d2cd]" />
                    <span>Education & Certifications</span>
                  </div>
                  <p className="text-xs text-[#d6d2cd] font-mono leading-relaxed">
                    BSc (Hons) in Software Engineering &mdash; Second Upper Division
                    <span className="block text-[11px] text-[#7a756f]">Birmingham City University, UK (delivered via Java Institute)</span>
                  </p>
                  <p className="text-[11px] text-[#a39d96] font-mono">
                    Professional Higher Diploma in Software Engineering (Skills & Educational Group Awards, UK, 2025)
                  </p>
                  <div className="pt-1.5 border-t border-[#a39d96]/10 flex flex-wrap gap-1.5 text-[10px] font-mono text-[#7a756f]">
                    <span className="px-2 py-0.5 rounded bg-[#141311] border border-[#a39d96]/10 text-[#d6d2cd]">Deep Learning A-Z</span>
                    <span className="px-2 py-0.5 rounded bg-[#141311] border border-[#a39d96]/10 text-[#d6d2cd]">Machine Learning</span>
                    <span className="px-2 py-0.5 rounded bg-[#141311] border border-[#a39d96]/10 text-[#d6d2cd]">The AI Engineer</span>
                    <span className="px-2 py-0.5 rounded bg-[#141311] border border-[#a39d96]/10 text-[#d6d2cd]">Ethical Hacking</span>
                  </div>
                </div>

                {/* Leadership & Industry Track Record */}
                <div className="mb-6 space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#7a756f] block">
                    Key Leadership & Industry Roles
                  </span>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-2.5 rounded-xl bg-[#0a0908]/60 border border-[#a39d96]/10 flex items-start gap-2.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#d6d2cd] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[#f5f4f0] font-medium block">Biotech Software Solutions &middot; Junior Software Engineer</span>
                        <span className="text-[11px] text-[#7a756f]">Hospital LIS on-site engineering (Peradeniya, Ragama, Kurunegala); Pharmacy Management System OPD integration; ACL TOP/AU 480 analyzer drivers.</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0a0908]/60 border border-[#a39d96]/10 flex items-start gap-2.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#d6d2cd] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[#f5f4f0] font-medium block">GrayNode DevOps / NerdTech Labs &middot; Co-Founder & Lead Developer</span>
                        <span className="text-[11px] text-[#7a756f]">Product architecture strategy, LLM customer FAQ intelligence, high-reliability engineering culture.</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0a0908]/60 border border-[#a39d96]/10 flex items-start gap-2.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#d6d2cd] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[#f5f4f0] font-medium block">r-pac Printcare Lanka &middot; Software Developer & Automation</span>
                        <span className="text-[11px] text-[#7a756f]">Java/MySQL production scheduling optimization, C#/ASP.NET/PHP internal decision tools.</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0a0908]/60 border border-[#a39d96]/10 flex items-start gap-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#d6d2cd] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[#f5f4f0] font-medium block">Dula AI &middot; AI Educational Content Creator</span>
                        <span className="text-[11px] text-[#7a756f]">Authoring structured technical learning roadmaps across Data Science, ML, and LLMs.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Arsenal Tags */}
                <div className="mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#7a756f] block mb-2">
                    Architectural Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    {['Java / Jakarta EE', 'Spring Boot', 'Laravel 11/12', 'Node.js / Fastify', 'Redis Redlock', 'BullMQ', 'PostgreSQL (ACID)', 'Docker', 'LangChain / RAG', 'Prometheus / Grafana'].map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-lg bg-[#0a0908] border border-[#a39d96]/15 text-[#d6d2cd]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact & Dispatch Strip */}
              <div className="pt-6 border-t border-[#a39d96]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCopy('dulanja150abeysinghe@gmail.com', 'dulanja-email')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1a17] text-[#f5f4f0] border border-[#a39d96]/20 hover:border-[#d6d2cd]/50 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#d6d2cd]" />
                    <span>Email</span>
                    {copiedContact === 'dulanja-email' ? <Check className="w-3 h-3 text-[#f5f4f0]" /> : <Copy className="w-3 h-3 text-[#a39d96]" />}
                  </button>

                  <button
                    onClick={() => handleCopy('+94 76 591 7189', 'dulanja-phone')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1a17] text-[#f5f4f0] border border-[#a39d96]/20 hover:border-[#d6d2cd]/50 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#d6d2cd]" />
                    <span>+94 76 591 7189</span>
                    {copiedContact === 'dulanja-phone' ? <Check className="w-3 h-3 text-[#f5f4f0]" /> : <Copy className="w-3 h-3 text-[#a39d96]" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://linkedin.com/in/dulanja-abeysinghe"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#d6d2cd] hover:text-[#f5f4f0] flex items-center gap-1 transition-colors uppercase"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://github.com/Dulanja-SaMaEl"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#d6d2cd] hover:text-[#f5f4f0] flex items-center gap-1 transition-colors uppercase"
                  >
                    GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* ARCHITECT 2: REMASHI DIYANA */}
            <div className="group relative p-8 sm:p-10 rounded-3xl bg-[#141311]/80 backdrop-blur-xl border border-[#a39d96]/15 transition-all duration-500 hover:border-[#d6d2cd]/40 hover:shadow-taupe-glow flex flex-col justify-between">
              <div>
                {/* Header Row: Avatar + Core Bio */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6 pb-6 border-b border-[#a39d96]/15">
                  {/* Portrait / Cryptographic Monogram Container */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#1c1a17] border border-[#a39d96]/20 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                    {/* Live Image (supports /team/remashi.jpg) */}
                    <img
                      src="/team/remashi.jpg"
                      alt="Remashi Diyana"
                      className="w-full h-full object-cover object-top grayscale contrast-125 hover:grayscale-0 transition-all duration-500 z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Cryptographic Fallback Monogram */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none bg-gradient-to-b from-[#1c1a17] to-[#121110]">
                      <span className="font-display font-black text-3xl sm:text-4xl text-[#f5f4f0] tracking-tighter leading-none mb-1">
                        RD
                      </span>
                      <span className="text-[9px] font-mono tracking-widest text-[#a39d96] uppercase">
                        CRE // 02
                      </span>
                      <span className="text-[8px] font-mono text-[#7a756f] mt-0.5">
                        7.3333° N, 80.1333° E
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#1c1a17] text-[#d6d2cd] border border-[#a39d96]/20 uppercase tracking-widest">
                        ARCHITECT // 02
                      </span>
                      <span className="text-[10px] font-mono text-[#a39d96] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f5f4f0] animate-pulse" />
                        ACTIVE
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold font-sans text-[#f5f4f0] tracking-tight">
                      Remashi Diyana
                    </h3>
                    <p className="text-xs font-mono text-[#d6d2cd] mt-0.5">
                      Co-Founder & Head of Creative Strategy & UI/UX
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#7a756f]">
                      <MapPin className="w-3.5 h-3.5 text-[#a39d96]" />
                      <span>Giriulla / Kurunegala, Sri Lanka &middot; UTC+5:30</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Bio */}
                <p className="text-sm text-[#a39d96] font-light leading-relaxed mb-6">
                  Multidisciplinary creative strategist combining a technical background in Software Engineering with Social Work
                  and International Studies. Spearheading high-impact visual branding, tactical promotional flyers, community
                  outreach campaigns, and intuitive UI/UX design systems driven by human behavior and market psychology.
                </p>

                {/* Education & Credentials */}
                <div className="p-4 rounded-2xl bg-[#0a0908]/70 border border-[#a39d96]/10 mb-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#f5f4f0]">
                    <GraduationCap className="w-4 h-4 text-[#d6d2cd]" />
                    <span>Education & Multidisciplinary Academics</span>
                  </div>
                  <p className="text-xs text-[#d6d2cd] font-mono leading-relaxed">
                    Bachelor of Social Work (Honours) &mdash; Second-Year Undergraduate
                    <span className="block text-[11px] text-[#7a756f]">National Institute of Social Development (NISD), Sri Lanka (2024 &ndash; Present)</span>
                  </p>
                  <p className="text-[11px] text-[#a39d96] font-mono">
                    Diploma in International Studies &mdash; University of Kelaniya, Sri Lanka (2026 &ndash; Present)
                  </p>
                  <p className="text-[11px] text-[#7a756f] font-mono">
                    Higher National Diploma (HND) in Software Engineering & BEng (Hons) studies &mdash; ESOFT Metro Campus / London Metropolitan University, UK
                  </p>
                </div>

                {/* Leadership & Industry Track Record */}
                <div className="mb-6 space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#7a756f] block">
                    Creative Leadership & Brand Campaigns
                  </span>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-2.5 rounded-xl bg-[#0a0908]/60 border border-[#a39d96]/10 flex items-start gap-2.5">
                      <Palette className="w-3.5 h-3.5 text-[#d6d2cd] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[#f5f4f0] font-medium block">The Volunteers Academy &middot; Primary Graphic Designer</span>
                        <span className="text-[11px] text-[#7a756f]">High-engagement promotional flyers, event branding, and digital media assets driving national volunteer recruitment.</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0a0908]/60 border border-[#a39d96]/10 flex items-start gap-2.5">
                      <Megaphone className="w-3.5 h-3.5 text-[#d6d2cd] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[#f5f4f0] font-medium block">The Movement Projects &middot; Visual Campaign Strategist</span>
                        <span className="text-[11px] text-[#7a756f]">Impactful visual campaigns and editorial social media layouts aligned with public advocacy and outreach.</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0a0908]/60 border border-[#a39d96]/10 flex items-start gap-2.5">
                      <Award className="w-3.5 h-3.5 text-[#d6d2cd] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[#f5f4f0] font-medium block">DIA Academy &middot; Founder & Lead Educator</span>
                        <span className="text-[11px] text-[#7a756f]">Spearheaded entire brand identity, educational flyer series, promotional graphics, curriculum, and operations.</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0a0908]/60 border border-[#a39d96]/10 flex items-start gap-2.5">
                      <Code className="w-3.5 h-3.5 text-[#d6d2cd] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[#f5f4f0] font-medium block">Silvermill Group &middot; Application Developer Intern</span>
                        <span className="text-[11px] text-[#7a756f]">Assisted internal software optimization and corporate technical workflow alignment.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Creative Toolkit */}
                <div className="mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#7a756f] block mb-2">
                    Creative & Strategic Toolkit
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    {['Editorial Flyer Design', 'Visual Brand Identity', 'Social Media Campaigns', 'Canva (Fluent)', 'Adobe Illustrator', 'Adobe Photoshop', 'UI/UX Wireframing', 'Design Thinking', 'Front-End Coding'].map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-lg bg-[#0a0908] border border-[#a39d96]/15 text-[#d6d2cd]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact & Dispatch Strip */}
              <div className="pt-6 border-t border-[#a39d96]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCopy('diyanamashi@gmail.com', 'remashi-email')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1a17] text-[#f5f4f0] border border-[#a39d96]/20 hover:border-[#d6d2cd]/50 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#d6d2cd]" />
                    <span>Email</span>
                    {copiedContact === 'remashi-email' ? <Check className="w-3 h-3 text-[#f5f4f0]" /> : <Copy className="w-3 h-3 text-[#a39d96]" />}
                  </button>

                  <button
                    onClick={() => handleCopy('+94 713765861', 'remashi-phone')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1a17] text-[#f5f4f0] border border-[#a39d96]/20 hover:border-[#d6d2cd]/50 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#d6d2cd]" />
                    <span>+94 713765861</span>
                    {copiedContact === 'remashi-phone' ? <Check className="w-3 h-3 text-[#f5f4f0]" /> : <Copy className="w-3 h-3 text-[#a39d96]" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://www.linkedin.com/in/remashi-diyana-b332a3272"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#d6d2cd] hover:text-[#f5f4f0] flex items-center gap-1 transition-colors uppercase"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="mailto:diyanamashi@gmail.com?subject=[Creative%20Studio%20Inquiry]%20Branding%20%26%20Flyer%20Design"
                    className="text-[#d6d2cd] hover:text-[#f5f4f0] flex items-center gap-1 transition-colors uppercase font-semibold"
                  >
                    DISPATCH BRIEF <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Architectural Synergy: The Dual Engine Synthesis Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#141311]/60 border border-[#a39d96]/15 backdrop-blur-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#a39d96] block mb-2">
                  THE DUAL-ENGINE PARADIGM // ABSOLUTE PERMANENCE
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-sans text-[#f5f4f0] tracking-tight mb-2">
                  Where Bare-Metal Code Meets Editorial Visual Prestige
                </h3>
                <p className="text-sm text-[#a39d96] font-light leading-relaxed">
                  Most software agencies either produce robust code with unstyled aesthetics, or sleek designs
                  with fragile architecture. At The Monolith, our dual leadership converges mission-critical backend
                  engineering with high-converting brand campaigns and tactical flyer design &mdash; delivering whole venture ecosystems ready to scale.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setTerminalOpen(true);
                    setTerminalInput('architects');
                  }}
                  className="px-5 py-3 rounded-full bg-[#1c1a17] text-xs font-mono text-[#d6d2cd] border border-[#a39d96]/20 hover:text-[#f5f4f0] hover:border-[#d6d2cd]/40 transition-colors flex items-center gap-2"
                >
                  <TerminalIcon className="w-3.5 h-3.5 text-[#d6d2cd]" />
                  QUERY COUNCIL IN TERMINAL
                </button>

                <a
                  href="#estimator"
                  className="px-6 py-3 rounded-full bg-[#e3dfd8] text-[#0a0908] font-bold text-xs tracking-widest uppercase transition-all duration-300 hover:bg-[#f5f4f0] shadow-taupe-glow flex items-center gap-1.5"
                >
                  SCOPE VENTURE <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE SERVICES OFFERED BY THE MONOLITH (7 PILLARS) */}
      <section
        id="services"
        ref={servicesRef}
        className={`relative z-10 py-32 px-6 sm:px-12 lg:px-24 border-t border-[#a39d96]/15 bg-[#0a0908]/85 backdrop-blur-md transition-all duration-700 ease-out ${
          servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#a39d96] block mb-3">
              // CORE SERVICES & SOLUTIONS DIRECTORY
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-sans text-[#f5f4f0] tracking-tight mb-4">
              Enterprise Engineering & Creative Growth
            </h2>
            <p className="text-base sm:text-lg text-[#a39d96] font-light leading-relaxed">
              Industry-standard solutions covering bespoke software architecture, neural data pipelines,
              zero-trust cloud security, and tactical social media marketing campaigns.
            </p>
          </div>

          {/* 7 Pillars Interactive Tab Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 text-xs font-mono">
            {[
              { id: 'software', label: '1. Custom Software', icon: Code },
              { id: 'ai', label: '2. AI & Data ML', icon: Sparkles },
              { id: 'cloud', label: '3. Cloud & DevOps', icon: Cloud },
              { id: 'cybersecurity', label: '4. Cybersecurity', icon: Shield },
              { id: 'design', label: '5. UI/UX & Strategy', icon: Compass },
              { id: 'managed_it', label: '6. Managed IT & SLAs', icon: Activity },
              { id: 'creative_marketing', label: '7. Marketing & Flyers', icon: Megaphone }
            ].map((pillar) => {
              const IconComp = pillar.icon;
              const isActive = activeServicePillar === pillar.id;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActiveServicePillar(pillar.id)}
                  className={`px-4 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#e3dfd8] text-[#0a0908] font-bold shadow-taupe-glow'
                      : 'bg-[#141311] text-[#a39d96] hover:text-[#f5f4f0] border border-[#a39d96]/15 hover:border-[#d6d2cd]/30'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{pillar.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Pillar Showcase Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#141311]/90 border border-[#a39d96]/20 shadow-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-[#1c1a17] border border-[#a39d96]/20 text-[#f5f4f0]">
                <PillarIcon className="w-8 h-8 text-[#d6d2cd]" />
              </div>
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#a39d96] block mb-1">
                  {currentPillar.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#f5f4f0] mb-1">
                  {currentPillar.title}
                </h3>
                <p className="text-sm text-[#a39d96] font-light max-w-2xl">
                  {currentPillar.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="#estimator"
                onClick={() => setEstimatorDomain(currentPillar.id === 'creative_marketing' ? 'creative_marketing' : 'software')}
                className="px-6 py-2.5 rounded-full bg-[#e3dfd8] text-[#0a0908] font-bold text-xs tracking-wider uppercase hover:bg-[#f5f4f0] transition-colors whitespace-nowrap"
              >
                SCOPE THIS PILLAR
              </a>
            </div>
          </div>

          {/* Sub-services 4-Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentPillar.subservices.map((sub, sIdx) => (
              <div
                key={sIdx}
                className="group p-8 rounded-3xl bg-[#141311]/70 backdrop-blur-xl border border-[#a39d96]/15 hover:border-[#d6d2cd]/35 hover:shadow-taupe-glow transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#7a756f]">
                      CAPABILITY 0{sIdx + 1}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d6d2cd]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#f5f4f0] group-hover:text-[#e3dfd8] transition-colors mb-3">
                    {sub.title}
                  </h4>
                  <p className="text-sm text-[#a39d96] font-light leading-relaxed mb-6">
                    {sub.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#a39d96]/10 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-[#7a756f] uppercase mr-1">Deliverables:</span>
                  {sub.deliverables.map((deliv, dIdx) => (
                    <span
                      key={dIdx}
                      className="px-2.5 py-1 rounded-lg bg-[#1c1a17] text-[10px] font-mono text-[#d6d2cd] border border-[#a39d96]/15"
                    >
                      {deliv}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRODUCTION SYSTEMS & REPOSITORIES (12 BUILDS) */}
      <section
        id="cases"
        ref={casesRef}
        className={`relative z-10 py-32 px-6 sm:px-12 lg:px-24 bg-[#0a0908]/75 border-t border-[#a39d96]/10 transition-all duration-700 ease-out ${
          casesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#a39d96] block mb-3">
                // PRODUCTION SYSTEMS & REPOSITORIES
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold font-sans text-[#f5f4f0] tracking-tight mb-4">
                Systems Engineered by Dulanja
              </h2>
              <p className="text-base sm:text-lg text-[#a39d96] font-light leading-relaxed">
                Twelve production-grade applications and distributed architectures engineered across fintech,
                clinical healthcare, real-time hospitality, media streaming, and automated developer tooling.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#a39d96]">
              <span className="w-2 h-2 rounded-full bg-[#d6d2cd]" />
              <span>{caseStudies.length} PRODUCTION REPOSITORIES</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 text-xs font-mono">
            {['All', 'Fintech & APIs', 'Enterprise SaaS', 'Healthcare & Clinical', 'Dev Tooling & AI', 'Media & Streaming'].map((cat) => (
              <button
                key={cat}
                onClick={() => setProjectFilter(cat)}
                className={`px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap ${
                  projectFilter === cat
                    ? 'bg-[#e3dfd8] text-[#0a0908] font-bold shadow-taupe-glow'
                    : 'bg-[#141311] text-[#a39d96] hover:text-[#f5f4f0] border border-[#a39d96]/15 hover:border-[#d6d2cd]/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cinematic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((study) => (
              <div
                key={study.id}
                onClick={() => setSelectedCaseStudy(study)}
                className="group relative cursor-pointer rounded-3xl bg-[#141311]/75 backdrop-blur-xl border border-[#a39d96]/15 p-7 sm:p-8 transition-all duration-500 hover:border-[#d6d2cd]/40 hover:bg-[#1a1815]/90 hover:shadow-taupe-glow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-mono tracking-widest text-[#a39d96] uppercase">
                      {study.category}
                    </span>
                    <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#1c1a17] text-[#d6d2cd] border border-[#a39d96]/20">
                      {study.client}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#f5f4f0] group-hover:text-[#e3dfd8] transition-colors duration-300 mb-2">
                    {study.title}
                  </h3>
                  <p className="text-xs font-medium text-[#d6d2cd] mb-3 leading-snug">{study.headline}</p>
                  <p className="text-xs text-[#a39d96] font-light leading-relaxed mb-5 line-clamp-3">
                    {study.summary}
                  </p>

                  {/* Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {study.stack.slice(0, 3).map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-[#1c1a17] text-[10px] font-mono text-[#a39d96] border border-[#a39d96]/10"
                      >
                        {tech}
                      </span>
                    ))}
                    {study.stack.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#1c1a17] text-[10px] font-mono text-[#7a756f]">
                        +{study.stack.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#a39d96]/10 mb-4 font-mono text-xs">
                    {study.metrics.map((m, i) => (
                      <div key={i} className="p-2 rounded-xl bg-[#0a0908]/60 border border-[#a39d96]/10">
                        <span className="text-[9px] text-[#7a756f] block uppercase truncate mb-0.5">{m.label}</span>
                        <span className="text-[11px] font-semibold text-[#f5f4f0] truncate block">{m.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono tracking-wider text-[#a39d96] group-hover:text-[#f5f4f0] transition-colors duration-300">
                    <span className="uppercase text-[10px]">SPECIFICATION</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300 text-[11px]">
                      INSPECT <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TECHNICAL ARSENAL MATRIX */}
      <section
        id="stack"
        ref={stackRef}
        className={`relative z-10 py-32 px-6 sm:px-12 lg:px-24 border-t border-[#a39d96]/15 bg-[#0a0908]/75 backdrop-blur-md transition-all duration-700 ease-out ${
          stackVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#a39d96] block mb-3">
                // COMPREHENSIVE TECHNICAL ARSENAL
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold font-sans text-[#f5f4f0] tracking-tight mb-4">
                Full-Stack Systems Architecture
              </h2>
              <p className="text-base sm:text-lg text-[#a39d96] font-light leading-relaxed">
                Battle-tested technologies chosen for algorithmic efficiency, type safety, low latency, and operational resilience.
              </p>
            </div>

            {/* Category Selector Tabs */}
            <div className="flex items-center gap-2 bg-[#141311] p-1.5 rounded-2xl border border-[#a39d96]/15 text-xs font-mono">
              {[
                { id: 'backend', label: 'Backend Core' },
                { id: 'frontend', label: 'Frontend Layer' },
                { id: 'realtime', label: 'Real-Time & Protocols' },
                { id: 'data', label: 'Data & Cloud' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStackTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    activeStackTab === tab.id
                      ? 'bg-[#e3dfd8] text-[#0a0908] font-bold shadow-taupe-glow'
                      : 'text-[#a39d96] hover:text-[#f5f4f0]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stackArsenal[activeStackTab].map((item, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-3xl bg-[#141311]/75 backdrop-blur-xl border border-[#a39d96]/15 hover:border-[#d6d2cd]/35 hover:shadow-taupe-glow transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#a39d96] block mb-2">
                    {item.role}
                  </span>
                  <h3 className="text-lg font-bold text-[#f5f4f0] group-hover:text-[#e3dfd8] transition-colors mb-3">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#a39d96] font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#a39d96]/10 flex items-center justify-between text-[10px] font-mono text-[#7a756f]">
                  <span>PRODUCTION READY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f5f4f0]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SOLUTIONS & BENTO CAPABILITIES */}
      <section
        id="solutions"
        ref={solutionsRef}
        className={`relative z-10 py-32 px-6 sm:px-12 lg:px-24 transition-all duration-700 ease-out ${
          solutionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#a39d96] block mb-3">
              // ARCHITECTURAL CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-sans text-[#f5f4f0] tracking-tight mb-4">
              Autonomous Systems for High-Consequence Compute
            </h2>
            <p className="text-base sm:text-lg text-[#a39d96] font-light leading-relaxed">
              When standard cloud architectures fail under extreme load and adversarial conditions,
              The Monolith provides mathematical permanence and sub-millisecond execution.
            </p>
          </div>

          {/* Premium Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Distributed Compute */}
            <div className="md:col-span-2 group relative p-8 sm:p-10 rounded-3xl bg-[#141311]/70 backdrop-blur-xl border border-[#a39d96]/15 transition-all duration-500 hover:border-[#d6d2cd]/35 hover:shadow-taupe-glow overflow-hidden">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-2xl bg-[#1c1a17] border border-[#a39d96]/20 text-[#f5f4f0]">
                      <Cpu className="w-6 h-6 text-[#d6d2cd]" />
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#1c1a17] text-[#a39d96] border border-[#a39d96]/15">
                      Sub-Millisecond Fabric
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-[#f5f4f0] tracking-tight mb-3">
                    Distributed Compute & Microservices
                  </h3>
                  <p className="text-sm sm:text-base text-[#a39d96] font-light leading-relaxed max-w-xl mb-8">
                    Autonomous cluster scheduler dynamically allocates GPU and TPU workloads without
                    context fragmentation. Sub-light optical synchronization guarantees zero state drift.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0a0908]/80 border border-[#a39d96]/15 font-mono text-xs">
                  <div className="flex items-center justify-between text-[#7a756f] border-b border-[#a39d96]/10 pb-3 mb-4">
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#d6d2cd]" />
                      CLUSTER SCHEDULER STATE
                    </span>
                    <span className="text-[#f5f4f0]">64,000 ACCELERATORS NOMINAL</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 rounded-lg bg-[#141311] border border-[#a39d96]/10 flex flex-col items-center justify-center transition-all duration-300 hover:border-[#d6d2cd]/40"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-[#d6d2cd] mb-1"
                          style={{ opacity: 0.35 + (i % 5) * 0.15 }}
                        />
                        <span className="text-[9px] text-[#7a756f]">C{i + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#7a756f] pt-1">
                    <span>Optical Interconnect: 4.8 TB/s</span>
                    <span className="text-[#f5f4f0] font-semibold">State Drift: &lt; 0.04 ns</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Zero-Trust Security */}
            <div className="md:col-span-1 group relative p-8 rounded-3xl bg-[#141311]/70 backdrop-blur-xl border border-[#a39d96]/15 transition-all duration-500 hover:border-[#d6d2cd]/35 hover:shadow-taupe-glow overflow-hidden">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="p-3 w-fit rounded-2xl bg-[#1c1a17] border border-[#a39d96]/20 text-[#d6d2cd] mb-6">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#f5f4f0] tracking-tight mb-2">
                    Zero-Trust Security
                  </h3>
                  <p className="text-sm text-[#a39d96] font-light leading-relaxed mb-6">
                    Hardware-enforced null-field sandboxes encapsulating weights and runtime states
                    behind post-quantum lattice cryptography.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a0908]/80 border border-[#a39d96]/15 font-mono text-xs space-y-2">
                  <div className="flex justify-between text-[#7a756f]">
                    <span>CIPHER</span>
                    <span className="text-[#f5f4f0]">DILITHIUM-5 PQC</span>
                  </div>
                  <div className="flex justify-between text-[#7a756f]">
                    <span>SIDE-CHANNEL FLUX</span>
                    <span className="text-[#d6d2cd]">0.00 dB (ABSORBED)</span>
                  </div>
                  <div className="flex justify-between text-[#7a756f]">
                    <span>PERIMETER</span>
                    <span className="text-[#a39d96]">HARDWARE SEALED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Neural Data Pipelines */}
            <div className="md:col-span-1 group relative p-8 rounded-3xl bg-[#141311]/70 backdrop-blur-xl border border-[#a39d96]/15 transition-all duration-500 hover:border-[#d6d2cd]/35 hover:shadow-taupe-glow overflow-hidden">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="p-3 w-fit rounded-2xl bg-[#1c1a17] border border-[#a39d96]/20 text-[#d6d2cd] mb-6">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#f5f4f0] tracking-tight mb-2">
                    Neural Data Pipelines
                  </h3>
                  <p className="text-sm text-[#a39d96] font-light leading-relaxed mb-6">
                    Real-time high-throughput streaming with zero-copy deserialization. Ingests 10M+
                    events/sec with deterministic sub-millisecond execution.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a0908]/80 border border-[#a39d96]/15 font-mono text-xs space-y-2">
                  <div className="flex justify-between text-[#7a756f]">
                    <span>STREAM THROUGHPUT</span>
                    <span className="text-[#f5f4f0]">10,485,760 ops/s</span>
                  </div>
                  <div className="flex justify-between text-[#7a756f]">
                    <span>MEMORY OVERHEAD</span>
                    <span className="text-[#a39d96]">0.00 MB ALLOC</span>
                  </div>
                  <div className="flex justify-between text-[#7a756f]">
                    <span>DESERIALIZATION</span>
                    <span className="text-[#d6d2cd]">ZERO-COPY RING</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Immutable Consensus */}
            <div className="md:col-span-2 group relative p-8 sm:p-10 rounded-3xl bg-[#141311]/70 backdrop-blur-xl border border-[#a39d96]/15 transition-all duration-500 hover:border-[#d6d2cd]/35 hover:shadow-taupe-glow overflow-hidden">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-2xl bg-[#1c1a17] border border-[#a39d96]/20 text-[#f5f4f0]">
                      <Database className="w-6 h-6 text-[#d6d2cd]" />
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#1c1a17] text-[#a39d96] border border-[#a39d96]/15">
                      Millennial Durability
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-[#f5f4f0] tracking-tight mb-3">
                    Immutable Consensus Architecture
                  </h3>
                  <p className="text-sm sm:text-base text-[#a39d96] font-light leading-relaxed max-w-xl mb-8">
                    Continuous background parity verification guarantees data permanence for a thousand
                    years. Quantum-sharded Byzantine consensus prevents degradation under any network
                    partition.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0a0908]/80 border border-[#a39d96]/15 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl bg-[#141311] border border-[#a39d96]/10">
                      <div className="text-[10px] text-[#7a756f] uppercase">Durability Tier</div>
                      <div className="text-lg font-bold text-[#f5f4f0] mt-1">99.999999999%</div>
                      <span className="text-[9px] text-[#a39d96]">11 Nines Parity</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#141311] border border-[#a39d96]/10">
                      <div className="text-[10px] text-[#7a756f] uppercase">Consensus Model</div>
                      <div className="text-lg font-bold text-[#f5f4f0] mt-1">3f + 1 Byzantine</div>
                      <span className="text-[9px] text-[#a39d96]">Zero-loss quorum</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#141311] border border-[#a39d96]/10">
                      <div className="text-[10px] text-[#7a756f] uppercase">Self-Heal Cycle</div>
                      <div className="text-lg font-bold text-[#f5f4f0] mt-1">REAL-TIME</div>
                      <span className="text-[9px] text-[#d6d2cd]">Autonomous Bit-Repair</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TECHNICAL PROTOCOLS (API & DEVELOPER EXPERIENCE) */}
      <section
        id="api"
        ref={apiRef}
        className={`relative z-10 py-32 px-6 sm:px-12 lg:px-24 border-t border-[#a39d96]/10 transition-all duration-700 ease-out ${
          apiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#a39d96] block mb-3">
              // DEVELOPER PROTOCOLS
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-sans text-[#f5f4f0] tracking-tight mb-4">
              Integrate with Bare-Metal Precision
            </h2>
            <p className="text-base sm:text-lg text-[#a39d96] font-light leading-relaxed">
              Provision isolated enclaves, deploy distributed neural pipelines, and mutate states
              with single-digit lines of code.
            </p>
          </div>

          {/* Polished Frosted-Glass Terminal Window */}
          <div className="rounded-3xl bg-[#141311]/85 backdrop-blur-2xl border border-[#a39d96]/20 shadow-2xl overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-[#a39d96]/15 bg-[#181614]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#7a756f]/40" />
                <span className="w-3 h-3 rounded-full bg-[#a39d96]/40" />
                <span className="w-3 h-3 rounded-full bg-[#d6d2cd]/40" />
                <span className="ml-3 text-xs font-mono text-[#a39d96] hidden sm:inline">
                  monolith-core // client-sdk
                </span>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1.5 bg-[#0a0908] p-1 rounded-xl border border-[#a39d96]/15">
                <button
                  onClick={() => setCodeLanguage('ts')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                    codeLanguage === 'ts'
                      ? 'bg-[#1c1a17] text-[#f5f4f0] shadow-sm'
                      : 'text-[#7a756f] hover:text-[#a39d96]'
                  }`}
                >
                  TypeScript
                </button>
                <button
                  onClick={() => setCodeLanguage('py')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                    codeLanguage === 'py'
                      ? 'bg-[#1c1a17] text-[#f5f4f0] shadow-sm'
                      : 'text-[#7a756f] hover:text-[#a39d96]'
                  }`}
                >
                  Python
                </button>
              </div>

              {/* Copy Code */}
              <button
                onClick={() => copyToClipboard(activeCodeString)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1c1a17] text-xs font-mono text-[#a39d96] hover:text-[#f5f4f0] border border-[#a39d96]/15 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#f5f4f0]" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#a39d96]" />
                    <span>COPY SDK</span>
                  </>
                )}
              </button>
            </div>

            {/* Typewriter Code Display */}
            <div className="p-6 sm:p-8 font-mono text-xs sm:text-sm text-[#e3dfd8] overflow-x-auto bg-[#0a0908]/90 min-h-[380px]">
              <pre className="leading-relaxed">
                <code>
                  {typedCode}
                  <span className="inline-block w-2 h-4 bg-[#f5f4f0] ml-0.5 animate-pulse align-middle" />
                </code>
              </pre>
            </div>

            {/* Footer Telemetry */}
            <div className="px-6 py-4 bg-[#11100e] border-t border-[#a39d96]/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#7a756f]">
              <div className="flex items-center gap-6">
                <span>
                  INTEGRATION SPEED: <strong className="text-[#f5f4f0]">&lt; 5 MINUTES</strong>
                </span>
                <span>
                  TEST SUITE: <strong className="text-[#a39d96]">100% PASS</strong>
                </span>
              </div>
              <button
                onClick={() => setTerminalOpen(true)}
                className="text-xs text-[#d6d2cd] hover:text-[#f5f4f0] flex items-center gap-1 transition-colors"
              >
                LAUNCH INTERACTIVE SHELL <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. INTERACTIVE PROJECT SCOPER & ESTIMATOR */}
      <section
        id="estimator"
        ref={estimatorRef}
        className={`relative z-10 py-32 px-6 sm:px-12 lg:px-24 border-t border-[#a39d96]/15 bg-[#0a0908]/90 transition-all duration-700 ease-out ${
          estimatorVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#a39d96] block mb-3">
              // ARCHITECTURE ESTIMATOR
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-sans text-[#f5f4f0] tracking-tight mb-4">
              Scope Your Next Architecture & Campaign
            </h2>
            <p className="text-base sm:text-lg text-[#a39d96] font-light leading-relaxed">
              Configure your primary domain, target scale, and required software or marketing capabilities to synthesize an immediate engagement blueprint.
            </p>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Controls */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: Select Domain */}
              <div className="p-7 rounded-3xl bg-[#141311]/80 border border-[#a39d96]/15">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#a39d96] block mb-4">
                  01 // SELECT PRIMARY SERVICE DOMAIN
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  {[
                    { id: 'software', label: 'Custom Software Dev' },
                    { id: 'fintech', label: 'Gaming Fintech & APIs' },
                    { id: 'healthcare', label: 'Clinical Healthcare' },
                    { id: 'creative_marketing', label: 'Marketing & Flyer Design' },
                    { id: 'full_launch', label: 'Full Software + Marketing GTM' }
                  ].map((dom) => (
                    <button
                      key={dom.id}
                      onClick={() => setEstimatorDomain(dom.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        estimatorDomain === dom.id
                          ? 'bg-[#1c1a17] border-[#d6d2cd] text-[#f5f4f0] shadow-taupe-glow'
                          : 'bg-[#0a0908] border-[#a39d96]/15 text-[#a39d96] hover:border-[#a39d96]/40'
                      }`}
                    >
                      <span className="block font-semibold mb-1">{dom.label}</span>
                      <span className="text-[10px] text-[#7a756f]">Selected Domain</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Concurrency & Scale */}
              <div className="p-7 rounded-3xl bg-[#141311]/80 border border-[#a39d96]/15">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#a39d96] block mb-4">
                  02 // TARGET CONCURRENCY & CAMPAIGN REACH
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  {[
                    { id: 'sub-1k', label: '< 1,000 req/s', desc: 'Standard / Regional Audience' },
                    { id: 'high', label: '10,000+ req/s', desc: 'High-Throughput / National Growth' },
                    { id: 'extreme', label: '100,000+ req/s', desc: 'Planetary Scale / Mass GTM' }
                  ].map((scale) => (
                    <button
                      key={scale.id}
                      onClick={() => setEstimatorScale(scale.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        estimatorScale === scale.id
                          ? 'bg-[#1c1a17] border-[#d6d2cd] text-[#f5f4f0] shadow-taupe-glow'
                          : 'bg-[#0a0908] border-[#a39d96]/15 text-[#a39d96] hover:border-[#a39d96]/40'
                      }`}
                    >
                      <span className="block font-semibold text-sm mb-1">{scale.label}</span>
                      <span className="text-[10px] text-[#7a756f]">{scale.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Required Architectural & Marketing Features */}
              <div className="p-7 rounded-3xl bg-[#141311]/80 border border-[#a39d96]/15">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#a39d96] block mb-4">
                  03 // ESSENTIAL SUBSYSTEMS & CAMPAIGN DELIVERABLES
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  {[
                    { id: 'marketing_flyers', label: 'Tactical Flyer Design' },
                    { id: 'social_ads', label: 'Meta/Google Ad Funnels' },
                    { id: 'content_cal', label: 'Social Media Calendar' },
                    { id: 'websockets', label: 'Pusher WebSockets' },
                    { id: 'redis', label: 'Redis Redlock Mutex' },
                    { id: 'acid', label: 'ACID Strict Ledger' },
                    { id: 'ai_rag', label: 'LLM / RAG Pipeline' },
                    { id: 'docker', label: 'Docker Microservices' },
                    { id: 'sla_support', label: '24/7 SLA Monitoring' }
                  ].map((feat) => {
                    const isSelected = estimatorFeatures.includes(feat.id);
                    return (
                      <button
                        key={feat.id}
                        onClick={() => toggleFeature(feat.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1c1a17] border-[#d6d2cd] text-[#f5f4f0]'
                            : 'bg-[#0a0908] border-[#a39d96]/15 text-[#7a756f] hover:border-[#a39d96]/40'
                        }`}
                      >
                        <span className="text-xs">{feat.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#f5f4f0]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Dynamic Output Profile */}
            <div className="lg:col-span-1 p-8 rounded-3xl bg-[#141311] border border-[#a39d96]/20 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#a39d96]/15 mb-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#a39d96]">
                    ESTIMATED BLUEPRINT
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#f5f4f0] animate-pulse" />
                </div>

                <div className="space-y-6 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-[#7a756f] uppercase block mb-1">
                      Engagement Tier
                    </span>
                    <span className="text-sm font-bold text-[#f5f4f0] block leading-snug">
                      {estimatedBrief.tier}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#7a756f] uppercase block mb-1">
                      Recommended Foundation
                    </span>
                    <span className="text-xs text-[#d6d2cd] block leading-relaxed">
                      {estimatedBrief.baseStack}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#7a756f] uppercase block mb-1">
                      Estimated Production Horizon
                    </span>
                    <span className="text-xs font-semibold text-[#f5f4f0] block">
                      {estimatedBrief.window}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0a0908] border border-[#a39d96]/15">
                    <span className="text-[10px] text-[#7a756f] uppercase block mb-1">
                      Active Subsystems & Deliverables
                    </span>
                    <span className="text-[11px] text-[#a39d96]">
                      {estimatorFeatures.length > 0 ? estimatorFeatures.join(' • ') : 'Standard Runtime'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-[#a39d96]/15 space-y-3">
                <a
                  href={`mailto:dulanja150abeysinghe@gmail.com?subject=${encodeURIComponent(
                    estimatedBrief.subject
                  )}&body=${encodeURIComponent(estimatedBrief.body)}`}
                  className="w-full py-3.5 rounded-full bg-[#e3dfd8] text-[#0a0908] font-bold text-xs tracking-widest uppercase transition-all hover:bg-[#f5f4f0] shadow-taupe-glow flex items-center justify-center gap-2"
                >
                  DISPATCH TO ARCHITECT
                  <ArrowRight className="w-3.5 h-3.5 text-[#0a0908]" />
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(estimatedBrief.body);
                    setBriefCopied(true);
                    setTimeout(() => setBriefCopied(false), 2000);
                  }}
                  className="w-full py-2.5 rounded-full bg-[#1c1a17] text-[#a39d96] hover:text-[#f5f4f0] text-xs font-mono border border-[#a39d96]/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  {briefCopied ? (
                    <>
                      <Check className="w-3 h-3 text-[#f5f4f0]" />
                      <span>BRIEF COPIED TO CLIPBOARD</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#a39d96]" />
                      <span>COPY ARCHITECTURE BRIEF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. GLOBAL INFRASTRUCTURE DATA-VIZ */}
      <section
        id="infra"
        ref={infraRef}
        className={`relative z-10 py-32 px-6 sm:px-12 lg:px-24 border-t border-[#a39d96]/10 transition-all duration-700 ease-out ${
          infraVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#a39d96] block mb-3">
              // PLANETARY NETWORK TOPOLOGY
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-sans text-[#f5f4f0] tracking-tight mb-4">
              Sub-Millisecond Global Reach
            </h2>
            <p className="text-base sm:text-lg text-[#a39d96] font-light leading-relaxed">
              Direct bare-metal interconnects spanning every continent with deterministic optical
              routing and zero egress telemetry loss.
            </p>
          </div>

          {/* Interactive Global Network Map Card */}
          <div className="rounded-3xl bg-[#141311]/80 backdrop-blur-2xl border border-[#a39d96]/20 p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Left: Minimalist SVG Map Visualization */}
              <div className="lg:col-span-2 relative min-h-[340px] flex items-center justify-center p-4 rounded-2xl bg-[#0a0908]/90 border border-[#a39d96]/15 overflow-hidden">
                <svg className="w-full h-full min-h-[300px]" viewBox="0 0 800 450" fill="none">
                  {/* Grid Lines */}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      y1={i * 50 + 25}
                      x2="800"
                      y2={i * 50 + 25}
                      stroke="rgba(163, 157, 150, 0.08)"
                      strokeWidth="1"
                    />
                  ))}
                  {Array.from({ length: 15 }).map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * 50 + 50}
                      y1="0"
                      x2={i * 50 + 50}
                      y2="450"
                      stroke="rgba(163, 157, 150, 0.08)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Optical Conduit Beziers */}
                  <path
                    d="M 220 170 Q 340 100 430 140"
                    stroke="#a39d96"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                  <path
                    d="M 430 140 Q 520 130 650 160"
                    stroke="#a39d96"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                  <path
                    d="M 650 160 Q 610 240 590 280"
                    stroke="#a39d96"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                  <path
                    d="M 220 170 Q 250 280 290 340"
                    stroke="#a39d96"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                  <path
                    d="M 430 140 Q 480 210 590 280"
                    stroke="#d6d2cd"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />

                  {/* Nodes */}
                  <g className="cursor-pointer" onClick={() => setSelectedNode('IAD-01')}>
                    <circle cx="220" cy="170" r="14" fill="rgba(214, 210, 205, 0.15)" />
                    <circle cx="220" cy="170" r="5" fill="#f5f4f0" />
                    <text x="235" y="165" fill="#f5f4f0" fontSize="11" fontFamily="JetBrains Mono">
                      IAD-01 (0.42ms)
                    </text>
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedNode('FRA-01')}>
                    <circle cx="430" cy="140" r="14" fill="rgba(214, 210, 205, 0.15)" />
                    <circle cx="430" cy="140" r="5" fill="#f5f4f0" />
                    <text x="445" y="135" fill="#f5f4f0" fontSize="11" fontFamily="JetBrains Mono">
                      FRA-01 (0.81ms)
                    </text>
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedNode('NRT-01')}>
                    <circle cx="650" cy="160" r="14" fill="rgba(214, 210, 205, 0.15)" />
                    <circle cx="650" cy="160" r="5" fill="#f5f4f0" />
                    <text x="665" y="155" fill="#f5f4f0" fontSize="11" fontFamily="JetBrains Mono">
                      NRT-01 (1.18ms)
                    </text>
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedNode('SIN-01')}>
                    <circle cx="590" cy="280" r="12" fill="rgba(163, 157, 150, 0.15)" />
                    <circle cx="590" cy="280" r="4" fill="#d6d2cd" />
                    <text x="605" y="275" fill="#a39d96" fontSize="11" fontFamily="JetBrains Mono">
                      SIN-01 (1.62ms)
                    </text>
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedNode('GRU-01')}>
                    <circle cx="290" cy="340" r="12" fill="rgba(163, 157, 150, 0.15)" />
                    <circle cx="290" cy="340" r="4" fill="#d6d2cd" />
                    <text x="305" y="335" fill="#a39d96" fontSize="11" fontFamily="JetBrains Mono">
                      GRU-01 (2.15ms)
                    </text>
                  </g>
                </svg>

                <div className="absolute bottom-4 left-4 text-[10px] font-mono text-[#7a756f]">
                  OPTICAL TRANSIT TOPOLOGY // LATTICE MESH
                </div>
              </div>

              {/* Right: Edge Node Selector List */}
              <div className="space-y-3 font-mono text-xs">
                <div className="text-[11px] text-[#7a756f] uppercase tracking-widest mb-2">
                  Select Edge Point for Diagnostics
                </div>
                {edgeNodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      selectedNode === node.id
                        ? 'bg-[#1c1a17] border-[#d6d2cd]/50 shadow-taupe-glow'
                        : 'bg-[#141311] border-[#a39d96]/15 hover:border-[#a39d96]/35'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#f5f4f0]">{node.id}</span>
                      <span className="text-[#d6d2cd] font-semibold">{node.ping}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#7a756f]">
                      <span>{node.name}</span>
                      <span className="text-[10px] tracking-widest">{node.region}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA / FOOTER */}
      <section
        id="cta"
        ref={ctaRef}
        className={`relative z-10 py-36 px-6 sm:px-12 text-center transition-all duration-700 ease-out ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-xs font-mono uppercase tracking-[0.3em] text-[#a39d96] mb-6">
            // UNIFIED ARCHITECTURE 2026
          </span>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-sans tracking-tight text-[#f5f4f0] mb-6 leading-[1.1]">
            Awaken your infrastructure.
          </h2>

          <p className="text-base sm:text-xl text-[#a39d96] font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Step beyond fragile, unverified software. Anchor your systems and brand into the immutable bedrock
            of The Monolith.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setTerminalOpen(true)}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#e3dfd8] text-[#0a0908] font-bold text-xs tracking-widest uppercase transition-all duration-300 hover:bg-[#f5f4f0] shadow-taupe-glow hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              ACCESS TERMINAL
              <TerminalIcon className="w-4 h-4 text-[#0a0908]" />
            </button>
            <button
              onClick={() => setArchitectureModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#141311]/60 text-[#f5f4f0] border border-[#a39d96]/30 font-medium text-xs tracking-widest uppercase backdrop-blur-md transition-all duration-300 hover:border-[#d6d2cd] hover:bg-[#7a756f]/20 hover:text-[#f5f4f0]"
            >
              READ ARCHITECTURE SPEC
            </button>
          </div>
        </div>
      </section>

      {/* MINIMAL PRECISE FOOTER */}
      <footer className="relative z-10 py-16 px-6 sm:px-12 border-t border-[#a39d96]/15 bg-[#0a0908]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-4 h-5 rounded-sm bg-[#e3dfd8] flex items-center justify-center">
                <div className="w-1.5 h-2.5 bg-[#0a0908] rounded-[0.5px]" />
              </div>
              <span className="font-display font-bold tracking-widest text-xs uppercase text-[#f5f4f0]">
                The Monolith
              </span>
            </div>
            <p className="text-xs text-[#7a756f] max-w-sm mb-2">
              Bespoke enterprise software, immutable infrastructure, and high-concurrency systems.
            </p>
            <p className="text-xs font-mono text-[#a39d96]">
              Engineered by <span className="text-[#f5f4f0] font-semibold">Dulanja Abeysinghe</span> (Principal Systems Architect) & <span className="text-[#f5f4f0] font-semibold">Remashi Diyana</span> (Head of Creative Strategy)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 sm:gap-6 text-xs font-mono text-[#a39d96]">
            <a href="#architects" className="hover:text-[#f5f4f0] transition-colors">
              ARCHITECTS
            </a>
            <a href="#services" className="hover:text-[#f5f4f0] transition-colors">
              SERVICES
            </a>
            <a href="#cases" className="hover:text-[#f5f4f0] transition-colors">
              PROJECTS
            </a>
            <a href="#stack" className="hover:text-[#f5f4f0] transition-colors">
              STACK
            </a>
            <a href="#solutions" className="hover:text-[#f5f4f0] transition-colors">
              SOLUTIONS
            </a>
            <a href="#estimator" className="hover:text-[#f5f4f0] transition-colors">
              ESTIMATOR
            </a>
            <a href="#api" className="hover:text-[#f5f4f0] transition-colors">
              API
            </a>
            <a href="#infra" className="hover:text-[#f5f4f0] transition-colors">
              INFRASTRUCTURE
            </a>
            <button
              onClick={() => (isAdminLoggedIn ? setAdminPortalOpen(true) : setAdminLoginModalOpen(true))}
              className="text-[#f5f4f0] font-semibold flex items-center gap-1.5 hover:text-white transition-colors border-b border-[#a39d96]/30 pb-0.5"
            >
              <Lock className="w-3 h-3 text-[#d6d2cd]" />
              {isAdminLoggedIn ? 'EXECUTIVE PORTAL' : 'ADMIN LOGIN'}
            </button>
          </div>

          <div className="flex flex-col md:items-end text-xs font-mono text-[#7a756f] gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="mailto:dulanja150abeysinghe@gmail.com"
                className="text-[#d6d2cd] hover:text-[#f5f4f0] transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#a39d96]" />
                dulanja150abeysinghe@gmail.com
              </a>
              <span className="text-[#a39d96]/30">&middot;</span>
              <a
                href="mailto:diyanamashi@gmail.com"
                className="text-[#d6d2cd] hover:text-[#f5f4f0] transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#a39d96]" />
                diyanamashi@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5f4f0]" />
              <span className="text-[#a39d96]">CORE AI & CREATIVE FABRIC NOMINAL</span>
            </div>
            <span>&copy; 2026 THE MONOLITH &middot; DULANJA ABEYSINGHE & REMASHI DIYANA</span>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE TERMINAL DRAWER / MODAL */}
      {terminalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-[#141311] border border-[#a39d96]/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#a39d96]/15 bg-[#181614]">
              <div className="flex items-center gap-2.5">
                <TerminalIcon className="w-4 h-4 text-[#d6d2cd]" />
                <span className="text-xs font-mono text-[#f5f4f0] font-semibold tracking-wide">
                  THE MONOLITH // KERNEL CONSOLE v5.2
                </span>
              </div>
              <button
                onClick={() => setTerminalOpen(false)}
                className="p-1 rounded-lg text-[#7a756f] hover:text-[#f5f4f0] hover:bg-[#1c1a17] transition-colors"
                aria-label="Close terminal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-6 py-2.5 bg-[#0e0d0c] border-b border-[#a39d96]/10 overflow-x-auto text-[11px] font-mono">
              <span className="text-[#7a756f]">RUN:</span>
              {['admin', 'invoices', 'quotations', 'architect', 'services', 'marketing', 'projects', 'stack', 'estimate', 'status', 'benchmark', 'help'].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => setTerminalInput(cmd)}
                  className="px-2.5 py-1 rounded bg-[#1c1a17] text-[#a39d96] hover:text-[#f5f4f0] hover:bg-[#252320] border border-[#a39d96]/15 transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-[#e3dfd8] space-y-3 bg-[#0a0908]">
              {terminalCommands.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  {log.type === 'user' && (
                    <span className="text-[#f5f4f0] font-semibold">{log.text}</span>
                  )}
                  {log.type === 'system' && <span className="text-[#a39d96]">{log.text}</span>}
                  {log.type === 'response' && (
                    <pre className="text-[#d6d2cd] whitespace-pre-wrap">{log.text}</pre>
                  )}
                  {log.type === 'error' && (
                    <span className="text-[#d6d2cd] bg-red-950/20 px-1 py-0.5 rounded">
                      {log.text}
                    </span>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <form
              onSubmit={handleTerminalSubmit}
              className="flex items-center gap-2 px-6 py-3 border-t border-[#a39d96]/15 bg-[#141311]"
            >
              <span className="text-[#a39d96] font-mono text-xs">&gt;</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type 'help', 'services', or 'marketing'..."
                autoFocus
                className="flex-1 bg-transparent font-mono text-xs text-[#f5f4f0] focus:outline-none placeholder:text-[#7a756f]"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded bg-[#e3dfd8] text-[#0a0908] text-xs font-mono font-semibold uppercase hover:bg-[#f5f4f0] transition-colors"
              >
                EXEC
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ARCHITECTURE SPEC MODAL */}
      {architectureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-[#141311] border border-[#a39d96]/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#a39d96]/15 bg-[#181614]">
              <span className="text-xs font-mono tracking-widest text-[#a39d96] uppercase">
                // THE MONOLITH ARCHITECTURE SPECIFICATION
              </span>
              <button
                onClick={() => setArchitectureModalOpen(false)}
                className="p-1 rounded-lg text-[#7a756f] hover:text-[#f5f4f0] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 sm:p-10 overflow-y-auto space-y-6 text-[#a39d96] text-sm leading-relaxed font-light">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#f5f4f0] font-sans">
                The Magnetic Shard-Swarm Topology
              </h3>
              <p>
                The Monolith replaces traditional monolithic server clusters with an autonomous
                swarm of 320 hardware-isolated compute shards orbiting a central Core AI light
                source.
              </p>

              <div className="p-5 rounded-2xl bg-[#0a0908] border border-[#a39d96]/15 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#f5f4f0]">
                  Core Specifications
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="text-[#e3dfd8] block mb-0.5">I. SUB-LIGHT REARRANGEMENT</strong>
                    As workloads shift across the stack, shards mathematically alter their spatial
                    geometry from core clusters into parallel optical pipelines.
                  </div>
                  <div>
                    <strong className="text-[#e3dfd8] block mb-0.5">II. POST-QUANTUM HARDENING</strong>
                    Every memory frame is ciphered with Dilithium-5 lattice cryptography, ensuring
                    zero memory leakage even across adversarial edge nodes.
                  </div>
                  <div>
                    <strong className="text-[#e3dfd8] block mb-0.5">III. ZERO-COPY DESERIALIZATION</strong>
                    Eliminates garbage collector pauses and thread contention, allowing 10M+
                    operations per second at 0.14ms P99 latency.
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    setArchitectureModalOpen(false);
                    setTerminalOpen(true);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#e3dfd8] text-[#0a0908] font-bold text-xs tracking-wider uppercase hover:bg-[#f5f4f0] transition-colors"
                >
                  INITIALIZE ENCLAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASE STUDY DETAILS MODAL */}
      {selectedCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-[#141311] border border-[#a39d96]/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#a39d96]/15 bg-[#181614]">
              <span className="text-xs font-mono tracking-widest text-[#a39d96] uppercase">
                {selectedCaseStudy.client} // {selectedCaseStudy.category}
              </span>
              <button
                onClick={() => setSelectedCaseStudy(null)}
                className="p-1 rounded-lg text-[#7a756f] hover:text-[#f5f4f0] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 sm:p-10 overflow-y-auto space-y-6">
              <div>
                <span className="text-xs font-mono text-[#d6d2cd] uppercase tracking-wider block mb-1">
                  CASE AUDIT REPORT
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#f5f4f0] font-sans mb-2">
                  {selectedCaseStudy.title}
                </h3>
                <p className="text-sm text-[#d6d2cd] font-medium">{selectedCaseStudy.headline}</p>
              </div>

              <p className="text-sm text-[#a39d96] leading-relaxed font-light">
                {selectedCaseStudy.summary}
              </p>

              <div className="p-4 rounded-2xl bg-[#0a0908] border border-[#a39d96]/15">
                <span className="text-[10px] font-mono text-[#7a756f] block uppercase mb-2">
                  Technical Architecture Stack
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCaseStudy.stack.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#1c1a17] text-xs font-mono text-[#f5f4f0] border border-[#a39d96]/15"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0a0908] border border-[#a39d96]/15 font-mono text-xs">
                {selectedCaseStudy.metrics.map((spec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#141311] border border-[#a39d96]/10">
                    <span className="text-[10px] text-[#7a756f] block uppercase mb-1">
                      {spec.label}
                    </span>
                    <span className="text-sm font-semibold text-[#f5f4f0]">{spec.val}</span>
                  </div>
                ))}
              </div>

              {selectedCaseStudy.architectNote && (
                <div className="p-4 rounded-2xl bg-[#1c1a17]/80 border border-[#a39d96]/20 font-mono">
                  <span className="text-[10px] text-[#d6d2cd] block uppercase tracking-wider mb-1.5 font-semibold">
                    // ARCHITECTURAL IMPLEMENTATION NOTE
                  </span>
                  <p className="text-xs text-[#f5f4f0] leading-relaxed">
                    {selectedCaseStudy.architectNote}
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-mono text-[#7a756f]">STATUS: 100% NOMINAL</span>
                <button
                  onClick={() => {
                    setSelectedCaseStudy(null);
                    setTerminalOpen(true);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#e3dfd8] text-[#0a0908] font-bold text-xs tracking-wider uppercase hover:bg-[#f5f4f0] transition-colors"
                >
                  QUERY SPEC IN TERMINAL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXECUTIVE ADMIN PORTAL MODAL & SYSTEM ALERTS */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#141311] border border-[#a39d96]/40 text-[#f5f4f0] shadow-2xl font-mono text-xs animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#d6d2cd]" />
          <span>{adminToast.message}</span>
        </div>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        username={loginUsername}
        setUsername={setLoginUsername}
        password={loginPassword}
        setPassword={setLoginPassword}
        error={loginError}
        onSubmit={handleAdminLogin}
      />

      {/* Admin Portal Modal (Dashboard, Invoices, Quotations, Settings) */}
      <AdminPortalModal
        isOpen={adminPortalOpen}
        onClose={() => setAdminPortalOpen(false)}
        onLogout={handleAdminLogout}
        activeTab={adminActiveTab}
        setActiveTab={setAdminActiveTab}
        invoices={invoices}
        quotations={quotations}
        companyProfile={companyProfile}
        kpiStats={kpiStats}
        search={adminSearch}
        setSearch={setAdminSearch}
        statusFilter={adminStatusFilter}
        setStatusFilter={setAdminStatusFilter}
        onOpenCreateInvoice={handleOpenCreateInvoice}
        onOpenCreateQuotation={handleOpenCreateQuotation}
        onOpenEditDocument={handleOpenEditDocument}
        onOpenPreviewDocument={handleOpenPreviewDocument}
        onDuplicateDocument={handleDuplicateDocument}
        onDeleteDocument={handleDeleteDocument}
        onConvertQuotationToInvoice={handleConvertQuotationToInvoice}
        onToggleStatus={handleToggleStatus}
      />

      {/* Document Editor Modal (Create / Edit Invoices & Quotations) */}
      <DocumentEditorModal
        isOpen={editorModal.open}
        type={editorModal.type}
        mode={editorModal.mode}
        data={editorModal.data}
        onClose={() => setEditorModal({ open: false, type: 'invoice', mode: 'create', data: null })}
        onSave={handleSaveDocument}
      />

      {/* Document Print & PDF Preview Modal */}
      <DocumentPrintModal
        isOpen={previewModal.open}
        type={previewModal.type}
        data={previewModal.data}
        companyProfile={companyProfile}
        onClose={() => setPreviewModal({ open: false, type: 'invoice', data: null })}
        onEdit={(type, doc) => {
          setPreviewModal({ open: false, type: 'invoice', data: null });
          handleOpenEditDocument(type, doc);
        }}
      />
    </div>
  );
}
