import './Jprogress.scss';
type JprogressOptions = Partial<JprogressSettings>;

interface JprogressSettings {
  minimum: number;
  easing: string;
  positionUsing: string;
  speed: number;
  trickle: boolean;
  trickleSpeed: number;
  showSpinner: boolean;
  barSelector: string;
  spinnerSelector: string;
  parent: HTMLElement | string;
  template: string;
}

type QueueFunction = (next: () => void) => void;

const defaultSettings: JprogressSettings = {
  minimum: 0.08,
  easing: "linear",
  positionUsing: "",
  speed: 200,
  trickle: true,
  trickleSpeed: 200,
  showSpinner: true,
  barSelector: '[role="bar"]',
  spinnerSelector: '[role="spinner"]',
  parent: "body",
  template:
    '<div class="bar" role="bar">' +
    '<div class="peg"></div>' +
    "</div>" +
    '<div class="spinner" role="spinner">' +
    '<div class="spinner-icon"></div>' +
    "</div>",
};

export default class JprogressClass {  

  // 설정값 (기본값 + 사용자 설정 병합)
  private settings: JprogressSettings;

  // 현재 진행 상태(0~1). 1이면 곧 null 처리하여 '끝' 상태를 의미
  private status: number | null = null;

  // 애니메이션 실행 단계를 위한 내부 작업 큐
  private queuePending: QueueFunction[] = [];

  /**
   * 생성자: 옵션을 받아서 설정값을 초기화
   */
  constructor(options?: JprogressOptions) {
    // 기본 설정에 유저 옵션을 덮어씌움
    this.settings = {
      ...defaultSettings,
    };

    if (options) {
      this.configure(options);
    }
  }

  /**
   * 설정값 재정의
   */
  public configure(options: JprogressOptions): this {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        const value = (options as any)[key];
        if (value !== undefined) {
          (this.settings as any)[key] = value;
        }
      }
    }
    return this;
  }

  /**
   * 진행 바를 특정 값(n)으로 설정
   * n=1이면 완료 후 페이드아웃
   */
  private set(n: number): this {
    const { minimum, speed, easing } = this.settings;
    const started = this.isStarted();

    // 범위 제한
    n = this.clamp(n, minimum, 1);
    this.status = n === 1 ? null : n;

    // 처음 시작이면 fromStart 플래그를 줌
    const progress = this.render(!started);
    const bar = progress.querySelector(
      this.settings.barSelector
    ) as HTMLElement;

    // 리페인트 강제
    //progress.offsetWidth;

    // 큐에 작업을 등록 (이전 작업 끝난 후 실행)
    this.queue((next) => {
      // positionUsing 아직 결정 안 됐다면 한 번만 설정
      if (!this.settings.positionUsing) {
        this.settings.positionUsing = this.getPositioningCSS();
      }

      // CSS 설정
      this.css(bar, this.barPositionCSS(n, speed, easing));

      if (n === 1) {
        // 100%인 경우 페이드아웃 후 remove()
        this.css(progress, { transition: "none", opacity: "1" });
        //progress.offsetWidth; // 리페인트

        setTimeout(() => {
          this.css(progress, {
            transition: `all ${speed}ms linear`,
            opacity: "0",
          });
          setTimeout(() => {
            this.remove();
            next();
          }, speed);
        }, speed);
      } else {
        // 완료 전이면 일정 시간 후 다음 작업
        setTimeout(next, speed);
      }
    });

    return this;
  }

  /**
   * 진행 바가 시작되었는지 여부 (status가 숫자이면 시작)
   */
  private isStarted(): boolean {
    return typeof this.status === "number";
  }

  /**
   * 진행 바를 0부터 시작. 이미 시작했다면 무시
   * trickle이 켜져 있으면 일정 간격으로 trickle() 호출
   */
  public start(): this {
    if (!this.status) {
      this.set(0);
    }
    if (this.settings.trickle) {
      const tick = () => {
        setTimeout(() => {
          // status가 null이 되어버렸다면 이미 끝난 상태이므로 중단
          if (!this.status) return;
          this.inc();
          tick();
        }, this.settings.trickleSpeed);
      };
      tick();
    }
    return this;
  }

  /**
   * 진행 바를 100%로 설정하고 페이드아웃
   * force=true면 status가 없어도 강제로 완료
   */
  public done(force?: boolean): this {
    if (!force && !this.status) {
      return this;
    }
    // 0.3~0.8 사이 임의 증가 후 1
    return this.inc(0.3 + 0.5 * Math.random()).set(1);
  }

  /**
   * 현재 진행도를 일정 분량 증가
   * 인자 없으면 내부 규칙(0.1 ~ 0.005) 사용
   */
  private inc(amount?: number): this {
    let n = this.status;

    // 아직 시작 안 했다면 start()부터
    if (!n) {
      return this.start();
    }
    // 이미 1 이상이면 종료 상태
    else if (n > 1) {
      return this;
    }
    // 자동 증가 로직
    else {
      if (typeof amount !== "number") {
        if (n < 0.2) amount = 0.1;
        else if (n < 0.5) amount = 0.04;
        else if (n < 0.8) amount = 0.02;
        else if (n < 0.99) amount = 0.005;
        else amount = 0;
      }
      n = this.clamp(n + amount, 0, 0.994);
      return this.set(n);
    }
  }
  /**
   * DOM에 #Jprogress 요소를 생성/재활용, 바 위치 지정
   */
  private render(fromStart?: boolean): HTMLElement {
    // 이미 존재하면 반환
    const existing = document.getElementById("Jprogress");
    if (existing) {
      return existing;
    }

    this.addClass(document.documentElement, "Jprogress-busy");

    const progress = document.createElement("div");
    progress.id = "Jprogress";
    progress.innerHTML = this.settings.template;

    const bar = progress.querySelector(
      this.settings.barSelector
    ) as HTMLElement;
    const perc = fromStart ? "-100" : this.toBarPerc(this.status || 0);

    this.css(bar, {
      transition: "all 0 linear",
      transform: `translate3d(${perc}%,0,0)`,
    });

    if (!this.settings.showSpinner) {
      const spinner = progress.querySelector(this.settings.spinnerSelector);
      if (spinner) {
        this.removeElement(spinner as HTMLElement);
      }
    }

    // parent 설정에 따라 body 이외에도 삽입 가능
    const parent =
      typeof this.settings.parent === "string"
        ? document.querySelector(this.settings.parent)
        : this.settings.parent;
    const realParent = parent || document.body;

    if (realParent !== document.body) {
      this.addClass(realParent as HTMLElement, "Jprogress-custom-parent");
    }
    realParent.appendChild(progress);

    return progress;
  }

  /**
   * #Jprogress 요소 삭제, 관련 클래스 제거
   */
  public remove(): void {
    this.removeClass(document.documentElement, "Jprogress-busy");

    const parent =
      typeof this.settings.parent === "string"
        ? document.querySelector(this.settings.parent)
        : this.settings.parent;

    if (parent && parent !== document.body) {
      this.removeClass(parent as HTMLElement, "Jprogress-custom-parent");
    }

    const progress = document.getElementById("Jprogress");
    if (progress) {
      this.removeElement(progress);
    }
  }

  /**
   * 브라우저가 지원하는 transform 방식을 결정
   */
  private getPositioningCSS(): string {
    const bodyStyle = document.body.style;
    const vendorPrefix =
      "WebkitTransform" in bodyStyle
        ? "Webkit"
        : "MozTransform" in bodyStyle
        ? "Moz"
        : "msTransform" in bodyStyle
        ? "ms"
        : "OTransform" in bodyStyle
        ? "O"
        : "";

    if (`${vendorPrefix}Perspective` in bodyStyle) {
      return "translate3d";
    } else if (`${vendorPrefix}Transform` in bodyStyle) {
      return "translate";
    } else {
      return "margin";
    }
  }

  // -------------------[ 내부 유틸 메서드들 ]-------------------

  /**
   * 큐에 함수를 넣고, 필요 시 즉시 실행
   */
  private queue(fn: QueueFunction): void {
    this.queuePending.push(fn);
    // 현재 실행 중인 작업이 없으면 바로 next() 시작
    if (this.queuePending.length === 1) {
      this.next();
    }
  }

  /**
   * 큐의 다음 함수 실행
   */
  private next(): void {
    const fn = this.queuePending.shift();
    if (fn) {
      fn(() => this.next());
    }
  }

  /**
   * 숫자를 min/max 범위로 제한
   */
  private clamp(n: number, min: number, max: number): number {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  /**
   * 0~1 → -100% ~ 0% 로 변환
   */
  private toBarPerc(n: number): string {
    return String((n - 1) * 100);
  }

  /**
   * 진행 바 위치 CSS 생성
   */
  private barPositionCSS(
    n: number,
    speed: number,
    ease: string
  ): Partial<CSSStyleDeclaration> {
    let transform: string | undefined;

    if (this.settings.positionUsing === "translate3d") {
      transform = `translate3d(${this.toBarPerc(n)}%,0,0)`;
    } else if (this.settings.positionUsing === "translate") {
      transform = `translate(${this.toBarPerc(n)}%,0)`;
    } else {
      // margin-left 방식을 사용
      return {
        transition: `all ${speed}ms ${ease}`,
        marginLeft: `${this.toBarPerc(n)}%`,
      };
    }

    return {
      transition: `all ${speed}ms ${ease}`,
      transform,
    };
  }

  /**
   * 스타일 여러 개를 적용
   */
  private css(
    element: HTMLElement,
    properties: Partial<CSSStyleDeclaration>
  ): void {
    for (const prop in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, prop)) {
        (element.style as any)[prop] =
          properties[prop as keyof CSSStyleDeclaration];
      }
    }
  }

  /**
   * 클래스 추가
   */
  private addClass(element: HTMLElement, className: string): void {
    if (!element) return;
    if (!this.hasClass(element, className)) {
      element.className = (element.className + " " + className).trim();
    }
  }

  /**
   * 클래스 제거
   */
  private removeClass(element: HTMLElement, className: string): void {
    if (!element) return;
    const oldList = ` ${element.className} `;
    const newList = oldList.replace(` ${className} `, " ").trim();
    element.className = newList;
  }

  /**
   * 클래스 보유 여부
   */
  private hasClass(element: HTMLElement, className: string): boolean {
    if (!element) return false;
    return ` ${element.className} `.indexOf(` ${className} `) >= 0;
  }

  /**
   * DOM에서 해당 요소 제거
   */
  private removeElement(element: HTMLElement): void {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}
