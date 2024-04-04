// Ex 3:
// ESTIMATED TIME: around 40 minutes, I have not worked with generator functions before
// It prints 4 3 2 1 0

function* negativeCounter(count) {
  while (count >= 0) {
    yield count--;
  }
}

//function counts the max (count) variable twice, 
function* minMaxCounter(count, resets) {
  if (resets <= 0) {
    for (const v of negativeCounter(count)) {
      console.log(v);
    }
    return;
  }

  while (resets > 0) {
    for (const v of negativeCounter(count)) {
      console.log(v);
    }

    for (let i = 1; i <= count; i++) {
      console.log(i);
    }

    resets--;
  }
}

const iterator = modifiedCounter(5, 3);
let result = iterator.next();

while (!result.done) {
  result = iterator.next();
}