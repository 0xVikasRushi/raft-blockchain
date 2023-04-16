import EventEmitter from "events";

export class Timer extends EventEmitter {
  timerId: any;
  randTime = 0;

  constructor() {
    super();
    this.timerId = null;
  }

  start(randTime: number) {
    this.randTime = randTime;
    this.timerId = setInterval(() => {
      this.emit("timeout");
    }, randTime);
  }

  stop() {
    clearInterval(this.timerId);
  }

  reset() {
    this.stop();
    this.start(this.randTime);
  }
}
