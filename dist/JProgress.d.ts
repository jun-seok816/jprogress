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
export default class JprogressClass {
    private settings;
    private status;
    private queuePending;
    /**
     * 생성자: 옵션을 받아서 설정값을 초기화
     */
    constructor(options?: JprogressOptions);
    /**
     * 설정값 재정의
     */
    configure(options: JprogressOptions): this;
    /**
     * 진행 바를 특정 값(n)으로 설정
     * n=1이면 완료 후 페이드아웃
     */
    private set;
    /**
     * 진행 바가 시작되었는지 여부 (status가 숫자이면 시작)
     */
    private isStarted;
    /**
     * 진행 바를 0부터 시작. 이미 시작했다면 무시
     * trickle이 켜져 있으면 일정 간격으로 trickle() 호출
     */
    start(): this;
    /**
     * 진행 바를 100%로 설정하고 페이드아웃
     * force=true면 status가 없어도 강제로 완료
     */
    done(force?: boolean): this;
    /**
     * 현재 진행도를 일정 분량 증가
     * 인자 없으면 내부 규칙(0.1 ~ 0.005) 사용
     */
    private inc;
    /**
     * DOM에 #Jprogress 요소를 생성/재활용, 바 위치 지정
     */
    private render;
    /**
     * #Jprogress 요소 삭제, 관련 클래스 제거
     */
    remove(): void;
    /**
     * 브라우저가 지원하는 transform 방식을 결정
     */
    private getPositioningCSS;
    /**
     * 큐에 함수를 넣고, 필요 시 즉시 실행
     */
    private queue;
    /**
     * 큐의 다음 함수 실행
     */
    private next;
    /**
     * 숫자를 min/max 범위로 제한
     */
    private clamp;
    /**
     * 0~1 → -100% ~ 0% 로 변환
     */
    private toBarPerc;
    /**
     * 진행 바 위치 CSS 생성
     */
    private barPositionCSS;
    /**
     * 스타일 여러 개를 적용
     */
    private css;
    /**
     * 클래스 추가
     */
    private addClass;
    /**
     * 클래스 제거
     */
    private removeClass;
    /**
     * 클래스 보유 여부
     */
    private hasClass;
    /**
     * DOM에서 해당 요소 제거
     */
    private removeElement;
}
export {};
