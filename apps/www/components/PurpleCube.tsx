'use client';

export function PurpleCube() {
  return (
    <mesh position={[1.1, 0.1, 0]} rotation={[0.35, 0.45, 0]}>
      <boxGeometry args={[1.45, 1.45, 1.45]} />
      <meshStandardMaterial color="#8b5cf6" />
    </mesh>
  );
}
