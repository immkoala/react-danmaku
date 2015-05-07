# react－danmaku
==================

react danmaku component

## Install
`npm install react-danmaku`

## Usage

```javascript
var React = require('react')
var Danmaku = require('react-danmaku')

var data = [
    '感觉自己萌萌哒~',
    '感觉自己萌萌哒~',
    '感觉自己萌萌哒~',
    '感觉自己萌萌哒~',
    '感觉自己萌萌哒~',
    '感觉自己萌萌哒~',
    '感觉自己萌萌哒~',
    '感觉自己萌萌哒~'
]

var config = {
    color: '#340BC8',
    fontSize: '30px',
    speed: 10,
    alpha: 0.9,
    lineSpacing: 5
}

function handleEnd() {
    console.log('弹幕全部执行完毕！')
}

document.addEventListener('DOMContentLoaded', function () {
    React.render(<Danmaku data={data} config={config} onEnd={handleEnd}/>, document.body);
})
```