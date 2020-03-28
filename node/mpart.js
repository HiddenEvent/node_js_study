var M = {
  v: 'v',
  f:function() {
    console.log(this.v);
  }
}

// M의 객체를 외부에서 사용가능하게 만드는 명령어
module.exports = M;
