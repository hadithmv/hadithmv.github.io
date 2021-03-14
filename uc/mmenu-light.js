!(function (t) {
  const e = {}
  function n (i) {
    if (e[i]) return e[i].exports
    let o = (e[i] = { i: i, l: !1, exports: {} })
    return t[i].call(o.exports, o, o.exports, n), (o.l = !0), o.exports
  }
  (n.m = t),
  (n.c = e),
  (n.d = function (t, e, i) {
    n.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: i })
  }),
  (n.r = function (t) {
    typeof Symbol !== 'undefined' &&
        Symbol.toStringTag &&
        Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
    Object.defineProperty(t, '__esModule', { value: !0 })
  }),
  (n.t = function (t, e) {
    if ((1 & e && (t = n(t)), 8 & e)) return t
    if (4 & e && typeof t === 'object' && t && t.__esModule) return t
    let i = Object.create(null)
    if (
      (n.r(i),
      Object.defineProperty(i, 'default', { enumerable: !0, value: t }),
      2 & e && typeof t !== 'string')
    )
    { 
for (let o in t)
      {n.d(
            i,
            o,
            function (e) {
              return t[e];
            }.bind(null, o)
          );} 
}
    return i
  }),
  (n.n = function (t) {
    const e =
        t && t.__esModule
          ? function () {
              return t.default
            }
          : function () {
            return t
          }
    return n.d(e, 'a', e), e
  }),
  (n.o = function (t, e) {
    return Object.prototype.hasOwnProperty.call(t, e)
  }),
  (n.p = ''),
  n((n.s = 0))
})([
  function (t, e, n) {
    'use strict'
    n.r(e)
    let i = (function () {
      function t (t) {
        const e = this;
        (this.listener = function (t) {
          (t.matches ? e.matchFns : e.unmatchFns).forEach(function (t) {
            t()
          })
        }),
        (this.toggler = window.matchMedia(t)),
        this.toggler.addListener(this.listener),
        (this.matchFns = []),
        (this.unmatchFns = [])
      }
      return (
        (t.prototype.add = function (t, e) {
          this.matchFns.push(t),
          this.unmatchFns.push(e),
          (this.toggler.matches ? t : e)()
        }),
        t
      )
    })()
      var o = function (t) {
      return Array.prototype.slice.call(t)
      };
    let s = function (t, e) {
      return o((e || document).querySelectorAll(t))
      };
    let r =
        ('ontouchstart' in window || navigator.msMaxTouchPoints,
        navigator.userAgent.indexOf('MSIE') > -1 ||
          navigator.appVersion.indexOf('Trident/') > -1)
      var a = 'mm-spn';
    let c = (function () {
      function t (t, e, n, i, o) {
        (this.node = t),
        (this.title = e),
        (this.slidingSubmenus = i),
        (this.selectedClass = n),
        this.node.classList.add(a),
        r && (this.slidingSubmenus = !1),
        this.node.classList.add(a + '--' + o),
        this.node.classList.add(
          a + '--' + (this.slidingSubmenus ? 'navbar' : 'vertical')
        ),
        this._setSelectedl(),
        this._initAnchors()
        }
      return (
        Object.defineProperty(t.prototype, 'prefix', {
          get: function () {
            return a
            },
          enumerable: !1,
          configurable: !0
        }),
        (t.prototype.openPanel = function (t) {
          let e = t.parentElement
            if (this.slidingSubmenus) {
            let n = t.dataset.mmSpnTitle
              e === this.node
              ? this.node.classList.add(a + '--main')
              : (this.node.classList.remove(a + '--main'),
                n ||
                    o(e.children).forEach(function (t) {
                      t.matches('a, span') && (n = t.textContent)
                    })),
            n || (n = this.title),
            (this.node.dataset.mmSpnTitle = n),
            s('.mm-spn--open', this.node).forEach(function (t) {
              t.classList.remove(a + '--open'),
              t.classList.remove(a + '--parent')
                }),
            t.classList.add(a + '--open'),
            t.classList.remove(a + '--parent')
              for (let i = t.parentElement.closest('ul'); i;)
              {i.classList.add(a + "--open"),
                  i.classList.add(a + "--parent"),
                  (i = i.parentElement.closest("ul"));}
          } else {
            let r = t.matches('.mm-spn--open')
              s('.mm-spn--open', this.node).forEach(function (t) {
              t.classList.remove(a + '--open')
              }),
            t.classList[r ? 'remove' : 'add'](a + '--open')
              for (let c = t.parentElement.closest('ul'); c;)
              {c.classList.add(a + "--open"),
                  (c = c.parentElement.closest("ul"));}
          }
        }),
        (t.prototype._setSelectedl = function () {
          let t = s('.' + this.selectedClass, this.node);
              var e = t[t.length - 1];
              var n = null
            e && (n = e.closest('ul')),
          n || (n = this.node.querySelector('ul')),
          this.openPanel(n)
          }),
        (t.prototype._initAnchors = function () {
          let t = this
            this.node.addEventListener('click', function (e) {
            let n = e.target;
                var i = !1;
            (i =
                (i =
                  (i =
                    i ||
                    (function (t) {
                      return !!t.matches('a')
                    })(n)) ||
                  (function (e) {
                    let n
                    return (
                      !!(n = e.closest('span')
                        ? e.parentElement
                        : !!e.closest('li') && e) &&
                      (o(n.children).forEach(function (e) {
                        e.matches('ul') && t.openPanel(e)
                      }),
                      !0)
                    )
                  })(n)) ||
                (function (e) {
                  let n = s('.mm-spn--open', e);
                    var i = n[n.length - 1]
                  if (i) {
                    let o = i.parentElement.closest('ul')
                    if (o) return t.openPanel(o), !0
                  }
                  return !1
                })(n)) && e.stopImmediatePropagation()
            })
          }),
        t
      )
      })()
      var d = (function () {
      function t (t, e) {
        let n = this
          void 0 === t && (t = null),
        (this.wrapper = document.createElement('div')),
        this.wrapper.classList.add('mm-ocd'),
        this.wrapper.classList.add('mm-ocd--' + e),
        (this.content = document.createElement('div')),
        this.content.classList.add('mm-ocd__content'),
        this.wrapper.append(this.content),
        (this.backdrop = document.createElement('div')),
        this.backdrop.classList.add('mm-ocd__backdrop'),
        this.wrapper.append(this.backdrop),
        document.body.append(this.wrapper),
        t && this.content.append(t)
          var i = function (t) {
          n.close(), t.stopImmediatePropagation()
          };
        this.backdrop.addEventListener('touchstart', i, { passive: !0 }),
        this.backdrop.addEventListener('mousedown', i, { passive: !0 })
        }
      return (
        Object.defineProperty(t.prototype, 'prefix', {
          get: function () {
            return 'mm-ocd';
          },
          enumerable: !1,
          configurable: !0
        }),
        (t.prototype.open = function () {
          this.wrapper.classList.add('mm-ocd--open'),
          document.body.classList.add('mm-ocd-opened')
          }),
        (t.prototype.close = function () {
          this.wrapper.classList.remove('mm-ocd--open'),
          document.body.classList.remove('mm-ocd-opened')
          }),
        t
      )
      })()
      var u = (function () {
      function t (t, e) {
        void 0 === e && (e = 'all'),
        (this.menu = t),
        (this.toggler = new i(e))
      }
      return (
        (t.prototype.navigation = function (t) {
          const e = this
          if (!this.navigator) {
            const n = (t = t || {}).title
                var i = void 0 === n ? 'Menu' : n
                var o = t.selectedClass
                var s = void 0 === o ? 'Selected' : o
                var r = t.slidingSubmenus
                var a = void 0 === r || r
                var d = t.theme
                var u = void 0 === d ? 'light' : d;
            (this.navigator = new c(this.menu, i, s, a, u)),
            this.toggler.add(
              function () {
                return e.menu.classList.add(e.navigator.prefix)
              },
              function () {
                return e.menu.classList.remove(e.navigator.prefix)
              }
            )
          }
          return this.navigator
        }),
        (t.prototype.offcanvas = function (t) {
          const e = this
          if (!this.drawer) {
            const n = (t = t || {}).position
                var i = void 0 === n ? 'left' : n
            this.drawer = new d(null, i)
            let o = document.createComment('original menu location')
            this.menu.after(o),
            this.toggler.add(
              function () {
                e.drawer.content.append(e.menu)
              },
              function () {
                e.drawer.close(), o.after(e.menu)
              }
            )
          }
          return this.drawer
        }),
        t
      )
    })()
    e.default = u
    window.MmenuLight = u
  }
])
