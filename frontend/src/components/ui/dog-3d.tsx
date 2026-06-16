"use client"

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

function DogModel(props: any) {
  const group = useRef<THREE.Group>(null)
  const frontLeftLeg = useRef<THREE.Group>(null)
  const frontRightLeg = useRef<THREE.Group>(null)
  const backLeftLeg = useRef<THREE.Group>(null)
  const backRightLeg = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)

  // Custom PetCenter colors
  const furColor = "#f59e0b" // petcenter-cta
  const darkColor = "#1f261f" // petcenter-text
  const lightColor = "#ffffff"

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const speed = 15 // Tốc độ chạy nhanh

    // Tính góc vung chân (từ -45 độ đến 45 độ)
    const swing = Math.sin(t * speed) * (Math.PI / 4)

    // Hai chân chéo nhau cùng tiến/lùi
    if (frontLeftLeg.current) frontLeftLeg.current.rotation.x = swing
    if (backRightLeg.current) backRightLeg.current.rotation.x = swing

    if (frontRightLeg.current) frontRightLeg.current.rotation.x = -swing
    if (backLeftLeg.current) backLeftLeg.current.rotation.x = -swing

    // Toàn bộ thân nhấp nhô khi chạy
    if (body.current) {
      body.current.position.y = 1.2 + Math.abs(Math.sin(t * speed)) * 0.15
    }

    // Đuôi vẫy
    if (tail.current) {
      tail.current.rotation.z = Math.sin(t * speed * 0.8) * 0.3
      tail.current.rotation.x = Math.PI / 4 + Math.sin(t * speed * 0.5) * 0.1
    }
  })

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Container của chó, position y=1.2 để chân chạm mốc 0 */}
      <group ref={body} position={[0, 1.2, 0]}>

        {/* Thân chó */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 2.2]} />
          <meshStandardMaterial color={furColor} />
        </mesh>

        {/* Đầu chó (Nằm trước thân một chút) */}
        <group position={[0, 0.7, 1.2]}>
          <mesh>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshStandardMaterial color={furColor} />
          </mesh>
          {/* Mõm chó */}
          <mesh position={[0, -0.2, 0.8]}>
            <boxGeometry args={[0.6, 0.5, 0.6]} />
            <meshStandardMaterial color={lightColor} />
          </mesh>
          {/* Mũi đen */}
          <mesh position={[0, -0.1, 1.15]}>
            <boxGeometry args={[0.2, 0.15, 0.1]} />
            <meshStandardMaterial color={darkColor} />
          </mesh>
          {/* Tai trái */}
          <mesh position={[-0.5, 0.8, 0]}>
            <boxGeometry args={[0.3, 0.5, 0.4]} />
            <meshStandardMaterial color={darkColor} />
          </mesh>
          {/* Tai phải */}
          <mesh position={[0.5, 0.8, 0]}>
            <boxGeometry args={[0.3, 0.5, 0.4]} />
            <meshStandardMaterial color={darkColor} />
          </mesh>
        </group>

        {/* Đuôi chó - Có pivot group để vẫy từ gốc đuôi */}
        <group ref={tail} position={[0, 0.4, -1.1]} rotation={[Math.PI / 4, 0, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color={darkColor} />
          </mesh>
        </group>

        {/* Cụm Chân (Nằm dưới thân) */}
        <group position={[0, -0.5, 0]}>
          {/* Chân trước trái (Pivot ở y=0) */}
          <group ref={frontLeftLeg} position={[-0.35, 0, 0.8]}>
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[0.3, 0.8, 0.3]} />
              <meshStandardMaterial color={lightColor} />
            </mesh>
          </group>
          {/* Chân trước phải */}
          <group ref={frontRightLeg} position={[0.35, 0, 0.8]}>
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[0.3, 0.8, 0.3]} />
              <meshStandardMaterial color={lightColor} />
            </mesh>
          </group>
          {/* Chân sau trái */}
          <group ref={backLeftLeg} position={[-0.35, 0, -0.8]}>
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[0.3, 0.8, 0.3]} />
              <meshStandardMaterial color={lightColor} />
            </mesh>
          </group>
          {/* Chân sau phải */}
          <group ref={backRightLeg} position={[0.35, 0, -0.8]}>
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[0.3, 0.8, 0.3]} />
              <meshStandardMaterial color={lightColor} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

export function Dog3DScene() {
  return (
    <div className="w-48 h-48 relative -ml-4">
      <Canvas camera={{ position: [5, 3, 5], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
        {/* Fill light */}
        <directionalLight position={[-10, 5, -5]} intensity={0.5} />

        {/* Model chó 3D */}
        <DogModel />

        {/* Đổ bóng (Shadow) siêu mượt dưới chân */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.3}
          scale={10}
          blur={2.5}
          far={4}
        />
      </Canvas>
    </div>
  )
}
