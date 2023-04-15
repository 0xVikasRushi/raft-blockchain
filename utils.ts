export function getTimeout() {
  return getRandomIntInclusive(5000, 10000);
}

export function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
export function countTrue(array: boolean[]) {
  let cnt = 0;
  array.forEach((i) => {
    if (i) {
      cnt++;
    }
  });
  return cnt;
}

interface Vote {
  term: number;
  voteGranted: boolean;
}

export function countVotes(arr: Vote[]): {
  trueCount: number;
  falseCount: number;
} {
  let trueCount = 0;
  let falseCount = 0;

  arr.forEach((obj) => {
    if (obj.voteGranted === true) {
      trueCount++;
    } else {
      falseCount++;
    }
  });

  return { trueCount, falseCount };
}
