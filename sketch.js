let img;
let sepiaImg;
let startTime = null;
let input;
let maxButton;

// 劣化量
// 0 = 元画像
// 1 = 完全セピア
let fadeAmount = 0;

// iPad用タッチ記録
let prevTouchX = null;
let prevTouchY = null;

function setup() {

  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);

  // =====================
  // 画像アップロード
  // =====================
  input = createFileInput(handleFile);
  input.position(10, 10);

  // =====================
  // MAXボタン
  // =====================
  maxButton = createButton("MAX SEPIA");
  maxButton.position(10, 40);

  maxButton.mousePressed(() => {
    fadeAmount = 1;
  });

  background(0);

  // =====================
  // iPadスクロール防止
  // =====================
  document.body.style.overflow = 'hidden';

  // iOSジェスチャ防止
  document.addEventListener(
    'touchmove',
    function(e) {
      e.preventDefault();
    },
    { passive: false }
  );
}

function handleFile(file) {

  if (file.type === 'image') {

    img = loadImage(file.data, () => {

      // 軽量化
      img.resize(1200, 0);

      // =====================
      // セピア画像生成
      // =====================
      sepiaImg = img.get();

      sepiaImg.loadPixels();

      for (let i = 0; i < sepiaImg.pixels.length; i += 4) {

        let r = sepiaImg.pixels[i];
        let g = sepiaImg.pixels[i + 1];
        let b = sepiaImg.pixels[i + 2];

        // セピア変換
        sepiaImg.pixels[i]     = 0.393 * r + 0.769 * g + 0.189 * b;
        sepiaImg.pixels[i + 1] = 0.349 * r + 0.686 * g + 0.168 * b;
        sepiaImg.pixels[i + 2] = 0.272 * r + 0.534 * g + 0.131 * b;
      }

      sepiaImg.updatePixels();

      // 時間開始
      startTime = millis();

      // ボタン隠す
      input.hide();
    });
  }
}

function draw() {

  background(0);

  // =====================
  // 未ロード時
  // =====================
  if (!img || !sepiaImg || startTime === null) {

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("画像をアップロードしてください", width / 2, height / 2);

    return;
  }

  // =====================
  // 時間経過で劣化
  // =====================
  fadeAmount += 0.0005;

  fadeAmount = constrain(fadeAmount, 0, 1);

  // なめらか補正
  let fadeSmooth = pow(fadeAmount, 1.5);

  // =====================
  // アスペクト比維持
  // =====================
  let imgRatio = img.width / img.height;
  let screenRatio = width / height;

  let drawWidth;
  let drawHeight;

  if (imgRatio > screenRatio) {

    drawWidth = width;
    drawHeight = width / imgRatio;

  } else {

    drawHeight = height;
    drawWidth = height * imgRatio;
  }

  // =====================
  // 元画像
  // =====================
  image(
    img,
    width / 2,
    height / 2,
    drawWidth,
    drawHeight
  );

  // =====================
  // セピア画像重ね
  // =====================
  tint(255, 255 * fadeSmooth);

  image(
    sepiaImg,
    width / 2,
    height / 2,
    drawWidth,
    drawHeight
  );

  noTint();
}


// =================================
// 回復処理
// =================================
function restoreFade(distanceAmount) {

  if (distanceAmount > 2) {

    fadeAmount -= distanceAmount * 0.001;

    fadeAmount = constrain(fadeAmount, 0, 1);
  }
}


// =================================
// iPad / iPhone
// touches[] を使用
// =================================
function touchMoved() {

  if (touches.length > 0) {

    let currentX = touches[0].x;
    let currentY = touches[0].y;

    if (prevTouchX !== null && prevTouchY !== null) {

      let d = dist(
        currentX,
        currentY,
        prevTouchX,
        prevTouchY
      );

      restoreFade(d);
    }

    prevTouchX = currentX;
    prevTouchY = currentY;
  }

  return false;
}


// タッチ終了時リセット
function touchEnded() {

  prevTouchX = null;
  prevTouchY = null;
}


// =================================
// PC用
// =================================
function mouseDragged() {

  let d = dist(mouseX, mouseY, pmouseX, pmouseY);

  restoreFade(d);

  return false;
}


// =================================
// リサイズ対応
// =================================
function windowResized() {

  resizeCanvas(windowWidth, windowHeight);
}