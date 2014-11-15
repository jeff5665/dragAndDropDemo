

var DragAndDropExample = function () {
    var extend = function (target, source, isOverwrite) {//扩展target,将source中的key不在target中的拷贝到target中
        if (isOverwrite == undefined) isOverwrite = true;
        for (var key in source) {
            if (!(key in target) || isOverwrite) {
                target[key] = source[key];
            }
        }
        return target;
    };
    var $ = function (id) {
        return document.getElementById(id) || id;
    };
    var $$ = function (tag, p) {
        return p.getElementsByTagName(tag);
    };
    var addEvent = function (o, e, f) {//兼容的添加事件
        o.addEventListener ? o.addEventListener(e, f, false) : o.attachEvent('on' + e, function () {
            f.call(o)
        });
    };
    window.requesetAnimFrame = function () {//每秒60帧
        return window.requesetAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (fn) {
                window.setTimeout(fn, 1000 / 60);
            };
    }();





    var init = function (opt) {//初始化
        this.opt = {//默认opt.canvasId=null
            canvasId: null
        }
        this.place = 0;

        extend(this.opt, opt);//扩展opt

        this.initialize();
    };

    init.prototype = {
        initialize: function () {//初始化
            if (this.opt.canvasId == null) {
                this.genCanvas();
            } else {
                this.canvas = $(this.opt.canvasId);
            }


            this.renderList = [];//保存渲染对象的数组
            this.currentDragShape=false;//当前拖动的对象
            this.ctx = this.canvas.getContext('2d');
            this.setCvsStyle();//设置CANVAS尺寸
            this.bindEvent();//绑事件
            this.loop();
        },
        bindEvent: function () {
            var _this = this;
            addEvent($('userInput'), 'dragstart', function (e) {
                e.myData="222";
                e.dataTransfer.effectAllowed = 'copy'; // only dropEffect='copy' will be dropable
                e.dataTransfer.setData('Text', this.id);
            });

            //addEvent(this.canvas,'drop',onDrop);
            addEvent(this.canvas, 'dragover', function (e) {
                if (e.preventDefault) e.preventDefault(); // allows us to drop
                e.dataTransfer.dropEffect = 'copy';

                return false;
            });
            addEvent(this.canvas, 'dragleave', function (e) {
                console.log('dragleave', e);
                return false;
            });


            addEvent(this.canvas, 'drop', function (e) {
                console.log('drop', e, e.myData);
                if (e.stopPropagation) e.stopPropagation();
                console.log(e.offsetX, e.y);
                _this.renderList.push(new Rect(e.offsetX, e.offsetY, 20, 20, _this.canvas));
                return false;
            });


            addEvent(this.canvas, 'mousedown', function (e) {
                _this.renderList.every(function (renderObj, index) {
                    if (_this.hitTest(renderObj, e.offsetX, e.offsetY)) {
                        _this.currentDragShape=renderObj;
                        return false;
                    }else{
                        return true;
                    }
                })

            }, false);
            addEvent(this.canvas, 'mousemove', function(e){
                if(_this.currentDragShape!==false){
                    _this.currentDragShape.x= e.offsetX;
                    _this.currentDragShape.y= e.offsetY;
                }
            });
            addEvent(this.canvas, 'mouseup', function(){
                _this.currentDragShape=false;
            });
            /*addEvent(window, 'resize', function (e) {
             _this.setCvsStyle();
             });*/
        },
        loop: function () {
            var _this = this;
            requesetAnimFrame(function () {
                _this.loop()
            });//类似onEnterFrame
            this.render();
        },

        /**
         * //todo 增加dirty check 只渲染部分对象 需要考虑清空部分内容
         * 清空需要一个策略，何时采取局部清空，何时索性完全清空 或者单纯考虑 重绘对象区域的重绘
         * //
         */
        render: function () {//onEnterFrame实际执行的函数
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);//清空canvas
            this.renderList.forEach(function (renderObj, index) {
                renderObj.update();
            })
        },
        setCvsStyle: function () {
            this.canvas.width = 602;
            this.canvas.height = 602;
        },
        genCanvas: function () {
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            this.canvas = canvas;
            return canvas;
        },

        /**
         * 基于圆心的碰撞检测
         * @param shape 检测的图形
         * @param mx 坐标x
         * @param my 坐标y
         * @returns {boolean}
         */
        hitTest: function(shape, mx, my) {
            var dx;
            var dy;
            dx = mx - shape.x;
            dy = my - shape.y;
            //a "hit" will be registered if the distance away from the center is less than the radiu
            return (dx * dx + dy * dy < shape.w * shape.h);
        }
    };


    /**
     * 矩形
     * @param x
     * @param y
     * @param w
     * @param h
     * @param canvas
     * @param fillStyle
     * @constructor
     */
    var Rect = function (x, y, w, h, canvas, fillStyle) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.canvas = canvas;
        this.fillStyle = fillStyle || '#111';
        this.ctx = this.canvas.getContext('2d');
    };

    Rect.prototype = {
        /**
         * 渲染矩形
         */
        render: function () {
            this.ctx.fillStyle = this.fillStyle;
            this.ctx.fillRect(this.x, this.y, this.w, this.h);
        },

        /**
         * 更新矩形
         */
        update: function () {
            this.render();
        }
    };

    return init;
}();

onload = function () {
    new DragAndDropExample({canvasId: 'stage'});
}