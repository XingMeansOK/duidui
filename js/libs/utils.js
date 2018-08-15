// 将hex表示方式转换为rgb表示方式(这里返回rgb数组模式)
function hex2Rgb (sColor) {
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  var sColor = sColor.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      var sColorNew = "#";
      for (var i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    var sColorChange = [];
    for (var i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
    }
    return sColorChange;
  } else {
    return sColor;
  }
} 

function hex2Object(sColor) {
  let rgb = hex2Rgb(sColor)
  //rgb用0-1表示
  let r = rgb[0] / 255
  let g = rgb[1] / 255
  let b = rgb[2] / 255
  return {r,g,b}
}

function gradientColor(startColor, endColor, step) {
  startRGB = hex2Rgb(startColor);//转换为rgb数组模式
  startR = startRGB[0];
  startG = startRGB[1];
  startB = startRGB[2];

  endRGB = this.colorRgb(endColor);
  endR = endRGB[0];
  endG = endRGB[1];
  endB = endRGB[2];

  sR = (endR - startR) / step;//总差值
  sG = (endG - startG) / step;
  sB = (endB - startB) / step;

  var colorArr = [];
  for (var i = 0; i < step; i++) {
    //rgb用0-1表示
    let r = parseInt((sR * i + startR)) / 255
    let g = parseInt((sG * i + startG)) / 255
    let b = parseInt((sB * i + startB)) / 255

    colorArr.push({r,g,b});
  }
  return colorArr;
}

export {
  gradientColor,
  hex2Object
}

