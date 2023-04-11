const crypto = require('crypto');
const readline = require('readline');

// creates rl interface for reading from cli
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//define fucntion input
function input(question) {
  return new Promise((resolve, reject) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

(async function main(){
  //generate a 256 bit key
  const key = crypto.randomBytes(32).toString('hex');

  console.log("Your key is: " + key);

  let n = await input("Enter the number of shares: ");
  let m = await input("Enter the number of shares needed to reconstruct the key: ");

  n = Number(n);
  m = Number(m);

  let decimal = BigInt("0x" + key); 

  let coeffs = [decimal];

  let x_values = [];

  let shares = [];

  let shares_y_hex = [];

  let shares_x_hex = [];

  for(let i = 0; i < m - 1; i++){
    coeffs.push(coefficient(m+n));
  }
  
  for (let i = 1; i <= n; i++) {
    let x = x_value();
    let y = poly(x, coeffs);
    x_values.push(x);
    shares.push(y);
  }

  for (let i = 0; i < n; i++) {
    console.log("Share_" + (i+1) + ":" + "(" + x_values[i] + ";" + shares[i] + ")");
  }

  for (let i = 1; i <= n; i++) {
    let x_val = x_values[i-1];
    let y_val = shares[i-1];
    let x_hex = x_val.toString(16);
    let y_hex = y_val.toString(16);
    shares_x_hex.push(x_hex);
    shares_y_hex.push(y_hex);
  }

  for (let i = 0; i < n; i++) {
    console.log("secret_:" + i + " " + shares_x_hex[i].padStart(4, "0") + shares_y_hex[i]);
  }

  process.exit()
})()

function coefficient(size){
  const coef = crypto.randomBytes(size).toString('hex');
  return BigInt("0x" + coef);
}

// function x_value(){
//   const x = crypto.randomBytes(2).toString('hex');
//   return BigInt("0x" + x);
// }

function x_value() {
  let x = BigInt(0);
  while (x === BigInt(0)) {
    const randomBytes = crypto.randomBytes(2);
    x = BigInt('0x' + randomBytes.toString('hex'));
  }
  return x;
}

function poly(x, coeffs){
  let result = BigInt(0);
  for(let i = 0; i < coeffs.length; i++){
    i = BigInt(i);
    result += coeffs[i] * x ** i;
  }
  return result;
}