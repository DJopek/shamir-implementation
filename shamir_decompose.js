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

  // 1024 bit prime number
  const p = 170710135468633802373902797963023003448200376621205767451035144007114225176334129010565001622031278090983230001348856251081366174883694274536429880972840154866371035929692437560732171204507481222127040480698468063664391357003951462205648222778715772507708034473377741699096248230195561990428017619077625082111n;

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
    coeffs.push(coefficient(p));
  }
  
  for (let i = 1; i <= n; i++) {
    let x = x_value(p);
    let y = poly(x, coeffs, p);
    x_values.push(x);
    shares.push(y);
  }

  // for (let i = 0; i < n; i++) {
  //   console.log("Share_" + (i+1) + ":" + "(" + x_values[i] + ";" + shares[i] + ")");
  // }

  for (let i = 1; i <= n; i++) {
    let x_val = x_values[i-1];
    let y_val = shares[i-1];
    let x_hex = x_val.toString(16);
    let y_hex = y_val.toString(16);
    shares_x_hex.push(x_hex);
    shares_y_hex.push(y_hex);
  }

  console.log("");

  for (let i = 0; i < n; i++) {
    console.log("secret_:" + i + " " + shares_x_hex[i].padStart(4, "0") + shares_y_hex[i] + "\n");
  }

  console.log("Successfully generated " + n + " shares of your key. " + m + " shares are needed to reconstruct the key.");
  process.exit()
})()

// generate random coefficients from 1 to p-1, since we want to ensure that the polynomial(x) ≠ secret (we don't want a situation where all coefficients are 0)
function coefficient(p){
  // const coef = crypto.randomBytes(256).toString('hex');
  // return BigInt("0x" + coef) % p;
  let coef = BigInt(0);
  while (coef === BigInt(0)) {
    const randomBytes = crypto.randomBytes(256);
    coef = BigInt('0x' + randomBytes.toString('hex')) % p;
  }
  return coef;
}

// byte length of x values is 2 because we are combining x values and y values into one share and we want fix lenght of x values so we can split them into x and y values later
function x_value(p) {
  // you want non 0 x since we don't want to leak the secret (we want to ensure that the polynomial(x) ≠ secret)
  let x = BigInt(0);
  while (x === BigInt(0)) {
    const randomBytes = crypto.randomBytes(2);
    x = BigInt('0x' + randomBytes.toString('hex')) % p;
  }
  return x;
}

// polynomial function
function poly(x, coeffs, p){
  let result = BigInt(0);
  for(let i = 0; i < coeffs.length; i++){
    i = BigInt(i);
    result += coeffs[i] * x ** i;
  }
  return result % p;
}