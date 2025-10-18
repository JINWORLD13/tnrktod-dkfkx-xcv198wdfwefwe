import React from 'react';
// SceneDebugger.jsx
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { isDevelopmentMode } from '@/utils/constants';

export function SceneDebugger() {
  const { scene, gl } = useThree();
  const metricsRef = useRef({
    drawCalls: 0,
    triangles: 0,
    textures: 0,
    geometries: 0,
    logs: [],
  });
  const initTimeRef = useRef(Date.now());

  // 로그 기록 함수
  const log = (message, type = 'info') => {
    const timestamp = ((Date.now() - initTimeRef.current) / 1000).toFixed(2);
    const logMessage = `[${timestamp}s] ${message}`;

    metricsRef.current.logs.push({
      timestamp,
      message,
      type,
      id: Date.now(),
    });

    switch (type) {
      case 'error':
        console.error(`🔴 ${logMessage}`);
        break;
      case 'warning':
        console.warn(`⚠️ ${logMessage}`);
        break;
      default:
        if (isDevelopmentMode) {
          console.log(logMessage);
        }
    }
  };

  // 초기 scene 분석
  useEffect(() => {
    let objectCount = 0;
    let meshCount = 0;
    let materialCount = 0;
    let textureCount = 0;
    let totalVertices = 0;

    scene.traverse(object => {
      objectCount++;

      if (object.isMesh) {
        meshCount++;
        if (object.geometry) {
          const vertexCount = object.geometry.attributes.position?.count || 0;
          totalVertices += vertexCount;
        }
        if (object.material) {
          materialCount++;
          if (object.material.map) textureCount++;
        }
      }
    });

    log(`Scene 분석 결과:
- Objects: ${objectCount}
- Meshes: ${meshCount}
- Materials: ${materialCount}
- Textures: ${textureCount}
- Total Vertices: ${totalVertices}`);

    // WebGL 지원 정보 확인
    const debugInfo = gl.getContext().getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl
        .getContext()
        .getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl
        .getContext()
        .getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      log(`WebGL 정보:
- Vendor: ${vendor}
- Renderer: ${renderer}
- Max Texture Size: ${gl
        .getContext()
        .getParameter(gl.getContext().MAX_TEXTURE_SIZE)}`);
    }
  }, [scene, gl]);

  // 매 프레임마다 성능 메트릭 수집
  useFrame(() => {
    if (!gl?.info) return;

    const info = gl.info;
    const currentMetrics = {
      drawCalls: info.render?.calls || 0,
      triangles: info.render?.triangles || 0,
      textures: info.memory?.textures || 0,
      geometries: info.memory?.geometries || 0,
    };

    // 성능 경고 체크
    if (
      currentMetrics.drawCalls > 1000 &&
      currentMetrics.drawCalls !== metricsRef.current.drawCalls
    ) {
      log(`높은 드로우콜 수 감지: ${currentMetrics.drawCalls}`, 'warning');
    }
    if (
      currentMetrics.triangles > 1000000 &&
      currentMetrics.triangles !== metricsRef.current.triangles
    ) {
      log(`높은 폴리곤 수 감지: ${currentMetrics.triangles}`, 'warning');
    }
    if (
      currentMetrics.textures > 100 &&
      currentMetrics.textures !== metricsRef.current.textures
    ) {
      log(`높은 텍스처 수 감지: ${currentMetrics.textures}`, 'warning');
    }

    Object.assign(metricsRef.current, currentMetrics);
  });

  // 화면에 디버그 정보 표시 (development 모드에서만)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const debugElement = document.createElement('div');
      debugElement.style.cssText = `
                position: fixed;
                bottom: 10px;
                left: 10px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 10px;
                font-family: monospace;
                font-size: 12px;
                z-index: 1000000;
                max-height: 200px;
                overflow-y: auto;
            `;
      document.body.appendChild(debugElement);

      const updateDebugInfo = () => {
        debugElement.innerHTML = `
                    Draw Calls: ${metricsRef.current.drawCalls}<br/>
                    Triangles: ${metricsRef.current.triangles}<br/>
                    Textures: ${metricsRef.current.textures}<br/>
                    Geometries: ${metricsRef.current.geometries}<br/>
                    <hr/>
                    ${metricsRef.current.logs
                      .slice(-5)
                      .map(
                        log =>
                          `<div style="color: ${
                            log.type === 'error'
                              ? 'red'
                              : log.type === 'warning'
                              ? 'yellow'
                              : 'white'
                          }">[${log.timestamp}s] ${log.message}</div>`
                      )
                      .join('')}
                `;
        requestAnimationFrame(updateDebugInfo);
      };

      updateDebugInfo();

      return () => {
        document.body.removeChild(debugElement);
      };
    }
  }, []);

  return null;
}
