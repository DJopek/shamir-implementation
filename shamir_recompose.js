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

  let m = await input("Enter the number of shares needed to reconstruct the key: ");

  m = Number(m);

  const x_values = [];
  const y_values = [];
  
  console.log("");

  for (let i = 0; i < m; i++) {
    const secret = await input(`Enter the Share_${i}: `);
    const x = BigInt(parseInt(secret.slice(0, 4), 16));
    const y_hex = secret.slice(4);
    const y = BigInt(h2d(y_hex));
    x_values.push(x);
    y_values.push(y);
    console.log("");
  }

  const x = x_values;
  const y = y_values;
  const result = lagrange_interpolation(x, y);
  secret = result.toString(16).padStart(64, "0");
  console.log("Recovered secret: " + secret);

  process.exit()

})();

function lagrange_interpolation(x, y) {
  /*
   * Given a set of points (x_i, y_i), returns the value of the Lagrange
   * interpolating polynomial evaluated at z.
   */
  const n = x.length;

  const p = 170710135468633802373902797963023003448200376621205767451035144007114225176334129010565001622031278090983230001348856251081366174883694274536429880972840154866371035929692437560732171204507481222127040480698468063664391357003951462205648222778715772507708034473377741699096248230195561990428017619077625082111n;

  let sum = 0n;

  for (let k = 0; k < n; k++) {

    let i_values = [];

    for (let i = 0; i < n; i++) {
      i_values.push(i);
    }

    let denominator = 1n;
    let numerator = 1n;

    for (let i of i_values) {
      if (k !== i) {

        let x_k = BigInt(x[k]);
        let x_i = BigInt(x[i]);

        numerator_withou_modulo = (0n - x_i);
        numerator_modulo = Modulo(numerator_withou_modulo, p);
        
        numerator *= numerator_modulo;
        denominator *= (x_k - x_i) % p;
      }
    }
    sum += BigInt(y[k]) * BigInt(numerator) * BigInt(modInverse(denominator, p));
  }

  return sum % p;
}

//lagrange interpolation function is this but in code:
//\sum_{k=0}^{n-1}\left(y_{k}\left(\prod_{i=0,i\ne k}^{n-1}\frac{x-x_{i}}{x_{k}-x_{i}}\right)\right) (put this into desmos.com for example)

//modular inverse function
function modInverse(a, m) {
  a = BigInt(a);
  m = BigInt(m);
  a = (a % m + m) % m;

  // find the gcd
  const s = [];
  let b = m;
  while (b) {
    [a, b] = [b, a % b];
    s.push({ a, b });
  }

  // find the inverse
  let x = 1n;
  let y = 0n;
  for (let i = s.length - 2; i >= 0; --i) {
    [x, y] = [y, x - y * (s[i].a / s[i].b)];
  }
  return (y % m + m) % m;
}

function Modulo(x, y) {
  return ((x % y) + y) % y;
}

//hex to decimal function
function h2d(s) {

  function add(x, y) {
      var c = 0, r = [];
      var x = x.split('').map(Number);
      var y = y.split('').map(Number);
      while(x.length || y.length) {
          var s = (x.pop() || 0) + (y.pop() || 0) + c;
          r.unshift(s < 10 ? s : s - 10); 
          c = s < 10 ? 0 : 1;
      }
      if(c) r.unshift(c);
      return r.join('');
  }

  var dec = '0';
  s.split('').forEach(function(chr) {
      var n = parseInt(chr, 16);
      for(var t = 8; t; t >>= 1) {
          dec = add(dec, dec);
          if(n & t) dec = add(dec, '1');
      }
  });
  return dec;
}