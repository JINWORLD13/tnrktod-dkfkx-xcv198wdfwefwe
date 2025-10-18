import React, { useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

const CanvasMetrics = ({ onMetricsUpdate }) => {
  const { gl } = useThree();
  const prevTimeRef = React.useRef(performance.now());
  

  useFrame(() => {
    const info = gl.info;
    const currentTime = performance.now();
    const frameTime = currentTime - prevTimeRef.current;

    onMetricsUpdate({
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      frameTime: frameTime,
    });

    prevTimeRef.current = currentTime;
  });

  return null;
};

const CanvasPerformanceWrapper = ({ children, id }) => {
  const [canvasMetrics, setCanvasMetrics] = useState({
    drawCalls: 0,
    triangles: 0,
    frameTime: 0,
  });

  const handleMetricsUpdate = newMetrics => {
    setCanvasMetrics(newMetrics);
  };

  /** 
   *! 예시
   * Draw Calls: 26
   * 이는 한 프레임을 렌더링하는 데 필요한 GPU 명령의 수입니다. 각 Draw Call은 GPU에 대한 별도의 작업을 나타내며, 일반적으로 적을수록 좋습니다. 26은 비교적 적은 수로, 효율적인 렌더링을 나타냅니다.
   * 
   * Triangles: 956
   * 이는 화면에 그려지는 삼각형의 총 개수입니다. 3D 그래픽에서 모든 객체는 궁극적으로 삼각형으로 구성됩니다. 956개는 비교적 단순한 장면을 나타냅니다. 복잡한 3D 게임이나 애플리케이션에서는 이 수가 수십만 또는 수백만에 이를 수 있습니다.
   * 
   * Frame Time: 20.60 ms
   * 이는 한 프레임을 완전히 렌더링하는 데 걸리는 시간입니다. 20.60 밀리초는 초당 약 48.5 프레임(1000ms / 20.60ms)에 해당합니다. 일반적으로 60 FPS(프레임당 약 16.7ms)가 부드러운 애니메이션의 기준으로 여겨집니다. 20.60ms는 그보다 약간 느리지만, 여전히 대부분의 애플리케이션에서 수용 가능한 수준입니다.
   * 
   * 종합적으로, 이 메트릭은 다음을 나타냅니다:
   * 렌더링 효율성이 좋음 (낮은 Draw Calls)
   * 비교적 단순한 3D 장면 (적은 수의 삼각형)
   * 약간 최적화가 필요한 프레임 레이트 (48.5 FPS)
  */

  return (
    <PerformanceWrapper id={id}>
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          children: (
            <>
              {child.props.children}
              <CanvasMetrics onMetricsUpdate={handleMetricsUpdate} />
            </>
          ),
        })
      )}
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: 10,
          borderRadius: 5,
          zIndex: 1000,
        }}
      >
        <h4>Canvas Metrics</h4>
        <p>Draw Calls: {canvasMetrics.drawCalls}</p>
        <p>Triangles: {canvasMetrics.triangles}</p>
        <p>Frame Time: {canvasMetrics.frameTime.toFixed(2)} ms</p>
      </div>
    </PerformanceWrapper>
  );
};

export default CanvasPerformanceWrapper;

// ! 사용예시
// <CanvasPerformanceWrapper>three.js의 캔버스 태그</CanvasPerformanceWrapper>