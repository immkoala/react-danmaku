var React = require('react')

var styles = {
    canvas: {
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1024
    }
}

var Danmaku = React.createClass({

    statics: {
        getDefaultData: function () {
            return [
                '感觉自己萌萌哒',
                '真的感觉自己萌萌哒',
                '真的真的真的感觉自己棒棒哒！',
                '真的真的真的感觉自己萌萌哒',
                '真的真的真的感觉自己萌萌哒',
                '真的感觉自己萌萌哒',
                '感觉自己萌萌哒',
                '真的感觉自己萌萌哒',
                '真的真的真的感觉自己棒棒哒！',
                '真的感觉自己萌萌哒',
                '感觉自己萌萌哒',
                '真的感觉自己萌萌哒',
                '真的真的真的感觉自己棒棒哒！',
                '真的感觉自己萌萌哒',
                '感觉自己萌萌哒',
                '真的感觉自己萌萌哒',
                '真的真的真的感觉自己棒棒哒！',
                '真的感觉自己萌萌哒',
                '感觉自己萌萌哒',
                '真的感觉自己萌萌哒',
                '真的真的真的感觉自己棒棒哒！',
                '真的感觉自己萌萌哒',
                '感觉自己萌萌哒',
                '真的感觉自己萌萌哒',
                '真的真的真的感觉自己棒棒哒！',
                '真的感觉自己萌萌哒',
                '感觉自己萌萌哒',
                '真的感觉自己萌萌哒',
                '真的真的真的感觉自己棒棒哒！',
                '真的感觉自己萌萌哒',
                '真的真的真的感觉自己棒棒哒！',
                '真的感觉自己萌萌哒',
                '感觉自己萌萌哒',
                '真的感觉自己萌萌哒',
                '真的真的真的感觉自己棒棒哒！',
                '真的感觉自己萌萌哒',
                '感觉自己萌萌哒',
                '真的感觉自己萌萌哒',
                '真的真的真的感觉自己棒棒哒！'
            ]
        }
    },

    danmakuInstance: null,

    render: function () {

        return (
            <canvas ref='canvas' style={styles.canvas}></canvas>
        )
    },

    componentDidMount: function () {

        //兼容低版本浏览器
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (function () {
                return window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (callback) {
                        return setTimeout(callback, 1000 / 60)
                    };
            })();

            window.cancelAnimationFrame = (function () {
                return window.webkitCancelRequestAnimationFrame ||
                    window.mozCancelRequestAnimationFrame ||
                    window.oCancelRequestAnimationFrame ||
                    window.msCancelRequestAnimationFrame ||
                    function (callback) {
                        return clearTimeout(callback)
                    }
            })();
        }

        var canvasNode = React.findDOMNode(this.refs.canvas)
        var canvasParentNode = canvasNode.parentNode

        canvasNode.width = canvasParentNode.ownerDocument.documentElement.clientWidth
        canvasNode.height = canvasParentNode.ownerDocument.documentElement.clientHeight

        var danmaku = function (config, canvas, currentComponent) {

            this.width = config.width
            this.height = config.height
            this.color = config.color //颜色
            this.fontSize = parseInt(config.fontSize) || 12 // 字体大小
            this.speed = config.speed || 10 //移动速度
            this.area = config.area || 'top' //弹幕出现的在屏幕上的区域，默认是全屏 //TODO:待完成
            this.alpha = config.alpha || 1 //透明度
            this.lineSpacing = config.lineSpacing || 5 //行高
            this.playFlag = false
            this.children = []
            this.canvas = canvas
            this.context = this.canvas.getContext('2d')
            this.tempCanvas = null //临时的canvas元素，用来创建img缓存

            this.renderMatrix = [] //使用一个二维数组矩阵来分别储存每一行将要渲染的弹幕
            this.renderChildren = [] //确认要被渲染的数组

            this.myReq = null

            this.currentComponent = currentComponent //当前ReactComponent的引用

            //进行一些初始化设置
            this.init()
        }

        danmaku.prototype = {

            constructor: danmaku,

            init: function () {

                this.tempCanvas = document.createElement('canvas')
                this.tempContext = this.tempCanvas.getContext('2d')

                this.resetMatrix()

                this.adaptDevicePixelRatio(this.canvas, this.context)
            },

            //如果是视网膜屏幕，进行相应的操作
            adaptDevicePixelRatio: function (canvas, context) {

                if (window.devicePixelRatio && window.devicePixelRatio > 1) {
                    var canvasWidth = canvas.width
                    var canvasHeight = canvas.height

                    canvas.width = canvasWidth * window.devicePixelRatio;
                    canvas.height = canvasHeight * window.devicePixelRatio;
                    canvas.style.width = canvasWidth + 'px'
                    canvas.style.height = canvasHeight + 'px'

                    context.scale(window.devicePixelRatio, window.devicePixelRatio)
                }
            },

            addChild: function (item) {
                this.children.push(item)
            },

            resetMatrix: function () {
                for (var i = 0; i < Math.floor(this.height / (this.fontSize + this.lineSpacing)); i++) {
                    this.renderMatrix[i] = []
                }
            },

            getRenderLineNumber: function () {

                var lineNumber = Math.ceil(this.children.length / 4) //将要渲染的行数

                if (lineNumber > this.renderMatrix.length) {
                    lineNumber = this.renderMatrix.length
                    lineNumber = lineNumber -
                        Math.floor((this.height / this.renderMatrix.length) / (lineNumber * (this.lineSpacing + this.fontSize)))
                }

                return lineNumber

            },

            //为整个Matrix分配将要渲染的弹幕
            allocationDataForMatrix: function () {

                //获取需要被渲染的行数
                var RenderLineNumber = this.getRenderLineNumber()

                this.renderMatrix.forEach(function (rowData, index) {

                    //根据RenderLineNumber把每一行放入renderMatrix里面
                    if (index < RenderLineNumber) {

                        if (!rowData.length) {

                            this.allocationDataForSingleLine(rowData, index)

                        } else {

                            var lastItem = rowData[rowData.length - 1]

                            if (this.width - lastItem.x > (lastItem.text.length * this.fontSize)) {
                                this.allocationDataForSingleLine(rowData, index)
                            }
                        }
                    } else {
                        return false
                    }
                }.bind(this))

                //把二维数组Matrix里面的内容放到二维数组renderChildren里面，
                //用来进行真正的渲染
                this.renderMatrix.forEach(function (rowData) {
                    rowData.forEach(function (columnData) {
                        if (!columnData['isRender']) {
                            this.renderChildren.push(columnData)
                            columnData['isRender'] = true
                        }
                    }.bind(this))
                }.bind(this))

                //删除被标记为isDelete的弹幕
                this.renderChildren.forEach(function (item, index) {
                    if (item.isDelete) {
                        this.renderChildren.splice(index, 1)
                    }
                }.bind(this))

                clearTimeout(this.allocationDataTimer)
                this.allocationDataTimer = setTimeout(function () {
                    this.allocationDataForMatrix()
                }.bind(this), 1000)
            },

            //为每一行分配将要渲染的弹幕
            allocationDataForSingleLine: function (rowData, lineN) {

                if (!this.children.length) {
                    return
                }

                var item = this.children.splice(0, 1)[0]

                item.x = this.width + Math.floor(Math.random() * 300 + 100) // 初始X轴位置

                item.y = lineN * this.fontSize + (lineN * this.lineSpacing)// 行数

                item.speed = (Math.random() + this.speed) / 9 //速度

                this.tempContext.clearRect(0, 0, this.width, this.height)

                this.tempCanvas.height = this.fontSize * 2
                this.tempCanvas.width = item.text.length * this.fontSize

                this.adaptDevicePixelRatio(this.tempCanvas, this.tempContext)

                this.tempContext.globalAlpha = this.alpha //设置透明度

                this.tempContext.beginPath()
                this.tempContext.font = this.fontSize + "px 黑体"
                this.tempContext.fillStyle = this.color
                this.tempContext.fillText(item.text, 0, this.fontSize)
                this.tempContext.closePath()

                var img = new Image()
                img.src = this.tempCanvas.toDataURL()

                item.img = img

                rowData.push(item)
            },

            render: function () {

                //画每一帧之前首先清除画布上面的所有内容
                this.context.clearRect(0, 0, this.width, this.height)

                this.renderChildren.forEach(function (item) {

                    item.x = item.x - item.speed
                    this.draw(item.img, item.x, item.y)

                    if (item.x < -(item.text.length * this.fontSize)) {
                        item['isDelete'] = true
                    }

                }.bind(this))

                if (!this.renderChildren.length) {
                    this.stop()
                    this.currentComponent.props.onEnd && this.currentComponent.props.onEnd()
                }

                if (this.playFlag) {
                    this.myReq = requestAnimationFrame((function (thisReplace) {
                        return function () {
                            thisReplace.render()
                        };
                    })(this))
                }
            },

            draw: function (img, x, y) {
                this.context.drawImage(img, x, y, img.width / window.devicePixelRatio, img.height / window.devicePixelRatio)
            },

            play: function () {
                if (!this.playFlag) {
                    this.playFlag = true;
                    this.allocationDataForMatrix() //渲染之前分配弹幕到将要输出的矩阵
                    this.render()
                }
            },

            stop: function () {
                if (this.playFlag) {
                    this.playFlag = false
                    clearTimeout(this.allocationDataTimer)
                    cancelAnimationFrame(this.myReq)
                }
            },

            clear: function () { //清空所有数据
                this.children = []
                this.renderChildren = []
                this.resetMatrix()
                this.stop()
            }
        }

        this.danmakuInstance = new danmaku({
            width: canvasNode.width,
            height: canvasNode.height,
            color: '#000',
            fontSize: '20px',
            speed: 10,
            alpha: 0.8,
            lineSpacing: 5
        }, canvasNode, this)

        //赋值
        this._assignmentData()

    },

    _assignmentData: function () {

        var data = this.props.data || Danmaku.getDefaultData()

        //如果存在data,通过data初始化数据
        data.forEach(function (text) {
            this.danmakuInstance.addChild({
                text: text
            })
        }.bind(this))

        this.danmakuInstance.play() //开始滚动弹幕
    },

    componentDidUpdate: function () { // 更新data时重新进行初始化数据
        this.danmakuInstance.clear()
        this._assignmentData()
    }
})

module.exports = Danmaku