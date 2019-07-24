/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-console */
// VOID
// Author: 熊猫小A
// Link: https://blog.imalan.cn/archives/247/

console.log(' %c Theme VOID %c https://blog.imalan.cn/archives/247/ ', 'color: #fadfa3; background: #23b7e5; padding:5px;', 'background: #1c2b36; padding:5px;');

var VOID_Content = {
    countWords: function () {
        if ($('#totalWordCount').length) {
            var total = 0;
            $.each($('a.archive-title'), function (i, item) {
                total += parseInt($(item).attr('data-words'));
            });
            $('#totalWordCount').html(total);
        }
    },

    // 解析文章目录
    parseTOC: function () {
        if ($('.TOC').length > 0) {
            var toc_option = {
                // Where to render the table of contents.
                tocSelector: '.TOC',
                // Where to grab the headings to build the table of contents.
                contentSelector: 'div[itemprop=articleBody]',
                // Which headings to grab inside of the contentSelector element.
                headingSelector: 'h2, h3, h4, h5',
                // 收缩深度
                collapseDepth: 6
            };
            tocbot.init(toc_option);
            $.each($('.toc-link'), function(i, item){
                $(item).click(function(){
                    var target = $(document.getElementById($(this).attr('href').replace('#', '')));
                    var posi = target.offset().top - 60;
                    $.scrollTo(posi, 300);
                    if(window.innerWidth < 1200) {
                        TOC.close();
                    }
                    return false;
                });
            });
            // 检查目录
            if(window.innerWidth >= 1200) {
                TOC.open();
            } 
        }
    },

    // 解析照片集
    parsePhotos: function () {
        var base = 50;
        $.each($('.photos'), function (i, photoSet) {
            $.each($(photoSet).children(), function (j, item) {
                var img = new Image();
                img.src = $(item).find('img').attr('data-src');
                img.onload = function () {
                    var w = parseFloat(img.width);
                    var h = parseFloat(img.height);
                    $(item).css('width', w * base / h + 'px');
                    $(item).css('flex-grow', w * base / h);
                    $(item).find('a').css('padding-top', h / w * 100 + '%');
                };
            });
        });
    },

    // 解析URL
    parseUrl: function () {
        var domain = document.domain;
        $('a:not(a[href^="#"]):not(".post-like")').each(function (i, item) {
            if ((!$(item).attr('target') || (!$(item).attr('target') == '' && !$(item).attr('target') == '_self'))) {
                if (item.host != domain) {
                    $(item).attr('target', '_blank');
                }
            }
        });

        if (VOIDConfig.PJAX) {
            $.each($('a:not(a[target="_blank"], a[no-pjax])'), function (i, item) {
                if (item.host == domain) {
                    $(item).addClass('pjax');
                }
            });
            $(document).pjax('a.pjax', {
                container: '#pjax-container',
                fragment: '#pjax-container',
                timeout: 8000
            });
        }
    },

    highlight: function () {
        $.each($('pre code'), function(i, item){
            var lang = '';
            if ($(item).attr('class') != undefined && $(item).attr('class') !== '') {
                lang = $(item).attr('class').toLowerCase().replace('lang-', '').replace('language-', '');
            }
            $(item).parent().attr('data-lang', lang);
            hljs.highlightBlock(item);
            if (VOIDConfig.lineNumbers) {
                hljs.lineNumbersBlock(item, {
                    singleLine: true
                });   
            }
        });
    },

    bigfoot: function () {
        // 初始化注脚
        $.bigfoot({ actionOriginalFN: 'ignore' });
    },

    pangu: function () {
        pangu.spacingElementByTagName('p');
    },

    math: function () {
        if (VOIDConfig.enableMath && typeof MathJax !== 'undefined') {
            MathJax.Hub.Config({
                tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
            });
            MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
        }
    },

    hyphenate: function() {
        $('div[itemprop=articleBody] p, div[itemprop=articleBody] blockquote').hyphenate('en-us');
    }
};

var VOID = {
    // 初始化单页应用
    init: function () {
        /* 初始化 UI */
        VOID_Ui.checkHeader();
        VOID_Ui.MasonryCtrler.init();
        VOID_Ui.DarkModeSwitcher.checkColorScheme();
        VOID_Ui.checkScrollTop(false);
        VOID_Ui.lazyload();
        VOID_Ui.headroom();

        VOID_Content.countWords();
        VOID_Content.parseTOC();
        VOID_Content.parsePhotos();
        VOID_Content.parseUrl();
        VOID_Content.pangu();
        VOID_Content.highlight();
        VOID_Content.bigfoot();
        VOID_Content.math();
        VOID_Content.hyphenate();
        
        VOID.handleLike();
        AjaxComment.init();

        $('body').on('click', function (e) {
            if (!VOID_Util.clickIn(e, '.mobile-search-form') && !VOID_Util.clickIn(e, '#toggle-mobile-search')) {
                if ($('.mobile-search-form').hasClass('opened')) {
                    $('.mobile-search-form').removeClass('opened');
                    return false;
                }
            }
            if (!VOID_Util.clickIn(e, '#toggle-setting-pc') && !VOID_Util.clickIn(e, '#toggle-setting')) {
                if ($('body').hasClass('setting-panel-show') && !VOID_Util.clickIn(e, '#setting-panel')) {
                    $('body').removeClass('setting-panel-show');
                    setTimeout(function () {
                        $('#setting-panel').hide();
                    }, 300);
                    return false;
                }
            }
        });
    },

    // PJAX 开始前
    beforePjax: function () {
        NProgress.start();
        VOID_Ui.reset();
    },

    // PJAX 结束后
    afterPjax: function () {
        NProgress.done();
        
        if ($('#loggin-form').length) {
            $('#loggin-form').addClass('need-refresh');
        }

        VOID_Ui.MasonryCtrler.init();
        VOID_Ui.checkScrollTop(false);

        VOID_Content.countWords();
        VOID_Content.parseTOC();
        VOID_Content.parsePhotos();
        VOID_Content.parseUrl();
        VOID_Content.highlight();        
        VOID_Content.math();
        VOID_Content.hyphenate();
        VOID_Content.pangu();
        VOID_Content.bigfoot();

        VOID.handleLike();

        // 重载表情
        if ($('.OwO').length > 0) {
            new OwO({
                logo: 'OωO',
                container: document.getElementsByClassName('OwO')[0],
                target: document.getElementsByClassName('input-area')[0],
                api: '/usr/themes/VOID/assets/libs/owo/OwO_01.json',
                position: 'down',
                width: '400px',
                maxHeight: '250px'
            });
        }
        
        AjaxComment.init();
    },

    endPjax: function () {
        if ($('.TOC').length < 1) {	
            TOC.close();
        }
    },

    alert: function (content, time) {
        var errTemplate = '<div class="msg" id="msg{id}">{Text}</div>';
        var id = new Date().getTime();
        $('body').prepend(errTemplate.replace('{Text}', content).replace('{id}', id));
        $.each($('.msg'), function (i, item) {
            if ($(item).attr('id') != 'msg' + id) {
                $(item).css('top', $(item).offset().top - $(document).scrollTop() + $('.msg#msg' + id).outerHeight() + 20 + 'px');
            }
        });
        $('.msg#msg' + id).addClass('show');
        var t = time;
        if (typeof (t) != 'number') {
            t = 2500;
        }
        setTimeout(function () {
            $('.msg#msg' + id).addClass('hide');
            setTimeout(function () {
                $('.msg#msg' + id).remove();
            }, 1000);
        }, t);
    },

    // 点赞事件处理
    handleLike: function () {
        var liked = VOID_Util.getCookie('void_likes');
        if (liked == null) return;
        // 已点赞高亮
        $.each($('.post-like'), function (i, item) {
            var cid = String($(item).attr('data-cid'));
            if (liked.indexOf(',' + String(cid) + ',') != -1) {
                $(item).addClass('done');
            }
        });
    },

    like: function (sel) {
        var cid = parseInt($(sel).attr('data-cid'));

        // 首先检查该 cid 是否已经点过赞了
        var liked = VOID_Util.getCookie('void_likes');
        if (liked == null) liked = ',';

        if (liked.indexOf(',' + String(cid) + ',') != -1) {
            VOID.alert('您已经点过赞了~');
        } else {
            $.post(VOIDConfig.likePath, {
                cid: cid
            }, function (data) {
                $(sel).addClass('done');
                var num = $(sel).find('.like-num').text();
                $(sel).find('.like-num').text(parseInt(num) + 1);
                // 设置 cookie，一周有效
                liked = liked + String(cid) + ',';
                VOID_Util.setCookie('void_likes', liked, 3600 * 24 * 7);
            }, 'json');
        }
    },

    manageComment: function(item) {
        if (window.confirm($(item).attr('data-lang'))) {
            VOID_Ui.rememberPos();
            window.location.href = $(item).attr('data-action');
        }
    },

    startSearch: function (item) {
        var c = $(item).val();
        $(item).val('');
        $(item).blur();
        if (!c || c == '') {
            $(item).attr('placeholder', '你还没有输入任何信息');
            return;
        }
        var t = VOIDConfig.searchBase + c;
        if (VOIDConfig.PJAX) {
            $.pjax({
                url: t,
                container: '#pjax-container',
                fragment: '#pjax-container',
                timeout: 8000,
            });
        } else {
            window.open(t, '_self');
        }
    },
    
    enterSearch: function (item) {
        var event = window.event || arguments.callee.caller.arguments[0];
        if (event.keyCode == 13) {
            VOID.startSearch(item);
        }
    }
};

var Share = {
    parseItem: function (item) {
        item = $(item).parent();
        return {
            url: $(item).attr('data-url'),
            title: $(item).attr('data-title'),
            excerpt: $(item).attr('data-excerpt'),
            img: $(item).attr('data-img'),
            twitter: $(item).attr('data-twitter'),
            weibo: $(item).attr('data-weibo'),
        };
    },

    toWeibo: function (item) {
        var content = Share.parseItem(item);
        var url = 'http://service.weibo.com/share/share.php?appkey=&title=分享《'+ content.title + '》 @' + content.weibo + '%0a%0a' + content.excerpt
            +'&url='+content.url
            +'&pic='+content.img+'&searchPic=false&style=simple';
        window.open(url);
    },

    toTwitter: function (item) {
        var content = Share.parseItem(item);
        var url = 'https://twitter.com/intent/tweet?text=分享《'+ content.title + '》 @' + content.twitter + '%0a%0a' + content.excerpt
            + '%20' + content.url;
        window.open(url);
    }
};

var AjaxComment = {
    noName: '必须填写用户名',
    noMail: '必须填写电子邮箱地址',
    noContent: '必须填写评论内容',
    invalidMail: '邮箱地址不合法',
    commentsOrder: 'DESC',
    commentList: '.comment-list',
    comments: '#comments .comments-title',
    commentReply: '.comment-reply',
    commentForm: '#comment-form',
    respond: '.respond',
    textarea: '#textarea',
    submitBtn: '#comment-submit-button',
    newID: '',
    parentID: '',

    bindClick: function () {
        $(AjaxComment.commentReply + ' a, #cancel-comment-reply-link').unbind('click');
        $(AjaxComment.commentReply + ' a').click(function () { // 回复
            AjaxComment.parentID = $(this).parent().parent().parent().attr('id');
            $(AjaxComment.textarea).focus();
        });
        $('#cancel-comment-reply-link').click(function () { // 取消
            AjaxComment.parentID = '';
        });
    },

    err: function () {
        $(AjaxComment.submitBtn).attr('disabled', false);
        AjaxComment.newID = '';
    },

    finish: function () {
        TypechoComment.cancelReply();
        $(AjaxComment.submitBtn).html('提交评论');
        $(AjaxComment.textarea).val('');
        $(AjaxComment.submitBtn).attr('disabled', false);
        if ($('#comment-' + AjaxComment.newID).length > 0) {
            $.scrollTo($('#comment-' + AjaxComment.newID).offset().top - 50, 500);
            $('#comment-' + AjaxComment.newID).fadeTo(500, 1);
        }
        $('.comment-num .num').html(parseInt($('.comment-num .num').html()) + 1);
        AjaxComment.bindClick();
        VOID_Content.highlight();
    },

    init: function () {
        AjaxComment.bindClick();
        $(AjaxComment.commentForm).submit(function () { // 提交事件
            $(AjaxComment.submitBtn).attr('disabled', true);

            /* 检查 */
            if ($(AjaxComment.commentForm).find('#author')[0]) {
                if ($(AjaxComment.commentForm).find('#author').val() == '') {
                    VOID.alert(AjaxComment.noName);
                    AjaxComment.err();
                    return false;
                }

                if ($(AjaxComment.commentForm).find('#mail').val() == '') {
                    VOID.alert(AjaxComment.noMail);
                    AjaxComment.err();
                    return false;
                }

                var filter = /^[^@\s<&>]+@([a-z0-9]+\.)+[a-z]{2,4}$/i;
                if (!filter.test($(AjaxComment.commentForm).find('#mail').val())) {
                    VOID.alert(AjaxComment.invalidMail);
                    AjaxComment.err();
                    return false;
                }
            }

            var textValue = $(AjaxComment.commentForm).find(AjaxComment.textarea).val().replace(/(^\s*)|(\s*$)/g, '');//检查空格信息
            if (textValue == null || textValue == '') {
                VOID.alert(AjaxComment.noContent);
                AjaxComment.err();
                return false;
            }
            $(AjaxComment.submitBtn).html('提交中');
            $.ajax({
                url: $(AjaxComment.commentForm).attr('action'),
                type: $(AjaxComment.commentForm).attr('method'),
                data: $(AjaxComment.commentForm).serializeArray(),
                error: function () {
                    VOID.alert('提交失败！请重试。');
                    $(AjaxComment.submitBtn).html('提交评论');
                    AjaxComment.err();
                    return false;
                },
                success: function (data) { //成功取到数据
                    try {
                        if (!$(AjaxComment.commentList, data).length) {
                            var msg = '提交失败！请重试。' + $($(data)[7]).text();
                            VOID.alert(msg);
                            $(AjaxComment.submitBtn).html('提交评论');
                            AjaxComment.err();
                            return false;
                        } else {
                            AjaxComment.newID = $(AjaxComment.commentList, data).html().match(/id="?comment-\d+/g).join().match(/\d+/g).sort(function (a, b) {
                                return a - b;
                            }).pop();

                            if ($('.pager .prev').length && AjaxComment.parentID == '') {
                                // 在分页对文章发表评论，无法取得最新评论内容
                                VOID.alert('评论成功！请回到评论第一页查看。');
                                AjaxComment.newID = '';
                                AjaxComment.parentID = '';
                                AjaxComment.finish();
                                return false;
                            }

                            var newCommentType = AjaxComment.parentID == '' ? 'comment-parent' : 'comment-child';
                            var newCommentData = '<div itemscope itemtype="http://schema.org/UserComments" id="comment-' + AjaxComment.newID + '" style="opacity:0" class="comment-body ' + newCommentType + '">' + $(data).find('#comment-' + AjaxComment.newID).html() + '</div>';

                            // 当页面无评论，先添加一个评论容器
                            if ($(AjaxComment.commentList).length <= 0) {
                                $('#comments').append('<h3 class="comment-separator"><div class="comment-tab-current"><span class="comment-num">已有 <span class="num">0</span> 条评论</span></div></h3>')
                                    .append('<div class="comment-list"></div>');
                            }

                            if (AjaxComment.parentID == '') {
                                // 无父 id，直接对文章评论，插入到第一个 comment-list 头部
                                $('#comments>.comment-list').prepend(newCommentData);
                                VOID.alert('评论成功！');
                                AjaxComment.finish();
                                AjaxComment.newID = '';
                                return false;
                            } else {
                                if ($('#' + AjaxComment.parentID).hasClass('comment-parent')) {
                                    // 父评论是母评论
                                    if ($('#' + AjaxComment.parentID + ' > .comment-children').length > 0) {
                                        // 父评论已有子评论，插入到子评论列表头部
                                        $('#' + AjaxComment.parentID + ' > .comment-children > .comment-list').prepend(newCommentData);
                                    }
                                    else {
                                        // 父评论没有子评论，新建一层包裹
                                        newCommentData = '<div class="comment-children"><div class="comment-list">' + newCommentData + '</div></div>';
                                        $('#' + AjaxComment.parentID).append(newCommentData);
                                    }
                                } else {
                                    // 父评论是子评论，与父评论平级，并放在后面
                                    $('#' + AjaxComment.parentID).after(newCommentData);
                                }
                                VOID.alert('评论成功！');
                                AjaxComment.finish();
                                AjaxComment.parentID = '';
                                AjaxComment.newID = '';
                                return false;
                            }
                        }
                    } catch (e) {
                        window.location.reload();
                    }
                } // end success()
            }); // end ajax()
            return false;
        }); // end submit()
    }
};

(function () {
    $(document).ready(function () {
        VOID.init();
        if (VOIDConfig.PJAX) {
            $(document).on('pjax:send', function () {
                VOID.beforePjax();
            });
    
            $(document).on('pjax:complete', function () {
                VOID.afterPjax();
            });
    
            $(document).on('pjax:end', function () {	
                VOID.endPjax();
            });
        }
    });

    VOID_Ui.tuneBg();
    $(window).resize(function () {
        VOID_Ui.tuneBg();
    });

    window.setInterval(function () {
        var times = new Date().getTime() - Date.parse(VOIDConfig.buildTime);
        times = Math.floor(times / 1000); // convert total milliseconds into total seconds
        var days = Math.floor(times / (60 * 60 * 24)); //separate days
        times %= 60 * 60 * 24; //subtract entire days
        var hours = Math.floor(times / (60 * 60)); //separate hours
        times %= 60 * 60; //subtract entire hours
        var minutes = Math.floor(times / 60); //separate minutes
        times %= 60; //subtract entire minutes
        var seconds = Math.floor(times / 1); // remainder is seconds
        $('#uptime').html(days + ' 天 ' + hours + ' 小时 ' + minutes + ' 分 ' + seconds + ' 秒 ');
    }, 1000);
})();