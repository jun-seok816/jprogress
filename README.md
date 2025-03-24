# JprogressClass 소개

이 문서는 `JprogressClass`에 대한 소개와 사용법을 설명합니다.

## 개요

`JprogressClass`는 진행 바(progress bar)를 생성하고 관리하기 위한 클래스입니다.  
이 클래스는 기본 설정(`defaultSettings`)과 사용자 옵션(`JprogressOptions`)을 병합하여 진행 바의 동작을 제어하며, DOM 요소 추가/제거, CSS 애니메이션 적용, 그리고 내부 작업 큐를 통해 순차적 애니메이션 효과를 구현합니다.

## 주요 기능

- **초기화 및 설정**  
  - 기본 설정과 사용자가 제공한 옵션을 병합하여 진행 바의 동작을 제어합니다.
- **진행 상태 관리**  
  - 진행 상태를 0부터 1까지의 값으로 관리하며, 1이 되면 완료 상태로 간주합니다.
- **자동 증가 (Trickle)**  
  - `trickle` 옵션이 활성화된 경우, 일정 간격으로 자동으로 진행 상태를 증가시켜 자연스러운 진행 효과를 줍니다.
- **애니메이션 및 CSS 제어**  
  - 진행 바의 위치 및 전환 효과를 CSS 스타일과 애니메이션을 이용해 부드럽게 구현합니다.
- **DOM 관리**  
  - 진행 바 요소를 동적으로 생성, 업데이트 및 제거하여 DOM을 효율적으로 관리합니다.
- **내부 작업 큐**  
  - 작업 큐(`queuePending`)를 사용하여 애니메이션 단계별 작업을 순차적으로 처리합니다.

## 클래스 구성

### 생성자

```typescript
constructor(options?: JprogressOptions)
```

- 기본 설정과 사용자 옵션을 병합하여 초기화합니다.

### 주요 메서드

- **configure(options: JprogressOptions): this**  
  사용자가 지정한 옵션을 기존 설정에 병합하여 업데이트합니다.

- **start(): this**  
  진행 바를 시작하며, `trickle` 옵션에 따라 자동으로 진행 상태를 증가시킵니다.

- **done(force?: boolean): this**  
  진행 바를 100%로 설정한 후 페이드아웃 효과를 적용하여 종료합니다.  
  `force` 옵션을 통해 강제 완료할 수 있습니다.

- **set(n: number): this**  
  진행 바의 현재 상태를 특정 값(`n`)으로 설정합니다.  
  값이 1이면 완료 상태로 전환하며, 페이드아웃 후 DOM에서 제거됩니다.

- **inc(amount?: number): this**  
  진행 상태를 내부 규칙 또는 지정한 값만큼 증가시킵니다.

- **render(fromStart?: boolean): HTMLElement**  
  진행 바를 DOM에 생성(또는 재활용)하며, 초기 위치 및 CSS 스타일을 설정합니다.

- **remove(): void**  
  DOM에서 진행 바 요소를 제거하고, 관련 CSS 클래스를 정리합니다.

### 내부 유틸 메서드

- **queue(fn: QueueFunction): void**  
  애니메이션 작업을 내부 큐에 등록하고, 순차적으로 실행합니다.

- **next(): void**  
  큐에서 다음 작업을 실행합니다.

- **clamp(n: number, min: number, max: number): number**  
  숫자 `n`을 지정한 최소값과 최대값 사이로 제한합니다.

- **toBarPerc(n: number): string**  
  0~1 범위의 숫자 값을 진행 바의 위치(% 값)로 변환합니다.

- **barPositionCSS(n: number, speed: number, ease: string): Partial<CSSStyleDeclaration>**  
  진행 바에 적용할 CSS 스타일(전환 효과 및 위치)을 생성합니다.

- **css(element: HTMLElement, properties: Partial<CSSStyleDeclaration>): void**  
  지정된 DOM 요소에 여러 CSS 스타일을 적용합니다.

- **addClass, removeClass, hasClass, removeElement**  
  DOM 요소의 클래스 추가/제거 및 요소 제거와 관련된 유틸리티 메서드들입니다.

## 사용 예시

```typescript
import JprogressClass from './JprogressClass';

const progress = new JprogressClass({
  speed: 300,
  trickle: true,
});

// 진행 바 시작
progress.start();

// 필요에 따라 진행 상태 증가 또는 완료 처리
// progress.inc(); // 진행 상태 증가
// progress.done(); // 완료 처리 (100% -> 페이드아웃)
```

## 결론

`JprogressClass`는 사용자 정의 옵션을 통해 진행 바의 동작을 세밀하게 제어할 수 있는 유연한 클래스입니다.  
내부적으로 DOM 요소 관리, CSS 애니메이션, 그리고 작업 큐를 활용하여 부드럽고 자연스러운 진행 바 효과를 구현합니다.
