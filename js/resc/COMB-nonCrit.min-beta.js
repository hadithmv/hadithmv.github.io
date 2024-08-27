// jquery.min.js
!(function (e, t) {
  "use strict";
  "object" == typeof module && "object" == typeof module.exports
    ? (module.exports = e.document
        ? t(e, !0)
        : function (e) {
            if (!e.document)
              throw new Error("jQuery requires a window with a document");
            return t(e);
          })
    : t(e);
})("undefined" != typeof window ? window : this, function (ie, e) {
  "use strict";
  var oe = [],
    r = Object.getPrototypeOf,
    ae = oe.slice,
    g = oe.flat
      ? function (e) {
          return oe.flat.call(e);
        }
      : function (e) {
          return oe.concat.apply([], e);
        },
    s = oe.push,
    se = oe.indexOf,
    n = {},
    i = n.toString,
    ue = n.hasOwnProperty,
    o = ue.toString,
    a = o.call(Object),
    le = {},
    v = function (e) {
      return (
        "function" == typeof e &&
        "number" != typeof e.nodeType &&
        "function" != typeof e.item
      );
    },
    y = function (e) {
      return null != e && e === e.window;
    },
    C = ie.document,
    u = { type: !0, src: !0, nonce: !0, noModule: !0 };
  function m(e, t, n) {
    var r,
      i,
      o = (n = n || C).createElement("script");
    if (((o.text = e), t))
      for (r in u)
        (i = t[r] || (t.getAttribute && t.getAttribute(r))) &&
          o.setAttribute(r, i);
    n.head.appendChild(o).parentNode.removeChild(o);
  }
  function x(e) {
    return null == e
      ? e + ""
      : "object" == typeof e || "function" == typeof e
        ? n[i.call(e)] || "object"
        : typeof e;
  }
  var t = "3.7.1",
    l = /HTML$/i,
    ce = function (e, t) {
      return new ce.fn.init(e, t);
    };
  function c(e) {
    var t = !!e && "length" in e && e.length,
      n = x(e);
    return (
      !v(e) &&
      !y(e) &&
      ("array" === n ||
        0 === t ||
        ("number" == typeof t && 0 < t && t - 1 in e))
    );
  }
  function fe(e, t) {
    return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase();
  }
  (ce.fn = ce.prototype =
    {
      jquery: t,
      constructor: ce,
      length: 0,
      toArray: function () {
        return ae.call(this);
      },
      get: function (e) {
        return null == e
          ? ae.call(this)
          : e < 0
            ? this[e + this.length]
            : this[e];
      },
      pushStack: function (e) {
        var t = ce.merge(this.constructor(), e);
        return (t.prevObject = this), t;
      },
      each: function (e) {
        return ce.each(this, e);
      },
      map: function (n) {
        return this.pushStack(
          ce.map(this, function (e, t) {
            return n.call(e, t, e);
          })
        );
      },
      slice: function () {
        return this.pushStack(ae.apply(this, arguments));
      },
      first: function () {
        return this.eq(0);
      },
      last: function () {
        return this.eq(-1);
      },
      even: function () {
        return this.pushStack(
          ce.grep(this, function (e, t) {
            return (t + 1) % 2;
          })
        );
      },
      odd: function () {
        return this.pushStack(
          ce.grep(this, function (e, t) {
            return t % 2;
          })
        );
      },
      eq: function (e) {
        var t = this.length,
          n = +e + (e < 0 ? t : 0);
        return this.pushStack(0 <= n && n < t ? [this[n]] : []);
      },
      end: function () {
        return this.prevObject || this.constructor();
      },
      push: s,
      sort: oe.sort,
      splice: oe.splice,
    }),
    (ce.extend = ce.fn.extend =
      function () {
        var e,
          t,
          n,
          r,
          i,
          o,
          a = arguments[0] || {},
          s = 1,
          u = arguments.length,
          l = !1;
        for (
          "boolean" == typeof a && ((l = a), (a = arguments[s] || {}), s++),
            "object" == typeof a || v(a) || (a = {}),
            s === u && ((a = this), s--);
          s < u;
          s++
        )
          if (null != (e = arguments[s]))
            for (t in e)
              (r = e[t]),
                "__proto__" !== t &&
                  a !== r &&
                  (l && r && (ce.isPlainObject(r) || (i = Array.isArray(r)))
                    ? ((n = a[t]),
                      (o =
                        i && !Array.isArray(n)
                          ? []
                          : i || ce.isPlainObject(n)
                            ? n
                            : {}),
                      (i = !1),
                      (a[t] = ce.extend(l, o, r)))
                    : void 0 !== r && (a[t] = r));
        return a;
      }),
    ce.extend({
      expando: "jQuery" + (t + Math.random()).replace(/\D/g, ""),
      isReady: !0,
      error: function (e) {
        throw new Error(e);
      },
      noop: function () {},
      isPlainObject: function (e) {
        var t, n;
        return (
          !(!e || "[object Object]" !== i.call(e)) &&
          (!(t = r(e)) ||
            ("function" ==
              typeof (n = ue.call(t, "constructor") && t.constructor) &&
              o.call(n) === a))
        );
      },
      isEmptyObject: function (e) {
        var t;
        for (t in e) return !1;
        return !0;
      },
      globalEval: function (e, t, n) {
        m(e, { nonce: t && t.nonce }, n);
      },
      each: function (e, t) {
        var n,
          r = 0;
        if (c(e)) {
          for (n = e.length; r < n; r++)
            if (!1 === t.call(e[r], r, e[r])) break;
        } else for (r in e) if (!1 === t.call(e[r], r, e[r])) break;
        return e;
      },
      text: function (e) {
        var t,
          n = "",
          r = 0,
          i = e.nodeType;
        if (!i) while ((t = e[r++])) n += ce.text(t);
        return 1 === i || 11 === i
          ? e.textContent
          : 9 === i
            ? e.documentElement.textContent
            : 3 === i || 4 === i
              ? e.nodeValue
              : n;
      },
      makeArray: function (e, t) {
        var n = t || [];
        return (
          null != e &&
            (c(Object(e))
              ? ce.merge(n, "string" == typeof e ? [e] : e)
              : s.call(n, e)),
          n
        );
      },
      inArray: function (e, t, n) {
        return null == t ? -1 : se.call(t, e, n);
      },
      isXMLDoc: function (e) {
        var t = e && e.namespaceURI,
          n = e && (e.ownerDocument || e).documentElement;
        return !l.test(t || (n && n.nodeName) || "HTML");
      },
      merge: function (e, t) {
        for (var n = +t.length, r = 0, i = e.length; r < n; r++) e[i++] = t[r];
        return (e.length = i), e;
      },
      grep: function (e, t, n) {
        for (var r = [], i = 0, o = e.length, a = !n; i < o; i++)
          !t(e[i], i) !== a && r.push(e[i]);
        return r;
      },
      map: function (e, t, n) {
        var r,
          i,
          o = 0,
          a = [];
        if (c(e))
          for (r = e.length; o < r; o++)
            null != (i = t(e[o], o, n)) && a.push(i);
        else for (o in e) null != (i = t(e[o], o, n)) && a.push(i);
        return g(a);
      },
      guid: 1,
      support: le,
    }),
    "function" == typeof Symbol &&
      (ce.fn[Symbol.iterator] = oe[Symbol.iterator]),
    ce.each(
      "Boolean Number String Function Array Date RegExp Object Error Symbol".split(
        " "
      ),
      function (e, t) {
        n["[object " + t + "]"] = t.toLowerCase();
      }
    );
  var pe = oe.pop,
    de = oe.sort,
    he = oe.splice,
    ge = "[\\x20\\t\\r\\n\\f]",
    ve = new RegExp("^" + ge + "+|((?:^|[^\\\\])(?:\\\\.)*)" + ge + "+$", "g");
  ce.contains = function (e, t) {
    var n = t && t.parentNode;
    return (
      e === n ||
      !(
        !n ||
        1 !== n.nodeType ||
        !(e.contains
          ? e.contains(n)
          : e.compareDocumentPosition && 16 & e.compareDocumentPosition(n))
      )
    );
  };
  var f = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;
  function p(e, t) {
    return t
      ? "\0" === e
        ? "\ufffd"
        : e.slice(0, -1) + "\\" + e.charCodeAt(e.length - 1).toString(16) + " "
      : "\\" + e;
  }
  ce.escapeSelector = function (e) {
    return (e + "").replace(f, p);
  };
  var ye = C,
    me = s;
  !(function () {
    var e,
      b,
      w,
      o,
      a,
      T,
      r,
      C,
      d,
      i,
      k = me,
      S = ce.expando,
      E = 0,
      n = 0,
      s = W(),
      c = W(),
      u = W(),
      h = W(),
      l = function (e, t) {
        return e === t && (a = !0), 0;
      },
      f =
        "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
      t =
        "(?:\\\\[\\da-fA-F]{1,6}" +
        ge +
        "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",
      p =
        "\\[" +
        ge +
        "*(" +
        t +
        ")(?:" +
        ge +
        "*([*^$|!~]?=)" +
        ge +
        "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" +
        t +
        "))|)" +
        ge +
        "*\\]",
      g =
        ":(" +
        t +
        ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" +
        p +
        ")*)|.*)\\)|)",
      v = new RegExp(ge + "+", "g"),
      y = new RegExp("^" + ge + "*," + ge + "*"),
      m = new RegExp("^" + ge + "*([>+~]|" + ge + ")" + ge + "*"),
      x = new RegExp(ge + "|>"),
      j = new RegExp(g),
      A = new RegExp("^" + t + "$"),
      D = {
        ID: new RegExp("^#(" + t + ")"),
        CLASS: new RegExp("^\\.(" + t + ")"),
        TAG: new RegExp("^(" + t + "|[*])"),
        ATTR: new RegExp("^" + p),
        PSEUDO: new RegExp("^" + g),
        CHILD: new RegExp(
          "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
            ge +
            "*(even|odd|(([+-]|)(\\d*)n|)" +
            ge +
            "*(?:([+-]|)" +
            ge +
            "*(\\d+)|))" +
            ge +
            "*\\)|)",
          "i"
        ),
        bool: new RegExp("^(?:" + f + ")$", "i"),
        needsContext: new RegExp(
          "^" +
            ge +
            "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
            ge +
            "*((?:-\\d)?\\d*)" +
            ge +
            "*\\)|)(?=[^-]|$)",
          "i"
        ),
      },
      N = /^(?:input|select|textarea|button)$/i,
      q = /^h\d$/i,
      L = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
      H = /[+~]/,
      O = new RegExp("\\\\[\\da-fA-F]{1,6}" + ge + "?|\\\\([^\\r\\n\\f])", "g"),
      P = function (e, t) {
        var n = "0x" + e.slice(1) - 65536;
        return (
          t ||
          (n < 0
            ? String.fromCharCode(n + 65536)
            : String.fromCharCode((n >> 10) | 55296, (1023 & n) | 56320))
        );
      },
      M = function () {
        V();
      },
      R = J(
        function (e) {
          return !0 === e.disabled && fe(e, "fieldset");
        },
        { dir: "parentNode", next: "legend" }
      );
    try {
      k.apply((oe = ae.call(ye.childNodes)), ye.childNodes),
        oe[ye.childNodes.length].nodeType;
    } catch (e) {
      k = {
        apply: function (e, t) {
          me.apply(e, ae.call(t));
        },
        call: function (e) {
          me.apply(e, ae.call(arguments, 1));
        },
      };
    }
    function I(t, e, n, r) {
      var i,
        o,
        a,
        s,
        u,
        l,
        c,
        f = e && e.ownerDocument,
        p = e ? e.nodeType : 9;
      if (
        ((n = n || []),
        "string" != typeof t || !t || (1 !== p && 9 !== p && 11 !== p))
      )
        return n;
      if (!r && (V(e), (e = e || T), C)) {
        if (11 !== p && (u = L.exec(t)))
          if ((i = u[1])) {
            if (9 === p) {
              if (!(a = e.getElementById(i))) return n;
              if (a.id === i) return k.call(n, a), n;
            } else if (
              f &&
              (a = f.getElementById(i)) &&
              I.contains(e, a) &&
              a.id === i
            )
              return k.call(n, a), n;
          } else {
            if (u[2]) return k.apply(n, e.getElementsByTagName(t)), n;
            if ((i = u[3]) && e.getElementsByClassName)
              return k.apply(n, e.getElementsByClassName(i)), n;
          }
        if (!(h[t + " "] || (d && d.test(t)))) {
          if (((c = t), (f = e), 1 === p && (x.test(t) || m.test(t)))) {
            ((f = (H.test(t) && U(e.parentNode)) || e) == e && le.scope) ||
              ((s = e.getAttribute("id"))
                ? (s = ce.escapeSelector(s))
                : e.setAttribute("id", (s = S))),
              (o = (l = Y(t)).length);
            while (o--) l[o] = (s ? "#" + s : ":scope") + " " + Q(l[o]);
            c = l.join(",");
          }
          try {
            return k.apply(n, f.querySelectorAll(c)), n;
          } catch (e) {
            h(t, !0);
          } finally {
            s === S && e.removeAttribute("id");
          }
        }
      }
      return re(t.replace(ve, "$1"), e, n, r);
    }
    function W() {
      var r = [];
      return function e(t, n) {
        return (
          r.push(t + " ") > b.cacheLength && delete e[r.shift()],
          (e[t + " "] = n)
        );
      };
    }
    function F(e) {
      return (e[S] = !0), e;
    }
    function $(e) {
      var t = T.createElement("fieldset");
      try {
        return !!e(t);
      } catch (e) {
        return !1;
      } finally {
        t.parentNode && t.parentNode.removeChild(t), (t = null);
      }
    }
    function B(t) {
      return function (e) {
        return fe(e, "input") && e.type === t;
      };
    }
    function _(t) {
      return function (e) {
        return (fe(e, "input") || fe(e, "button")) && e.type === t;
      };
    }
    function z(t) {
      return function (e) {
        return "form" in e
          ? e.parentNode && !1 === e.disabled
            ? "label" in e
              ? "label" in e.parentNode
                ? e.parentNode.disabled === t
                : e.disabled === t
              : e.isDisabled === t || (e.isDisabled !== !t && R(e) === t)
            : e.disabled === t
          : "label" in e && e.disabled === t;
      };
    }
    function X(a) {
      return F(function (o) {
        return (
          (o = +o),
          F(function (e, t) {
            var n,
              r = a([], e.length, o),
              i = r.length;
            while (i--) e[(n = r[i])] && (e[n] = !(t[n] = e[n]));
          })
        );
      });
    }
    function U(e) {
      return e && "undefined" != typeof e.getElementsByTagName && e;
    }
    function V(e) {
      var t,
        n = e ? e.ownerDocument || e : ye;
      return (
        n != T &&
          9 === n.nodeType &&
          n.documentElement &&
          ((r = (T = n).documentElement),
          (C = !ce.isXMLDoc(T)),
          (i = r.matches || r.webkitMatchesSelector || r.msMatchesSelector),
          r.msMatchesSelector &&
            ye != T &&
            (t = T.defaultView) &&
            t.top !== t &&
            t.addEventListener("unload", M),
          (le.getById = $(function (e) {
            return (
              (r.appendChild(e).id = ce.expando),
              !T.getElementsByName || !T.getElementsByName(ce.expando).length
            );
          })),
          (le.disconnectedMatch = $(function (e) {
            return i.call(e, "*");
          })),
          (le.scope = $(function () {
            return T.querySelectorAll(":scope");
          })),
          (le.cssHas = $(function () {
            try {
              return T.querySelector(":has(*,:jqfake)"), !1;
            } catch (e) {
              return !0;
            }
          })),
          le.getById
            ? ((b.filter.ID = function (e) {
                var t = e.replace(O, P);
                return function (e) {
                  return e.getAttribute("id") === t;
                };
              }),
              (b.find.ID = function (e, t) {
                if ("undefined" != typeof t.getElementById && C) {
                  var n = t.getElementById(e);
                  return n ? [n] : [];
                }
              }))
            : ((b.filter.ID = function (e) {
                var n = e.replace(O, P);
                return function (e) {
                  var t =
                    "undefined" != typeof e.getAttributeNode &&
                    e.getAttributeNode("id");
                  return t && t.value === n;
                };
              }),
              (b.find.ID = function (e, t) {
                if ("undefined" != typeof t.getElementById && C) {
                  var n,
                    r,
                    i,
                    o = t.getElementById(e);
                  if (o) {
                    if ((n = o.getAttributeNode("id")) && n.value === e)
                      return [o];
                    (i = t.getElementsByName(e)), (r = 0);
                    while ((o = i[r++]))
                      if ((n = o.getAttributeNode("id")) && n.value === e)
                        return [o];
                  }
                  return [];
                }
              })),
          (b.find.TAG = function (e, t) {
            return "undefined" != typeof t.getElementsByTagName
              ? t.getElementsByTagName(e)
              : t.querySelectorAll(e);
          }),
          (b.find.CLASS = function (e, t) {
            if ("undefined" != typeof t.getElementsByClassName && C)
              return t.getElementsByClassName(e);
          }),
          (d = []),
          $(function (e) {
            var t;
            (r.appendChild(e).innerHTML =
              "<a id='" +
              S +
              "' href='' disabled='disabled'></a><select id='" +
              S +
              "-\r\\' disabled='disabled'><option selected=''></option></select>"),
              e.querySelectorAll("[selected]").length ||
                d.push("\\[" + ge + "*(?:value|" + f + ")"),
              e.querySelectorAll("[id~=" + S + "-]").length || d.push("~="),
              e.querySelectorAll("a#" + S + "+*").length || d.push(".#.+[+~]"),
              e.querySelectorAll(":checked").length || d.push(":checked"),
              (t = T.createElement("input")).setAttribute("type", "hidden"),
              e.appendChild(t).setAttribute("name", "D"),
              (r.appendChild(e).disabled = !0),
              2 !== e.querySelectorAll(":disabled").length &&
                d.push(":enabled", ":disabled"),
              (t = T.createElement("input")).setAttribute("name", ""),
              e.appendChild(t),
              e.querySelectorAll("[name='']").length ||
                d.push("\\[" + ge + "*name" + ge + "*=" + ge + "*(?:''|\"\")");
          }),
          le.cssHas || d.push(":has"),
          (d = d.length && new RegExp(d.join("|"))),
          (l = function (e, t) {
            if (e === t) return (a = !0), 0;
            var n = !e.compareDocumentPosition - !t.compareDocumentPosition;
            return (
              n ||
              (1 &
                (n =
                  (e.ownerDocument || e) == (t.ownerDocument || t)
                    ? e.compareDocumentPosition(t)
                    : 1) ||
              (!le.sortDetached && t.compareDocumentPosition(e) === n)
                ? e === T || (e.ownerDocument == ye && I.contains(ye, e))
                  ? -1
                  : t === T || (t.ownerDocument == ye && I.contains(ye, t))
                    ? 1
                    : o
                      ? se.call(o, e) - se.call(o, t)
                      : 0
                : 4 & n
                  ? -1
                  : 1)
            );
          })),
        T
      );
    }
    for (e in ((I.matches = function (e, t) {
      return I(e, null, null, t);
    }),
    (I.matchesSelector = function (e, t) {
      if ((V(e), C && !h[t + " "] && (!d || !d.test(t))))
        try {
          var n = i.call(e, t);
          if (
            n ||
            le.disconnectedMatch ||
            (e.document && 11 !== e.document.nodeType)
          )
            return n;
        } catch (e) {
          h(t, !0);
        }
      return 0 < I(t, T, null, [e]).length;
    }),
    (I.contains = function (e, t) {
      return (e.ownerDocument || e) != T && V(e), ce.contains(e, t);
    }),
    (I.attr = function (e, t) {
      (e.ownerDocument || e) != T && V(e);
      var n = b.attrHandle[t.toLowerCase()],
        r = n && ue.call(b.attrHandle, t.toLowerCase()) ? n(e, t, !C) : void 0;
      return void 0 !== r ? r : e.getAttribute(t);
    }),
    (I.error = function (e) {
      throw new Error("Syntax error, unrecognized expression: " + e);
    }),
    (ce.uniqueSort = function (e) {
      var t,
        n = [],
        r = 0,
        i = 0;
      if (
        ((a = !le.sortStable),
        (o = !le.sortStable && ae.call(e, 0)),
        de.call(e, l),
        a)
      ) {
        while ((t = e[i++])) t === e[i] && (r = n.push(i));
        while (r--) he.call(e, n[r], 1);
      }
      return (o = null), e;
    }),
    (ce.fn.uniqueSort = function () {
      return this.pushStack(ce.uniqueSort(ae.apply(this)));
    }),
    ((b = ce.expr =
      {
        cacheLength: 50,
        createPseudo: F,
        match: D,
        attrHandle: {},
        find: {},
        relative: {
          ">": { dir: "parentNode", first: !0 },
          " ": { dir: "parentNode" },
          "+": { dir: "previousSibling", first: !0 },
          "~": { dir: "previousSibling" },
        },
        preFilter: {
          ATTR: function (e) {
            return (
              (e[1] = e[1].replace(O, P)),
              (e[3] = (e[3] || e[4] || e[5] || "").replace(O, P)),
              "~=" === e[2] && (e[3] = " " + e[3] + " "),
              e.slice(0, 4)
            );
          },
          CHILD: function (e) {
            return (
              (e[1] = e[1].toLowerCase()),
              "nth" === e[1].slice(0, 3)
                ? (e[3] || I.error(e[0]),
                  (e[4] = +(e[4]
                    ? e[5] + (e[6] || 1)
                    : 2 * ("even" === e[3] || "odd" === e[3]))),
                  (e[5] = +(e[7] + e[8] || "odd" === e[3])))
                : e[3] && I.error(e[0]),
              e
            );
          },
          PSEUDO: function (e) {
            var t,
              n = !e[6] && e[2];
            return D.CHILD.test(e[0])
              ? null
              : (e[3]
                  ? (e[2] = e[4] || e[5] || "")
                  : n &&
                    j.test(n) &&
                    (t = Y(n, !0)) &&
                    (t = n.indexOf(")", n.length - t) - n.length) &&
                    ((e[0] = e[0].slice(0, t)), (e[2] = n.slice(0, t))),
                e.slice(0, 3));
          },
        },
        filter: {
          TAG: function (e) {
            var t = e.replace(O, P).toLowerCase();
            return "*" === e
              ? function () {
                  return !0;
                }
              : function (e) {
                  return fe(e, t);
                };
          },
          CLASS: function (e) {
            var t = s[e + " "];
            return (
              t ||
              ((t = new RegExp("(^|" + ge + ")" + e + "(" + ge + "|$)")) &&
                s(e, function (e) {
                  return t.test(
                    ("string" == typeof e.className && e.className) ||
                      ("undefined" != typeof e.getAttribute &&
                        e.getAttribute("class")) ||
                      ""
                  );
                }))
            );
          },
          ATTR: function (n, r, i) {
            return function (e) {
              var t = I.attr(e, n);
              return null == t
                ? "!=" === r
                : !r ||
                    ((t += ""),
                    "=" === r
                      ? t === i
                      : "!=" === r
                        ? t !== i
                        : "^=" === r
                          ? i && 0 === t.indexOf(i)
                          : "*=" === r
                            ? i && -1 < t.indexOf(i)
                            : "$=" === r
                              ? i && t.slice(-i.length) === i
                              : "~=" === r
                                ? -1 <
                                  (" " + t.replace(v, " ") + " ").indexOf(i)
                                : "|=" === r &&
                                  (t === i ||
                                    t.slice(0, i.length + 1) === i + "-"));
            };
          },
          CHILD: function (d, e, t, h, g) {
            var v = "nth" !== d.slice(0, 3),
              y = "last" !== d.slice(-4),
              m = "of-type" === e;
            return 1 === h && 0 === g
              ? function (e) {
                  return !!e.parentNode;
                }
              : function (e, t, n) {
                  var r,
                    i,
                    o,
                    a,
                    s,
                    u = v !== y ? "nextSibling" : "previousSibling",
                    l = e.parentNode,
                    c = m && e.nodeName.toLowerCase(),
                    f = !n && !m,
                    p = !1;
                  if (l) {
                    if (v) {
                      while (u) {
                        o = e;
                        while ((o = o[u]))
                          if (m ? fe(o, c) : 1 === o.nodeType) return !1;
                        s = u = "only" === d && !s && "nextSibling";
                      }
                      return !0;
                    }
                    if (((s = [y ? l.firstChild : l.lastChild]), y && f)) {
                      (p =
                        (a =
                          (r = (i = l[S] || (l[S] = {}))[d] || [])[0] === E &&
                          r[1]) && r[2]),
                        (o = a && l.childNodes[a]);
                      while ((o = (++a && o && o[u]) || (p = a = 0) || s.pop()))
                        if (1 === o.nodeType && ++p && o === e) {
                          i[d] = [E, a, p];
                          break;
                        }
                    } else if (
                      (f &&
                        (p = a =
                          (r = (i = e[S] || (e[S] = {}))[d] || [])[0] === E &&
                          r[1]),
                      !1 === p)
                    )
                      while ((o = (++a && o && o[u]) || (p = a = 0) || s.pop()))
                        if (
                          (m ? fe(o, c) : 1 === o.nodeType) &&
                          ++p &&
                          (f && ((i = o[S] || (o[S] = {}))[d] = [E, p]),
                          o === e)
                        )
                          break;
                    return (p -= g) === h || (p % h == 0 && 0 <= p / h);
                  }
                };
          },
          PSEUDO: function (e, o) {
            var t,
              a =
                b.pseudos[e] ||
                b.setFilters[e.toLowerCase()] ||
                I.error("unsupported pseudo: " + e);
            return a[S]
              ? a(o)
              : 1 < a.length
                ? ((t = [e, e, "", o]),
                  b.setFilters.hasOwnProperty(e.toLowerCase())
                    ? F(function (e, t) {
                        var n,
                          r = a(e, o),
                          i = r.length;
                        while (i--) e[(n = se.call(e, r[i]))] = !(t[n] = r[i]);
                      })
                    : function (e) {
                        return a(e, 0, t);
                      })
                : a;
          },
        },
        pseudos: {
          not: F(function (e) {
            var r = [],
              i = [],
              s = ne(e.replace(ve, "$1"));
            return s[S]
              ? F(function (e, t, n, r) {
                  var i,
                    o = s(e, null, r, []),
                    a = e.length;
                  while (a--) (i = o[a]) && (e[a] = !(t[a] = i));
                })
              : function (e, t, n) {
                  return (r[0] = e), s(r, null, n, i), (r[0] = null), !i.pop();
                };
          }),
          has: F(function (t) {
            return function (e) {
              return 0 < I(t, e).length;
            };
          }),
          contains: F(function (t) {
            return (
              (t = t.replace(O, P)),
              function (e) {
                return -1 < (e.textContent || ce.text(e)).indexOf(t);
              }
            );
          }),
          lang: F(function (n) {
            return (
              A.test(n || "") || I.error("unsupported lang: " + n),
              (n = n.replace(O, P).toLowerCase()),
              function (e) {
                var t;
                do {
                  if (
                    (t = C
                      ? e.lang
                      : e.getAttribute("xml:lang") || e.getAttribute("lang"))
                  )
                    return (
                      (t = t.toLowerCase()) === n || 0 === t.indexOf(n + "-")
                    );
                } while ((e = e.parentNode) && 1 === e.nodeType);
                return !1;
              }
            );
          }),
          target: function (e) {
            var t = ie.location && ie.location.hash;
            return t && t.slice(1) === e.id;
          },
          root: function (e) {
            return e === r;
          },
          focus: function (e) {
            return (
              e ===
                (function () {
                  try {
                    return T.activeElement;
                  } catch (e) {}
                })() &&
              T.hasFocus() &&
              !!(e.type || e.href || ~e.tabIndex)
            );
          },
          enabled: z(!1),
          disabled: z(!0),
          checked: function (e) {
            return (
              (fe(e, "input") && !!e.checked) ||
              (fe(e, "option") && !!e.selected)
            );
          },
          selected: function (e) {
            return (
              e.parentNode && e.parentNode.selectedIndex, !0 === e.selected
            );
          },
          empty: function (e) {
            for (e = e.firstChild; e; e = e.nextSibling)
              if (e.nodeType < 6) return !1;
            return !0;
          },
          parent: function (e) {
            return !b.pseudos.empty(e);
          },
          header: function (e) {
            return q.test(e.nodeName);
          },
          input: function (e) {
            return N.test(e.nodeName);
          },
          button: function (e) {
            return (fe(e, "input") && "button" === e.type) || fe(e, "button");
          },
          text: function (e) {
            var t;
            return (
              fe(e, "input") &&
              "text" === e.type &&
              (null == (t = e.getAttribute("type")) ||
                "text" === t.toLowerCase())
            );
          },
          first: X(function () {
            return [0];
          }),
          last: X(function (e, t) {
            return [t - 1];
          }),
          eq: X(function (e, t, n) {
            return [n < 0 ? n + t : n];
          }),
          even: X(function (e, t) {
            for (var n = 0; n < t; n += 2) e.push(n);
            return e;
          }),
          odd: X(function (e, t) {
            for (var n = 1; n < t; n += 2) e.push(n);
            return e;
          }),
          lt: X(function (e, t, n) {
            var r;
            for (r = n < 0 ? n + t : t < n ? t : n; 0 <= --r; ) e.push(r);
            return e;
          }),
          gt: X(function (e, t, n) {
            for (var r = n < 0 ? n + t : n; ++r < t; ) e.push(r);
            return e;
          }),
        },
      }).pseudos.nth = b.pseudos.eq),
    { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 }))
      b.pseudos[e] = B(e);
    for (e in { submit: !0, reset: !0 }) b.pseudos[e] = _(e);
    function G() {}
    function Y(e, t) {
      var n,
        r,
        i,
        o,
        a,
        s,
        u,
        l = c[e + " "];
      if (l) return t ? 0 : l.slice(0);
      (a = e), (s = []), (u = b.preFilter);
      while (a) {
        for (o in ((n && !(r = y.exec(a))) ||
          (r && (a = a.slice(r[0].length) || a), s.push((i = []))),
        (n = !1),
        (r = m.exec(a)) &&
          ((n = r.shift()),
          i.push({ value: n, type: r[0].replace(ve, " ") }),
          (a = a.slice(n.length))),
        b.filter))
          !(r = D[o].exec(a)) ||
            (u[o] && !(r = u[o](r))) ||
            ((n = r.shift()),
            i.push({ value: n, type: o, matches: r }),
            (a = a.slice(n.length)));
        if (!n) break;
      }
      return t ? a.length : a ? I.error(e) : c(e, s).slice(0);
    }
    function Q(e) {
      for (var t = 0, n = e.length, r = ""; t < n; t++) r += e[t].value;
      return r;
    }
    function J(a, e, t) {
      var s = e.dir,
        u = e.next,
        l = u || s,
        c = t && "parentNode" === l,
        f = n++;
      return e.first
        ? function (e, t, n) {
            while ((e = e[s])) if (1 === e.nodeType || c) return a(e, t, n);
            return !1;
          }
        : function (e, t, n) {
            var r,
              i,
              o = [E, f];
            if (n) {
              while ((e = e[s]))
                if ((1 === e.nodeType || c) && a(e, t, n)) return !0;
            } else
              while ((e = e[s]))
                if (1 === e.nodeType || c)
                  if (((i = e[S] || (e[S] = {})), u && fe(e, u))) e = e[s] || e;
                  else {
                    if ((r = i[l]) && r[0] === E && r[1] === f)
                      return (o[2] = r[2]);
                    if (((i[l] = o)[2] = a(e, t, n))) return !0;
                  }
            return !1;
          };
    }
    function K(i) {
      return 1 < i.length
        ? function (e, t, n) {
            var r = i.length;
            while (r--) if (!i[r](e, t, n)) return !1;
            return !0;
          }
        : i[0];
    }
    function Z(e, t, n, r, i) {
      for (var o, a = [], s = 0, u = e.length, l = null != t; s < u; s++)
        (o = e[s]) && ((n && !n(o, r, i)) || (a.push(o), l && t.push(s)));
      return a;
    }
    function ee(d, h, g, v, y, e) {
      return (
        v && !v[S] && (v = ee(v)),
        y && !y[S] && (y = ee(y, e)),
        F(function (e, t, n, r) {
          var i,
            o,
            a,
            s,
            u = [],
            l = [],
            c = t.length,
            f =
              e ||
              (function (e, t, n) {
                for (var r = 0, i = t.length; r < i; r++) I(e, t[r], n);
                return n;
              })(h || "*", n.nodeType ? [n] : n, []),
            p = !d || (!e && h) ? f : Z(f, u, d, n, r);
          if (
            (g ? g(p, (s = y || (e ? d : c || v) ? [] : t), n, r) : (s = p), v)
          ) {
            (i = Z(s, l)), v(i, [], n, r), (o = i.length);
            while (o--) (a = i[o]) && (s[l[o]] = !(p[l[o]] = a));
          }
          if (e) {
            if (y || d) {
              if (y) {
                (i = []), (o = s.length);
                while (o--) (a = s[o]) && i.push((p[o] = a));
                y(null, (s = []), i, r);
              }
              o = s.length;
              while (o--)
                (a = s[o]) &&
                  -1 < (i = y ? se.call(e, a) : u[o]) &&
                  (e[i] = !(t[i] = a));
            }
          } else
            (s = Z(s === t ? s.splice(c, s.length) : s)),
              y ? y(null, t, s, r) : k.apply(t, s);
        })
      );
    }
    function te(e) {
      for (
        var i,
          t,
          n,
          r = e.length,
          o = b.relative[e[0].type],
          a = o || b.relative[" "],
          s = o ? 1 : 0,
          u = J(
            function (e) {
              return e === i;
            },
            a,
            !0
          ),
          l = J(
            function (e) {
              return -1 < se.call(i, e);
            },
            a,
            !0
          ),
          c = [
            function (e, t, n) {
              var r =
                (!o && (n || t != w)) ||
                ((i = t).nodeType ? u(e, t, n) : l(e, t, n));
              return (i = null), r;
            },
          ];
        s < r;
        s++
      )
        if ((t = b.relative[e[s].type])) c = [J(K(c), t)];
        else {
          if ((t = b.filter[e[s].type].apply(null, e[s].matches))[S]) {
            for (n = ++s; n < r; n++) if (b.relative[e[n].type]) break;
            return ee(
              1 < s && K(c),
              1 < s &&
                Q(
                  e
                    .slice(0, s - 1)
                    .concat({ value: " " === e[s - 2].type ? "*" : "" })
                ).replace(ve, "$1"),
              t,
              s < n && te(e.slice(s, n)),
              n < r && te((e = e.slice(n))),
              n < r && Q(e)
            );
          }
          c.push(t);
        }
      return K(c);
    }
    function ne(e, t) {
      var n,
        v,
        y,
        m,
        x,
        r,
        i = [],
        o = [],
        a = u[e + " "];
      if (!a) {
        t || (t = Y(e)), (n = t.length);
        while (n--) (a = te(t[n]))[S] ? i.push(a) : o.push(a);
        (a = u(
          e,
          ((v = o),
          (m = 0 < (y = i).length),
          (x = 0 < v.length),
          (r = function (e, t, n, r, i) {
            var o,
              a,
              s,
              u = 0,
              l = "0",
              c = e && [],
              f = [],
              p = w,
              d = e || (x && b.find.TAG("*", i)),
              h = (E += null == p ? 1 : Math.random() || 0.1),
              g = d.length;
            for (
              i && (w = t == T || t || i);
              l !== g && null != (o = d[l]);
              l++
            ) {
              if (x && o) {
                (a = 0), t || o.ownerDocument == T || (V(o), (n = !C));
                while ((s = v[a++]))
                  if (s(o, t || T, n)) {
                    k.call(r, o);
                    break;
                  }
                i && (E = h);
              }
              m && ((o = !s && o) && u--, e && c.push(o));
            }
            if (((u += l), m && l !== u)) {
              a = 0;
              while ((s = y[a++])) s(c, f, t, n);
              if (e) {
                if (0 < u) while (l--) c[l] || f[l] || (f[l] = pe.call(r));
                f = Z(f);
              }
              k.apply(r, f),
                i && !e && 0 < f.length && 1 < u + y.length && ce.uniqueSort(r);
            }
            return i && ((E = h), (w = p)), c;
          }),
          m ? F(r) : r)
        )).selector = e;
      }
      return a;
    }
    function re(e, t, n, r) {
      var i,
        o,
        a,
        s,
        u,
        l = "function" == typeof e && e,
        c = !r && Y((e = l.selector || e));
      if (((n = n || []), 1 === c.length)) {
        if (
          2 < (o = c[0] = c[0].slice(0)).length &&
          "ID" === (a = o[0]).type &&
          9 === t.nodeType &&
          C &&
          b.relative[o[1].type]
        ) {
          if (!(t = (b.find.ID(a.matches[0].replace(O, P), t) || [])[0]))
            return n;
          l && (t = t.parentNode), (e = e.slice(o.shift().value.length));
        }
        i = D.needsContext.test(e) ? 0 : o.length;
        while (i--) {
          if (((a = o[i]), b.relative[(s = a.type)])) break;
          if (
            (u = b.find[s]) &&
            (r = u(
              a.matches[0].replace(O, P),
              (H.test(o[0].type) && U(t.parentNode)) || t
            ))
          ) {
            if ((o.splice(i, 1), !(e = r.length && Q(o))))
              return k.apply(n, r), n;
            break;
          }
        }
      }
      return (
        (l || ne(e, c))(r, t, !C, n, !t || (H.test(e) && U(t.parentNode)) || t),
        n
      );
    }
    (G.prototype = b.filters = b.pseudos),
      (b.setFilters = new G()),
      (le.sortStable = S.split("").sort(l).join("") === S),
      V(),
      (le.sortDetached = $(function (e) {
        return 1 & e.compareDocumentPosition(T.createElement("fieldset"));
      })),
      (ce.find = I),
      (ce.expr[":"] = ce.expr.pseudos),
      (ce.unique = ce.uniqueSort),
      (I.compile = ne),
      (I.select = re),
      (I.setDocument = V),
      (I.tokenize = Y),
      (I.escape = ce.escapeSelector),
      (I.getText = ce.text),
      (I.isXML = ce.isXMLDoc),
      (I.selectors = ce.expr),
      (I.support = ce.support),
      (I.uniqueSort = ce.uniqueSort);
  })();
  var d = function (e, t, n) {
      var r = [],
        i = void 0 !== n;
      while ((e = e[t]) && 9 !== e.nodeType)
        if (1 === e.nodeType) {
          if (i && ce(e).is(n)) break;
          r.push(e);
        }
      return r;
    },
    h = function (e, t) {
      for (var n = []; e; e = e.nextSibling)
        1 === e.nodeType && e !== t && n.push(e);
      return n;
    },
    b = ce.expr.match.needsContext,
    w = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
  function T(e, n, r) {
    return v(n)
      ? ce.grep(e, function (e, t) {
          return !!n.call(e, t, e) !== r;
        })
      : n.nodeType
        ? ce.grep(e, function (e) {
            return (e === n) !== r;
          })
        : "string" != typeof n
          ? ce.grep(e, function (e) {
              return -1 < se.call(n, e) !== r;
            })
          : ce.filter(n, e, r);
  }
  (ce.filter = function (e, t, n) {
    var r = t[0];
    return (
      n && (e = ":not(" + e + ")"),
      1 === t.length && 1 === r.nodeType
        ? ce.find.matchesSelector(r, e)
          ? [r]
          : []
        : ce.find.matches(
            e,
            ce.grep(t, function (e) {
              return 1 === e.nodeType;
            })
          )
    );
  }),
    ce.fn.extend({
      find: function (e) {
        var t,
          n,
          r = this.length,
          i = this;
        if ("string" != typeof e)
          return this.pushStack(
            ce(e).filter(function () {
              for (t = 0; t < r; t++) if (ce.contains(i[t], this)) return !0;
            })
          );
        for (n = this.pushStack([]), t = 0; t < r; t++) ce.find(e, i[t], n);
        return 1 < r ? ce.uniqueSort(n) : n;
      },
      filter: function (e) {
        return this.pushStack(T(this, e || [], !1));
      },
      not: function (e) {
        return this.pushStack(T(this, e || [], !0));
      },
      is: function (e) {
        return !!T(
          this,
          "string" == typeof e && b.test(e) ? ce(e) : e || [],
          !1
        ).length;
      },
    });
  var k,
    S = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
  ((ce.fn.init = function (e, t, n) {
    var r, i;
    if (!e) return this;
    if (((n = n || k), "string" == typeof e)) {
      if (
        !(r =
          "<" === e[0] && ">" === e[e.length - 1] && 3 <= e.length
            ? [null, e, null]
            : S.exec(e)) ||
        (!r[1] && t)
      )
        return !t || t.jquery ? (t || n).find(e) : this.constructor(t).find(e);
      if (r[1]) {
        if (
          ((t = t instanceof ce ? t[0] : t),
          ce.merge(
            this,
            ce.parseHTML(r[1], t && t.nodeType ? t.ownerDocument || t : C, !0)
          ),
          w.test(r[1]) && ce.isPlainObject(t))
        )
          for (r in t) v(this[r]) ? this[r](t[r]) : this.attr(r, t[r]);
        return this;
      }
      return (
        (i = C.getElementById(r[2])) && ((this[0] = i), (this.length = 1)), this
      );
    }
    return e.nodeType
      ? ((this[0] = e), (this.length = 1), this)
      : v(e)
        ? void 0 !== n.ready
          ? n.ready(e)
          : e(ce)
        : ce.makeArray(e, this);
  }).prototype = ce.fn),
    (k = ce(C));
  var E = /^(?:parents|prev(?:Until|All))/,
    j = { children: !0, contents: !0, next: !0, prev: !0 };
  function A(e, t) {
    while ((e = e[t]) && 1 !== e.nodeType);
    return e;
  }
  ce.fn.extend({
    has: function (e) {
      var t = ce(e, this),
        n = t.length;
      return this.filter(function () {
        for (var e = 0; e < n; e++) if (ce.contains(this, t[e])) return !0;
      });
    },
    closest: function (e, t) {
      var n,
        r = 0,
        i = this.length,
        o = [],
        a = "string" != typeof e && ce(e);
      if (!b.test(e))
        for (; r < i; r++)
          for (n = this[r]; n && n !== t; n = n.parentNode)
            if (
              n.nodeType < 11 &&
              (a
                ? -1 < a.index(n)
                : 1 === n.nodeType && ce.find.matchesSelector(n, e))
            ) {
              o.push(n);
              break;
            }
      return this.pushStack(1 < o.length ? ce.uniqueSort(o) : o);
    },
    index: function (e) {
      return e
        ? "string" == typeof e
          ? se.call(ce(e), this[0])
          : se.call(this, e.jquery ? e[0] : e)
        : this[0] && this[0].parentNode
          ? this.first().prevAll().length
          : -1;
    },
    add: function (e, t) {
      return this.pushStack(ce.uniqueSort(ce.merge(this.get(), ce(e, t))));
    },
    addBack: function (e) {
      return this.add(null == e ? this.prevObject : this.prevObject.filter(e));
    },
  }),
    ce.each(
      {
        parent: function (e) {
          var t = e.parentNode;
          return t && 11 !== t.nodeType ? t : null;
        },
        parents: function (e) {
          return d(e, "parentNode");
        },
        parentsUntil: function (e, t, n) {
          return d(e, "parentNode", n);
        },
        next: function (e) {
          return A(e, "nextSibling");
        },
        prev: function (e) {
          return A(e, "previousSibling");
        },
        nextAll: function (e) {
          return d(e, "nextSibling");
        },
        prevAll: function (e) {
          return d(e, "previousSibling");
        },
        nextUntil: function (e, t, n) {
          return d(e, "nextSibling", n);
        },
        prevUntil: function (e, t, n) {
          return d(e, "previousSibling", n);
        },
        siblings: function (e) {
          return h((e.parentNode || {}).firstChild, e);
        },
        children: function (e) {
          return h(e.firstChild);
        },
        contents: function (e) {
          return null != e.contentDocument && r(e.contentDocument)
            ? e.contentDocument
            : (fe(e, "template") && (e = e.content || e),
              ce.merge([], e.childNodes));
        },
      },
      function (r, i) {
        ce.fn[r] = function (e, t) {
          var n = ce.map(this, i, e);
          return (
            "Until" !== r.slice(-5) && (t = e),
            t && "string" == typeof t && (n = ce.filter(t, n)),
            1 < this.length &&
              (j[r] || ce.uniqueSort(n), E.test(r) && n.reverse()),
            this.pushStack(n)
          );
        };
      }
    );
  var D = /[^\x20\t\r\n\f]+/g;
  function N(e) {
    return e;
  }
  function q(e) {
    throw e;
  }
  function L(e, t, n, r) {
    var i;
    try {
      e && v((i = e.promise))
        ? i.call(e).done(t).fail(n)
        : e && v((i = e.then))
          ? i.call(e, t, n)
          : t.apply(void 0, [e].slice(r));
    } catch (e) {
      n.apply(void 0, [e]);
    }
  }
  (ce.Callbacks = function (r) {
    var e, n;
    r =
      "string" == typeof r
        ? ((e = r),
          (n = {}),
          ce.each(e.match(D) || [], function (e, t) {
            n[t] = !0;
          }),
          n)
        : ce.extend({}, r);
    var i,
      t,
      o,
      a,
      s = [],
      u = [],
      l = -1,
      c = function () {
        for (a = a || r.once, o = i = !0; u.length; l = -1) {
          t = u.shift();
          while (++l < s.length)
            !1 === s[l].apply(t[0], t[1]) &&
              r.stopOnFalse &&
              ((l = s.length), (t = !1));
        }
        r.memory || (t = !1), (i = !1), a && (s = t ? [] : "");
      },
      f = {
        add: function () {
          return (
            s &&
              (t && !i && ((l = s.length - 1), u.push(t)),
              (function n(e) {
                ce.each(e, function (e, t) {
                  v(t)
                    ? (r.unique && f.has(t)) || s.push(t)
                    : t && t.length && "string" !== x(t) && n(t);
                });
              })(arguments),
              t && !i && c()),
            this
          );
        },
        remove: function () {
          return (
            ce.each(arguments, function (e, t) {
              var n;
              while (-1 < (n = ce.inArray(t, s, n)))
                s.splice(n, 1), n <= l && l--;
            }),
            this
          );
        },
        has: function (e) {
          return e ? -1 < ce.inArray(e, s) : 0 < s.length;
        },
        empty: function () {
          return s && (s = []), this;
        },
        disable: function () {
          return (a = u = []), (s = t = ""), this;
        },
        disabled: function () {
          return !s;
        },
        lock: function () {
          return (a = u = []), t || i || (s = t = ""), this;
        },
        locked: function () {
          return !!a;
        },
        fireWith: function (e, t) {
          return (
            a ||
              ((t = [e, (t = t || []).slice ? t.slice() : t]),
              u.push(t),
              i || c()),
            this
          );
        },
        fire: function () {
          return f.fireWith(this, arguments), this;
        },
        fired: function () {
          return !!o;
        },
      };
    return f;
  }),
    ce.extend({
      Deferred: function (e) {
        var o = [
            [
              "notify",
              "progress",
              ce.Callbacks("memory"),
              ce.Callbacks("memory"),
              2,
            ],
            [
              "resolve",
              "-- -- DONE -- --",
              ce.Callbacks("once memory"),
              ce.Callbacks("once memory"),
              0,
              "resolved",
            ],
            [
              "reject",
              "fail",
              ce.Callbacks("once memory"),
              ce.Callbacks("once memory"),
              1,
              "rejected",
            ],
          ],
          i = "pending",
          a = {
            state: function () {
              return i;
            },
            always: function () {
              return s.done(arguments).fail(arguments), this;
            },
            catch: function (e) {
              return a.then(null, e);
            },
            pipe: function () {
              var i = arguments;
              return ce
                .Deferred(function (r) {
                  ce.each(o, function (e, t) {
                    var n = v(i[t[4]]) && i[t[4]];
                    s[t[1]](function () {
                      var e = n && n.apply(this, arguments);
                      e && v(e.promise)
                        ? e
                            .promise()
                            .progress(r.notify)
                            .done(r.resolve)
                            .fail(r.reject)
                        : r[t[0] + "With"](this, n ? [e] : arguments);
                    });
                  }),
                    (i = null);
                })
                .promise();
            },
            then: function (t, n, r) {
              var u = 0;
              function l(i, o, a, s) {
                return function () {
                  var n = this,
                    r = arguments,
                    e = function () {
                      var e, t;
                      if (!(i < u)) {
                        if ((e = a.apply(n, r)) === o.promise())
                          throw new TypeError("Thenable self-resolution");
                        (t =
                          e &&
                          ("object" == typeof e || "function" == typeof e) &&
                          e.then),
                          v(t)
                            ? s
                              ? t.call(e, l(u, o, N, s), l(u, o, q, s))
                              : (u++,
                                t.call(
                                  e,
                                  l(u, o, N, s),
                                  l(u, o, q, s),
                                  l(u, o, N, o.notifyWith)
                                ))
                            : (a !== N && ((n = void 0), (r = [e])),
                              (s || o.resolveWith)(n, r));
                      }
                    },
                    t = s
                      ? e
                      : function () {
                          try {
                            e();
                          } catch (e) {
                            ce.Deferred.exceptionHook &&
                              ce.Deferred.exceptionHook(e, t.error),
                              u <= i + 1 &&
                                (a !== q && ((n = void 0), (r = [e])),
                                o.rejectWith(n, r));
                          }
                        };
                  i
                    ? t()
                    : (ce.Deferred.getErrorHook
                        ? (t.error = ce.Deferred.getErrorHook())
                        : ce.Deferred.getStackHook &&
                          (t.error = ce.Deferred.getStackHook()),
                      ie.setTimeout(t));
                };
              }
              return ce
                .Deferred(function (e) {
                  o[0][3].add(l(0, e, v(r) ? r : N, e.notifyWith)),
                    o[1][3].add(l(0, e, v(t) ? t : N)),
                    o[2][3].add(l(0, e, v(n) ? n : q));
                })
                .promise();
            },
            promise: function (e) {
              return null != e ? ce.extend(e, a) : a;
            },
          },
          s = {};
        return (
          ce.each(o, function (e, t) {
            var n = t[2],
              r = t[5];
            (a[t[1]] = n.add),
              r &&
                n.add(
                  function () {
                    i = r;
                  },
                  o[3 - e][2].disable,
                  o[3 - e][3].disable,
                  o[0][2].lock,
                  o[0][3].lock
                ),
              n.add(t[3].fire),
              (s[t[0]] = function () {
                return (
                  s[t[0] + "With"](this === s ? void 0 : this, arguments), this
                );
              }),
              (s[t[0] + "With"] = n.fireWith);
          }),
          a.promise(s),
          e && e.call(s, s),
          s
        );
      },
      when: function (e) {
        var n = arguments.length,
          t = n,
          r = Array(t),
          i = ae.call(arguments),
          o = ce.Deferred(),
          a = function (t) {
            return function (e) {
              (r[t] = this),
                (i[t] = 1 < arguments.length ? ae.call(arguments) : e),
                --n || o.resolveWith(r, i);
            };
          };
        if (
          n <= 1 &&
          (L(e, o.done(a(t)).resolve, o.reject, !n),
          "pending" === o.state() || v(i[t] && i[t].then))
        )
          return o.then();
        while (t--) L(i[t], a(t), o.reject);
        return o.promise();
      },
    });
  var H = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
  (ce.Deferred.exceptionHook = function (e, t) {
    ie.console &&
      ie.console.warn &&
      e &&
      H.test(e.name) &&
      ie.console.warn("jQuery.Deferred exception: " + e.message, e.stack, t);
  }),
    (ce.readyException = function (e) {
      ie.setTimeout(function () {
        throw e;
      });
    });
  var O = ce.Deferred();
  function P() {
    C.removeEventListener("DOMContentLoaded", P),
      ie.removeEventListener("load", P),
      ce.ready();
  }
  (ce.fn.ready = function (e) {
    return (
      O.then(e)["catch"](function (e) {
        ce.readyException(e);
      }),
      this
    );
  }),
    ce.extend({
      isReady: !1,
      readyWait: 1,
      ready: function (e) {
        (!0 === e ? --ce.readyWait : ce.isReady) ||
          ((ce.isReady = !0) !== e && 0 < --ce.readyWait) ||
          O.resolveWith(C, [ce]);
      },
    }),
    (ce.ready.then = O.then),
    "complete" === C.readyState ||
    ("loading" !== C.readyState && !C.documentElement.doScroll)
      ? ie.setTimeout(ce.ready)
      : (C.addEventListener("DOMContentLoaded", P),
        ie.addEventListener("load", P));
  var M = function (e, t, n, r, i, o, a) {
      var s = 0,
        u = e.length,
        l = null == n;
      if ("object" === x(n))
        for (s in ((i = !0), n)) M(e, t, s, n[s], !0, o, a);
      else if (
        void 0 !== r &&
        ((i = !0),
        v(r) || (a = !0),
        l &&
          (a
            ? (t.call(e, r), (t = null))
            : ((l = t),
              (t = function (e, t, n) {
                return l.call(ce(e), n);
              }))),
        t)
      )
        for (; s < u; s++) t(e[s], n, a ? r : r.call(e[s], s, t(e[s], n)));
      return i ? e : l ? t.call(e) : u ? t(e[0], n) : o;
    },
    R = /^-ms-/,
    I = /-([a-z])/g;
  function W(e, t) {
    return t.toUpperCase();
  }
  function F(e) {
    return e.replace(R, "ms-").replace(I, W);
  }
  var $ = function (e) {
    return 1 === e.nodeType || 9 === e.nodeType || !+e.nodeType;
  };
  function B() {
    this.expando = ce.expando + B.uid++;
  }
  (B.uid = 1),
    (B.prototype = {
      cache: function (e) {
        var t = e[this.expando];
        return (
          t ||
            ((t = {}),
            $(e) &&
              (e.nodeType
                ? (e[this.expando] = t)
                : Object.defineProperty(e, this.expando, {
                    value: t,
                    configurable: !0,
                  }))),
          t
        );
      },
      set: function (e, t, n) {
        var r,
          i = this.cache(e);
        if ("string" == typeof t) i[F(t)] = n;
        else for (r in t) i[F(r)] = t[r];
        return i;
      },
      get: function (e, t) {
        return void 0 === t
          ? this.cache(e)
          : e[this.expando] && e[this.expando][F(t)];
      },
      access: function (e, t, n) {
        return void 0 === t || (t && "string" == typeof t && void 0 === n)
          ? this.get(e, t)
          : (this.set(e, t, n), void 0 !== n ? n : t);
      },
      remove: function (e, t) {
        var n,
          r = e[this.expando];
        if (void 0 !== r) {
          if (void 0 !== t) {
            n = (t = Array.isArray(t)
              ? t.map(F)
              : (t = F(t)) in r
                ? [t]
                : t.match(D) || []).length;
            while (n--) delete r[t[n]];
          }
          (void 0 === t || ce.isEmptyObject(r)) &&
            (e.nodeType ? (e[this.expando] = void 0) : delete e[this.expando]);
        }
      },
      hasData: function (e) {
        var t = e[this.expando];
        return void 0 !== t && !ce.isEmptyObject(t);
      },
    });
  var _ = new B(),
    z = new B(),
    X = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    U = /[A-Z]/g;
  function V(e, t, n) {
    var r, i;
    if (void 0 === n && 1 === e.nodeType)
      if (
        ((r = "data-" + t.replace(U, "-$&").toLowerCase()),
        "string" == typeof (n = e.getAttribute(r)))
      ) {
        try {
          n =
            "true" === (i = n) ||
            ("false" !== i &&
              ("null" === i
                ? null
                : i === +i + ""
                  ? +i
                  : X.test(i)
                    ? JSON.parse(i)
                    : i));
        } catch (e) {}
        z.set(e, t, n);
      } else n = void 0;
    return n;
  }
  ce.extend({
    hasData: function (e) {
      return z.hasData(e) || _.hasData(e);
    },
    data: function (e, t, n) {
      return z.access(e, t, n);
    },
    removeData: function (e, t) {
      z.remove(e, t);
    },
    _data: function (e, t, n) {
      return _.access(e, t, n);
    },
    _removeData: function (e, t) {
      _.remove(e, t);
    },
  }),
    ce.fn.extend({
      data: function (n, e) {
        var t,
          r,
          i,
          o = this[0],
          a = o && o.attributes;
        if (void 0 === n) {
          if (
            this.length &&
            ((i = z.get(o)), 1 === o.nodeType && !_.get(o, "hasDataAttrs"))
          ) {
            t = a.length;
            while (t--)
              a[t] &&
                0 === (r = a[t].name).indexOf("data-") &&
                ((r = F(r.slice(5))), V(o, r, i[r]));
            _.set(o, "hasDataAttrs", !0);
          }
          return i;
        }
        return "object" == typeof n
          ? this.each(function () {
              z.set(this, n);
            })
          : M(
              this,
              function (e) {
                var t;
                if (o && void 0 === e)
                  return void 0 !== (t = z.get(o, n))
                    ? t
                    : void 0 !== (t = V(o, n))
                      ? t
                      : void 0;
                this.each(function () {
                  z.set(this, n, e);
                });
              },
              null,
              e,
              1 < arguments.length,
              null,
              !0
            );
      },
      removeData: function (e) {
        return this.each(function () {
          z.remove(this, e);
        });
      },
    }),
    ce.extend({
      queue: function (e, t, n) {
        var r;
        if (e)
          return (
            (t = (t || "fx") + "queue"),
            (r = _.get(e, t)),
            n &&
              (!r || Array.isArray(n)
                ? (r = _.access(e, t, ce.makeArray(n)))
                : r.push(n)),
            r || []
          );
      },
      dequeue: function (e, t) {
        t = t || "fx";
        var n = ce.queue(e, t),
          r = n.length,
          i = n.shift(),
          o = ce._queueHooks(e, t);
        "inprogress" === i && ((i = n.shift()), r--),
          i &&
            ("fx" === t && n.unshift("inprogress"),
            delete o.stop,
            i.call(
              e,
              function () {
                ce.dequeue(e, t);
              },
              o
            )),
          !r && o && o.empty.fire();
      },
      _queueHooks: function (e, t) {
        var n = t + "queueHooks";
        return (
          _.get(e, n) ||
          _.access(e, n, {
            empty: ce.Callbacks("once memory").add(function () {
              _.remove(e, [t + "queue", n]);
            }),
          })
        );
      },
    }),
    ce.fn.extend({
      queue: function (t, n) {
        var e = 2;
        return (
          "string" != typeof t && ((n = t), (t = "fx"), e--),
          arguments.length < e
            ? ce.queue(this[0], t)
            : void 0 === n
              ? this
              : this.each(function () {
                  var e = ce.queue(this, t, n);
                  ce._queueHooks(this, t),
                    "fx" === t && "inprogress" !== e[0] && ce.dequeue(this, t);
                })
        );
      },
      dequeue: function (e) {
        return this.each(function () {
          ce.dequeue(this, e);
        });
      },
      clearQueue: function (e) {
        return this.queue(e || "fx", []);
      },
      promise: function (e, t) {
        var n,
          r = 1,
          i = ce.Deferred(),
          o = this,
          a = this.length,
          s = function () {
            --r || i.resolveWith(o, [o]);
          };
        "string" != typeof e && ((t = e), (e = void 0)), (e = e || "fx");
        while (a--)
          (n = _.get(o[a], e + "queueHooks")) &&
            n.empty &&
            (r++, n.empty.add(s));
        return s(), i.promise(t);
      },
    });
  var G = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
    Y = new RegExp("^(?:([+-])=|)(" + G + ")([a-z%]*)$", "i"),
    Q = ["Top", "Right", "Bottom", "Left"],
    J = C.documentElement,
    K = function (e) {
      return ce.contains(e.ownerDocument, e);
    },
    Z = { composed: !0 };
  J.getRootNode &&
    (K = function (e) {
      return (
        ce.contains(e.ownerDocument, e) || e.getRootNode(Z) === e.ownerDocument
      );
    });
  var ee = function (e, t) {
    return (
      "none" === (e = t || e).style.display ||
      ("" === e.style.display && K(e) && "none" === ce.css(e, "display"))
    );
  };
  function te(e, t, n, r) {
    var i,
      o,
      a = 20,
      s = r
        ? function () {
            return r.cur();
          }
        : function () {
            return ce.css(e, t, "");
          },
      u = s(),
      l = (n && n[3]) || (ce.cssNumber[t] ? "" : "px"),
      c =
        e.nodeType &&
        (ce.cssNumber[t] || ("px" !== l && +u)) &&
        Y.exec(ce.css(e, t));
    if (c && c[3] !== l) {
      (u /= 2), (l = l || c[3]), (c = +u || 1);
      while (a--)
        ce.style(e, t, c + l),
          (1 - o) * (1 - (o = s() / u || 0.5)) <= 0 && (a = 0),
          (c /= o);
      (c *= 2), ce.style(e, t, c + l), (n = n || []);
    }
    return (
      n &&
        ((c = +c || +u || 0),
        (i = n[1] ? c + (n[1] + 1) * n[2] : +n[2]),
        r && ((r.unit = l), (r.start = c), (r.end = i))),
      i
    );
  }
  var ne = {};
  function re(e, t) {
    for (var n, r, i, o, a, s, u, l = [], c = 0, f = e.length; c < f; c++)
      (r = e[c]).style &&
        ((n = r.style.display),
        t
          ? ("none" === n &&
              ((l[c] = _.get(r, "display") || null),
              l[c] || (r.style.display = "")),
            "" === r.style.display &&
              ee(r) &&
              (l[c] =
                ((u = a = o = void 0),
                (a = (i = r).ownerDocument),
                (s = i.nodeName),
                (u = ne[s]) ||
                  ((o = a.body.appendChild(a.createElement(s))),
                  (u = ce.css(o, "display")),
                  o.parentNode.removeChild(o),
                  "none" === u && (u = "block"),
                  (ne[s] = u)))))
          : "none" !== n && ((l[c] = "none"), _.set(r, "display", n)));
    for (c = 0; c < f; c++) null != l[c] && (e[c].style.display = l[c]);
    return e;
  }
  ce.fn.extend({
    show: function () {
      return re(this, !0);
    },
    hide: function () {
      return re(this);
    },
    toggle: function (e) {
      return "boolean" == typeof e
        ? e
          ? this.show()
          : this.hide()
        : this.each(function () {
            ee(this) ? ce(this).show() : ce(this).hide();
          });
    },
  });
  var xe,
    be,
    we = /^(?:checkbox|radio)$/i,
    Te = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i,
    Ce = /^$|^module$|\/(?:java|ecma)script/i;
  (xe = C.createDocumentFragment().appendChild(C.createElement("div"))),
    (be = C.createElement("input")).setAttribute("type", "radio"),
    be.setAttribute("checked", "checked"),
    be.setAttribute("name", "t"),
    xe.appendChild(be),
    (le.checkClone = xe.cloneNode(!0).cloneNode(!0).lastChild.checked),
    (xe.innerHTML = "<textarea>x</textarea>"),
    (le.noCloneChecked = !!xe.cloneNode(!0).lastChild.defaultValue),
    (xe.innerHTML = "<option></option>"),
    (le.option = !!xe.lastChild);
  var ke = {
    thead: [1, "<table>", "</table>"],
    col: [2, "<table><colgroup>", "</colgroup></table>"],
    tr: [2, "<table><tbody>", "</tbody></table>"],
    td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
    _default: [0, "", ""],
  };
  function Se(e, t) {
    var n;
    return (
      (n =
        "undefined" != typeof e.getElementsByTagName
          ? e.getElementsByTagName(t || "*")
          : "undefined" != typeof e.querySelectorAll
            ? e.querySelectorAll(t || "*")
            : []),
      void 0 === t || (t && fe(e, t)) ? ce.merge([e], n) : n
    );
  }
  function Ee(e, t) {
    for (var n = 0, r = e.length; n < r; n++)
      _.set(e[n], "globalEval", !t || _.get(t[n], "globalEval"));
  }
  (ke.tbody = ke.tfoot = ke.colgroup = ke.caption = ke.thead),
    (ke.th = ke.td),
    le.option ||
      (ke.optgroup = ke.option =
        [1, "<select multiple='multiple'>", "</select>"]);
  var je = /<|&#?\w+;/;
  function Ae(e, t, n, r, i) {
    for (
      var o,
        a,
        s,
        u,
        l,
        c,
        f = t.createDocumentFragment(),
        p = [],
        d = 0,
        h = e.length;
      d < h;
      d++
    )
      if ((o = e[d]) || 0 === o)
        if ("object" === x(o)) ce.merge(p, o.nodeType ? [o] : o);
        else if (je.test(o)) {
          (a = a || f.appendChild(t.createElement("div"))),
            (s = (Te.exec(o) || ["", ""])[1].toLowerCase()),
            (u = ke[s] || ke._default),
            (a.innerHTML = u[1] + ce.htmlPrefilter(o) + u[2]),
            (c = u[0]);
          while (c--) a = a.lastChild;
          ce.merge(p, a.childNodes), ((a = f.firstChild).textContent = "");
        } else p.push(t.createTextNode(o));
    (f.textContent = ""), (d = 0);
    while ((o = p[d++]))
      if (r && -1 < ce.inArray(o, r)) i && i.push(o);
      else if (
        ((l = K(o)), (a = Se(f.appendChild(o), "script")), l && Ee(a), n)
      ) {
        c = 0;
        while ((o = a[c++])) Ce.test(o.type || "") && n.push(o);
      }
    return f;
  }
  var De = /^([^.]*)(?:\.(.+)|)/;
  function Ne() {
    return !0;
  }
  function qe() {
    return !1;
  }
  function Le(e, t, n, r, i, o) {
    var a, s;
    if ("object" == typeof t) {
      for (s in ("string" != typeof n && ((r = r || n), (n = void 0)), t))
        Le(e, s, n, r, t[s], o);
      return e;
    }
    if (
      (null == r && null == i
        ? ((i = n), (r = n = void 0))
        : null == i &&
          ("string" == typeof n
            ? ((i = r), (r = void 0))
            : ((i = r), (r = n), (n = void 0))),
      !1 === i)
    )
      i = qe;
    else if (!i) return e;
    return (
      1 === o &&
        ((a = i),
        ((i = function (e) {
          return ce().off(e), a.apply(this, arguments);
        }).guid = a.guid || (a.guid = ce.guid++))),
      e.each(function () {
        ce.event.add(this, t, i, r, n);
      })
    );
  }
  function He(e, r, t) {
    t
      ? (_.set(e, r, !1),
        ce.event.add(e, r, {
          namespace: !1,
          handler: function (e) {
            var t,
              n = _.get(this, r);
            if (1 & e.isTrigger && this[r]) {
              if (n)
                (ce.event.special[r] || {}).delegateType && e.stopPropagation();
              else if (
                ((n = ae.call(arguments)),
                _.set(this, r, n),
                this[r](),
                (t = _.get(this, r)),
                _.set(this, r, !1),
                n !== t)
              )
                return e.stopImmediatePropagation(), e.preventDefault(), t;
            } else
              n &&
                (_.set(this, r, ce.event.trigger(n[0], n.slice(1), this)),
                e.stopPropagation(),
                (e.isImmediatePropagationStopped = Ne));
          },
        }))
      : void 0 === _.get(e, r) && ce.event.add(e, r, Ne);
  }
  (ce.event = {
    global: {},
    add: function (t, e, n, r, i) {
      var o,
        a,
        s,
        u,
        l,
        c,
        f,
        p,
        d,
        h,
        g,
        v = _.get(t);
      if ($(t)) {
        n.handler && ((n = (o = n).handler), (i = o.selector)),
          i && ce.find.matchesSelector(J, i),
          n.guid || (n.guid = ce.guid++),
          (u = v.events) || (u = v.events = Object.create(null)),
          (a = v.handle) ||
            (a = v.handle =
              function (e) {
                return "undefined" != typeof ce && ce.event.triggered !== e.type
                  ? ce.event.dispatch.apply(t, arguments)
                  : void 0;
              }),
          (l = (e = (e || "").match(D) || [""]).length);
        while (l--)
          (d = g = (s = De.exec(e[l]) || [])[1]),
            (h = (s[2] || "").split(".").sort()),
            d &&
              ((f = ce.event.special[d] || {}),
              (d = (i ? f.delegateType : f.bindType) || d),
              (f = ce.event.special[d] || {}),
              (c = ce.extend(
                {
                  type: d,
                  origType: g,
                  data: r,
                  handler: n,
                  guid: n.guid,
                  selector: i,
                  needsContext: i && ce.expr.match.needsContext.test(i),
                  namespace: h.join("."),
                },
                o
              )),
              (p = u[d]) ||
                (((p = u[d] = []).delegateCount = 0),
                (f.setup && !1 !== f.setup.call(t, r, h, a)) ||
                  (t.addEventListener && t.addEventListener(d, a))),
              f.add &&
                (f.add.call(t, c), c.handler.guid || (c.handler.guid = n.guid)),
              i ? p.splice(p.delegateCount++, 0, c) : p.push(c),
              (ce.event.global[d] = !0));
      }
    },
    remove: function (e, t, n, r, i) {
      var o,
        a,
        s,
        u,
        l,
        c,
        f,
        p,
        d,
        h,
        g,
        v = _.hasData(e) && _.get(e);
      if (v && (u = v.events)) {
        l = (t = (t || "").match(D) || [""]).length;
        while (l--)
          if (
            ((d = g = (s = De.exec(t[l]) || [])[1]),
            (h = (s[2] || "").split(".").sort()),
            d)
          ) {
            (f = ce.event.special[d] || {}),
              (p = u[(d = (r ? f.delegateType : f.bindType) || d)] || []),
              (s =
                s[2] &&
                new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)")),
              (a = o = p.length);
            while (o--)
              (c = p[o]),
                (!i && g !== c.origType) ||
                  (n && n.guid !== c.guid) ||
                  (s && !s.test(c.namespace)) ||
                  (r && r !== c.selector && ("**" !== r || !c.selector)) ||
                  (p.splice(o, 1),
                  c.selector && p.delegateCount--,
                  f.remove && f.remove.call(e, c));
            a &&
              !p.length &&
              ((f.teardown && !1 !== f.teardown.call(e, h, v.handle)) ||
                ce.removeEvent(e, d, v.handle),
              delete u[d]);
          } else for (d in u) ce.event.remove(e, d + t[l], n, r, !0);
        ce.isEmptyObject(u) && _.remove(e, "handle events");
      }
    },
    dispatch: function (e) {
      var t,
        n,
        r,
        i,
        o,
        a,
        s = new Array(arguments.length),
        u = ce.event.fix(e),
        l = (_.get(this, "events") || Object.create(null))[u.type] || [],
        c = ce.event.special[u.type] || {};
      for (s[0] = u, t = 1; t < arguments.length; t++) s[t] = arguments[t];
      if (
        ((u.delegateTarget = this),
        !c.preDispatch || !1 !== c.preDispatch.call(this, u))
      ) {
        (a = ce.event.handlers.call(this, u, l)), (t = 0);
        while ((i = a[t++]) && !u.isPropagationStopped()) {
          (u.currentTarget = i.elem), (n = 0);
          while ((o = i.handlers[n++]) && !u.isImmediatePropagationStopped())
            (u.rnamespace &&
              !1 !== o.namespace &&
              !u.rnamespace.test(o.namespace)) ||
              ((u.handleObj = o),
              (u.data = o.data),
              void 0 !==
                (r = (
                  (ce.event.special[o.origType] || {}).handle || o.handler
                ).apply(i.elem, s)) &&
                !1 === (u.result = r) &&
                (u.preventDefault(), u.stopPropagation()));
        }
        return c.postDispatch && c.postDispatch.call(this, u), u.result;
      }
    },
    handlers: function (e, t) {
      var n,
        r,
        i,
        o,
        a,
        s = [],
        u = t.delegateCount,
        l = e.target;
      if (u && l.nodeType && !("click" === e.type && 1 <= e.button))
        for (; l !== this; l = l.parentNode || this)
          if (1 === l.nodeType && ("click" !== e.type || !0 !== l.disabled)) {
            for (o = [], a = {}, n = 0; n < u; n++)
              void 0 === a[(i = (r = t[n]).selector + " ")] &&
                (a[i] = r.needsContext
                  ? -1 < ce(i, this).index(l)
                  : ce.find(i, this, null, [l]).length),
                a[i] && o.push(r);
            o.length && s.push({ elem: l, handlers: o });
          }
      return (
        (l = this), u < t.length && s.push({ elem: l, handlers: t.slice(u) }), s
      );
    },
    addProp: function (t, e) {
      Object.defineProperty(ce.Event.prototype, t, {
        enumerable: !0,
        configurable: !0,
        get: v(e)
          ? function () {
              if (this.originalEvent) return e(this.originalEvent);
            }
          : function () {
              if (this.originalEvent) return this.originalEvent[t];
            },
        set: function (e) {
          Object.defineProperty(this, t, {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: e,
          });
        },
      });
    },
    fix: function (e) {
      return e[ce.expando] ? e : new ce.Event(e);
    },
    special: {
      load: { noBubble: !0 },
      click: {
        setup: function (e) {
          var t = this || e;
          return (
            we.test(t.type) && t.click && fe(t, "input") && He(t, "click", !0),
            !1
          );
        },
        trigger: function (e) {
          var t = this || e;
          return (
            we.test(t.type) && t.click && fe(t, "input") && He(t, "click"), !0
          );
        },
        _default: function (e) {
          var t = e.target;
          return (
            (we.test(t.type) &&
              t.click &&
              fe(t, "input") &&
              _.get(t, "click")) ||
            fe(t, "a")
          );
        },
      },
      beforeunload: {
        postDispatch: function (e) {
          void 0 !== e.result &&
            e.originalEvent &&
            (e.originalEvent.returnValue = e.result);
        },
      },
    },
  }),
    (ce.removeEvent = function (e, t, n) {
      e.removeEventListener && e.removeEventListener(t, n);
    }),
    (ce.Event = function (e, t) {
      if (!(this instanceof ce.Event)) return new ce.Event(e, t);
      e && e.type
        ? ((this.originalEvent = e),
          (this.type = e.type),
          (this.isDefaultPrevented =
            e.defaultPrevented ||
            (void 0 === e.defaultPrevented && !1 === e.returnValue)
              ? Ne
              : qe),
          (this.target =
            e.target && 3 === e.target.nodeType
              ? e.target.parentNode
              : e.target),
          (this.currentTarget = e.currentTarget),
          (this.relatedTarget = e.relatedTarget))
        : (this.type = e),
        t && ce.extend(this, t),
        (this.timeStamp = (e && e.timeStamp) || Date.now()),
        (this[ce.expando] = !0);
    }),
    (ce.Event.prototype = {
      constructor: ce.Event,
      isDefaultPrevented: qe,
      isPropagationStopped: qe,
      isImmediatePropagationStopped: qe,
      isSimulated: !1,
      preventDefault: function () {
        var e = this.originalEvent;
        (this.isDefaultPrevented = Ne),
          e && !this.isSimulated && e.preventDefault();
      },
      stopPropagation: function () {
        var e = this.originalEvent;
        (this.isPropagationStopped = Ne),
          e && !this.isSimulated && e.stopPropagation();
      },
      stopImmediatePropagation: function () {
        var e = this.originalEvent;
        (this.isImmediatePropagationStopped = Ne),
          e && !this.isSimulated && e.stopImmediatePropagation(),
          this.stopPropagation();
      },
    }),
    ce.each(
      {
        altKey: !0,
        bubbles: !0,
        cancelable: !0,
        changedTouches: !0,
        ctrlKey: !0,
        detail: !0,
        eventPhase: !0,
        metaKey: !0,
        pageX: !0,
        pageY: !0,
        shiftKey: !0,
        view: !0,
        char: !0,
        code: !0,
        charCode: !0,
        key: !0,
        keyCode: !0,
        button: !0,
        buttons: !0,
        clientX: !0,
        clientY: !0,
        offsetX: !0,
        offsetY: !0,
        pointerId: !0,
        pointerType: !0,
        screenX: !0,
        screenY: !0,
        targetTouches: !0,
        toElement: !0,
        touches: !0,
        which: !0,
      },
      ce.event.addProp
    ),
    ce.each({ focus: "focusin", blur: "focusout" }, function (r, i) {
      function o(e) {
        if (C.documentMode) {
          var t = _.get(this, "handle"),
            n = ce.event.fix(e);
          (n.type = "focusin" === e.type ? "focus" : "blur"),
            (n.isSimulated = !0),
            t(e),
            n.target === n.currentTarget && t(n);
        } else ce.event.simulate(i, e.target, ce.event.fix(e));
      }
      (ce.event.special[r] = {
        setup: function () {
          var e;
          if ((He(this, r, !0), !C.documentMode)) return !1;
          (e = _.get(this, i)) || this.addEventListener(i, o),
            _.set(this, i, (e || 0) + 1);
        },
        trigger: function () {
          return He(this, r), !0;
        },
        teardown: function () {
          var e;
          if (!C.documentMode) return !1;
          (e = _.get(this, i) - 1)
            ? _.set(this, i, e)
            : (this.removeEventListener(i, o), _.remove(this, i));
        },
        _default: function (e) {
          return _.get(e.target, r);
        },
        delegateType: i,
      }),
        (ce.event.special[i] = {
          setup: function () {
            var e = this.ownerDocument || this.document || this,
              t = C.documentMode ? this : e,
              n = _.get(t, i);
            n ||
              (C.documentMode
                ? this.addEventListener(i, o)
                : e.addEventListener(r, o, !0)),
              _.set(t, i, (n || 0) + 1);
          },
          teardown: function () {
            var e = this.ownerDocument || this.document || this,
              t = C.documentMode ? this : e,
              n = _.get(t, i) - 1;
            n
              ? _.set(t, i, n)
              : (C.documentMode
                  ? this.removeEventListener(i, o)
                  : e.removeEventListener(r, o, !0),
                _.remove(t, i));
          },
        });
    }),
    ce.each(
      {
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout",
      },
      function (e, i) {
        ce.event.special[e] = {
          delegateType: i,
          bindType: i,
          handle: function (e) {
            var t,
              n = e.relatedTarget,
              r = e.handleObj;
            return (
              (n && (n === this || ce.contains(this, n))) ||
                ((e.type = r.origType),
                (t = r.handler.apply(this, arguments)),
                (e.type = i)),
              t
            );
          },
        };
      }
    ),
    ce.fn.extend({
      on: function (e, t, n, r) {
        return Le(this, e, t, n, r);
      },
      one: function (e, t, n, r) {
        return Le(this, e, t, n, r, 1);
      },
      off: function (e, t, n) {
        var r, i;
        if (e && e.preventDefault && e.handleObj)
          return (
            (r = e.handleObj),
            ce(e.delegateTarget).off(
              r.namespace ? r.origType + "." + r.namespace : r.origType,
              r.selector,
              r.handler
            ),
            this
          );
        if ("object" == typeof e) {
          for (i in e) this.off(i, t, e[i]);
          return this;
        }
        return (
          (!1 !== t && "function" != typeof t) || ((n = t), (t = void 0)),
          !1 === n && (n = qe),
          this.each(function () {
            ce.event.remove(this, e, n, t);
          })
        );
      },
    });
  var Oe = /<script|<style|<link/i,
    Pe = /checked\s*(?:[^=]|=\s*.checked.)/i,
    Me = /^\s*<!\[CDATA\[|\]\]>\s*$/g;
  function Re(e, t) {
    return (
      (fe(e, "table") &&
        fe(11 !== t.nodeType ? t : t.firstChild, "tr") &&
        ce(e).children("tbody")[0]) ||
      e
    );
  }
  function Ie(e) {
    return (e.type = (null !== e.getAttribute("type")) + "/" + e.type), e;
  }
  function We(e) {
    return (
      "true/" === (e.type || "").slice(0, 5)
        ? (e.type = e.type.slice(5))
        : e.removeAttribute("type"),
      e
    );
  }
  function Fe(e, t) {
    var n, r, i, o, a, s;
    if (1 === t.nodeType) {
      if (_.hasData(e) && (s = _.get(e).events))
        for (i in (_.remove(t, "handle events"), s))
          for (n = 0, r = s[i].length; n < r; n++) ce.event.add(t, i, s[i][n]);
      z.hasData(e) && ((o = z.access(e)), (a = ce.extend({}, o)), z.set(t, a));
    }
  }
  function $e(n, r, i, o) {
    r = g(r);
    var e,
      t,
      a,
      s,
      u,
      l,
      c = 0,
      f = n.length,
      p = f - 1,
      d = r[0],
      h = v(d);
    if (h || (1 < f && "string" == typeof d && !le.checkClone && Pe.test(d)))
      return n.each(function (e) {
        var t = n.eq(e);
        h && (r[0] = d.call(this, e, t.html())), $e(t, r, i, o);
      });
    if (
      f &&
      ((t = (e = Ae(r, n[0].ownerDocument, !1, n, o)).firstChild),
      1 === e.childNodes.length && (e = t),
      t || o)
    ) {
      for (s = (a = ce.map(Se(e, "script"), Ie)).length; c < f; c++)
        (u = e),
          c !== p &&
            ((u = ce.clone(u, !0, !0)), s && ce.merge(a, Se(u, "script"))),
          i.call(n[c], u, c);
      if (s)
        for (
          l = a[a.length - 1].ownerDocument, ce.map(a, We), c = 0;
          c < s;
          c++
        )
          (u = a[c]),
            Ce.test(u.type || "") &&
              !_.access(u, "globalEval") &&
              ce.contains(l, u) &&
              (u.src && "module" !== (u.type || "").toLowerCase()
                ? ce._evalUrl &&
                  !u.noModule &&
                  ce._evalUrl(
                    u.src,
                    { nonce: u.nonce || u.getAttribute("nonce") },
                    l
                  )
                : m(u.textContent.replace(Me, ""), u, l));
    }
    return n;
  }
  function Be(e, t, n) {
    for (var r, i = t ? ce.filter(t, e) : e, o = 0; null != (r = i[o]); o++)
      n || 1 !== r.nodeType || ce.cleanData(Se(r)),
        r.parentNode &&
          (n && K(r) && Ee(Se(r, "script")), r.parentNode.removeChild(r));
    return e;
  }
  ce.extend({
    htmlPrefilter: function (e) {
      return e;
    },
    clone: function (e, t, n) {
      var r,
        i,
        o,
        a,
        s,
        u,
        l,
        c = e.cloneNode(!0),
        f = K(e);
      if (
        !(
          le.noCloneChecked ||
          (1 !== e.nodeType && 11 !== e.nodeType) ||
          ce.isXMLDoc(e)
        )
      )
        for (a = Se(c), r = 0, i = (o = Se(e)).length; r < i; r++)
          (s = o[r]),
            (u = a[r]),
            void 0,
            "input" === (l = u.nodeName.toLowerCase()) && we.test(s.type)
              ? (u.checked = s.checked)
              : ("input" !== l && "textarea" !== l) ||
                (u.defaultValue = s.defaultValue);
      if (t)
        if (n)
          for (o = o || Se(e), a = a || Se(c), r = 0, i = o.length; r < i; r++)
            Fe(o[r], a[r]);
        else Fe(e, c);
      return (
        0 < (a = Se(c, "script")).length && Ee(a, !f && Se(e, "script")), c
      );
    },
    cleanData: function (e) {
      for (var t, n, r, i = ce.event.special, o = 0; void 0 !== (n = e[o]); o++)
        if ($(n)) {
          if ((t = n[_.expando])) {
            if (t.events)
              for (r in t.events)
                i[r] ? ce.event.remove(n, r) : ce.removeEvent(n, r, t.handle);
            n[_.expando] = void 0;
          }
          n[z.expando] && (n[z.expando] = void 0);
        }
    },
  }),
    ce.fn.extend({
      detach: function (e) {
        return Be(this, e, !0);
      },
      remove: function (e) {
        return Be(this, e);
      },
      text: function (e) {
        return M(
          this,
          function (e) {
            return void 0 === e
              ? ce.text(this)
              : this.empty().each(function () {
                  (1 !== this.nodeType &&
                    11 !== this.nodeType &&
                    9 !== this.nodeType) ||
                    (this.textContent = e);
                });
          },
          null,
          e,
          arguments.length
        );
      },
      append: function () {
        return $e(this, arguments, function (e) {
          (1 !== this.nodeType &&
            11 !== this.nodeType &&
            9 !== this.nodeType) ||
            Re(this, e).appendChild(e);
        });
      },
      prepend: function () {
        return $e(this, arguments, function (e) {
          if (
            1 === this.nodeType ||
            11 === this.nodeType ||
            9 === this.nodeType
          ) {
            var t = Re(this, e);
            t.insertBefore(e, t.firstChild);
          }
        });
      },
      before: function () {
        return $e(this, arguments, function (e) {
          this.parentNode && this.parentNode.insertBefore(e, this);
        });
      },
      after: function () {
        return $e(this, arguments, function (e) {
          this.parentNode && this.parentNode.insertBefore(e, this.nextSibling);
        });
      },
      empty: function () {
        for (var e, t = 0; null != (e = this[t]); t++)
          1 === e.nodeType && (ce.cleanData(Se(e, !1)), (e.textContent = ""));
        return this;
      },
      clone: function (e, t) {
        return (
          (e = null != e && e),
          (t = null == t ? e : t),
          this.map(function () {
            return ce.clone(this, e, t);
          })
        );
      },
      html: function (e) {
        return M(
          this,
          function (e) {
            var t = this[0] || {},
              n = 0,
              r = this.length;
            if (void 0 === e && 1 === t.nodeType) return t.innerHTML;
            if (
              "string" == typeof e &&
              !Oe.test(e) &&
              !ke[(Te.exec(e) || ["", ""])[1].toLowerCase()]
            ) {
              e = ce.htmlPrefilter(e);
              try {
                for (; n < r; n++)
                  1 === (t = this[n] || {}).nodeType &&
                    (ce.cleanData(Se(t, !1)), (t.innerHTML = e));
                t = 0;
              } catch (e) {}
            }
            t && this.empty().append(e);
          },
          null,
          e,
          arguments.length
        );
      },
      replaceWith: function () {
        var n = [];
        return $e(
          this,
          arguments,
          function (e) {
            var t = this.parentNode;
            ce.inArray(this, n) < 0 &&
              (ce.cleanData(Se(this)), t && t.replaceChild(e, this));
          },
          n
        );
      },
    }),
    ce.each(
      {
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith",
      },
      function (e, a) {
        ce.fn[e] = function (e) {
          for (var t, n = [], r = ce(e), i = r.length - 1, o = 0; o <= i; o++)
            (t = o === i ? this : this.clone(!0)),
              ce(r[o])[a](t),
              s.apply(n, t.get());
          return this.pushStack(n);
        };
      }
    );
  var _e = new RegExp("^(" + G + ")(?!px)[a-z%]+$", "i"),
    ze = /^--/,
    Xe = function (e) {
      var t = e.ownerDocument.defaultView;
      return (t && t.opener) || (t = ie), t.getComputedStyle(e);
    },
    Ue = function (e, t, n) {
      var r,
        i,
        o = {};
      for (i in t) (o[i] = e.style[i]), (e.style[i] = t[i]);
      for (i in ((r = n.call(e)), t)) e.style[i] = o[i];
      return r;
    },
    Ve = new RegExp(Q.join("|"), "i");
  function Ge(e, t, n) {
    var r,
      i,
      o,
      a,
      s = ze.test(t),
      u = e.style;
    return (
      (n = n || Xe(e)) &&
        ((a = n.getPropertyValue(t) || n[t]),
        s && a && (a = a.replace(ve, "$1") || void 0),
        "" !== a || K(e) || (a = ce.style(e, t)),
        !le.pixelBoxStyles() &&
          _e.test(a) &&
          Ve.test(t) &&
          ((r = u.width),
          (i = u.minWidth),
          (o = u.maxWidth),
          (u.minWidth = u.maxWidth = u.width = a),
          (a = n.width),
          (u.width = r),
          (u.minWidth = i),
          (u.maxWidth = o))),
      void 0 !== a ? a + "" : a
    );
  }
  function Ye(e, t) {
    return {
      get: function () {
        if (!e()) return (this.get = t).apply(this, arguments);
        delete this.get;
      },
    };
  }
  !(function () {
    function e() {
      if (l) {
        (u.style.cssText =
          "position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0"),
          (l.style.cssText =
            "position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%"),
          J.appendChild(u).appendChild(l);
        var e = ie.getComputedStyle(l);
        (n = "1%" !== e.top),
          (s = 12 === t(e.marginLeft)),
          (l.style.right = "60%"),
          (o = 36 === t(e.right)),
          (r = 36 === t(e.width)),
          (l.style.position = "absolute"),
          (i = 12 === t(l.offsetWidth / 3)),
          J.removeChild(u),
          (l = null);
      }
    }
    function t(e) {
      return Math.round(parseFloat(e));
    }
    var n,
      r,
      i,
      o,
      a,
      s,
      u = C.createElement("div"),
      l = C.createElement("div");
    l.style &&
      ((l.style.backgroundClip = "content-box"),
      (l.cloneNode(!0).style.backgroundClip = ""),
      (le.clearCloneStyle = "content-box" === l.style.backgroundClip),
      ce.extend(le, {
        boxSizingReliable: function () {
          return e(), r;
        },
        pixelBoxStyles: function () {
          return e(), o;
        },
        pixelPosition: function () {
          return e(), n;
        },
        reliableMarginLeft: function () {
          return e(), s;
        },
        scrollboxSize: function () {
          return e(), i;
        },
        reliableTrDimensions: function () {
          var e, t, n, r;
          return (
            null == a &&
              ((e = C.createElement("table")),
              (t = C.createElement("tr")),
              (n = C.createElement("div")),
              (e.style.cssText =
                "position:absolute;left:-11111px;border-collapse:separate"),
              (t.style.cssText = "box-sizing:content-box;border:1px solid"),
              (t.style.height = "1px"),
              (n.style.height = "9px"),
              (n.style.display = "block"),
              J.appendChild(e).appendChild(t).appendChild(n),
              (r = ie.getComputedStyle(t)),
              (a =
                parseInt(r.height, 10) +
                  parseInt(r.borderTopWidth, 10) +
                  parseInt(r.borderBottomWidth, 10) ===
                t.offsetHeight),
              J.removeChild(e)),
            a
          );
        },
      }));
  })();
  var Qe = ["Webkit", "Moz", "ms"],
    Je = C.createElement("div").style,
    Ke = {};
  function Ze(e) {
    var t = ce.cssProps[e] || Ke[e];
    return (
      t ||
      (e in Je
        ? e
        : (Ke[e] =
            (function (e) {
              var t = e[0].toUpperCase() + e.slice(1),
                n = Qe.length;
              while (n--) if ((e = Qe[n] + t) in Je) return e;
            })(e) || e))
    );
  }
  var et = /^(none|table(?!-c[ea]).+)/,
    tt = { position: "absolute", visibility: "hidden", display: "block" },
    nt = { letterSpacing: "0", fontWeight: "400" };
  function rt(e, t, n) {
    var r = Y.exec(t);
    return r ? Math.max(0, r[2] - (n || 0)) + (r[3] || "px") : t;
  }
  function it(e, t, n, r, i, o) {
    var a = "width" === t ? 1 : 0,
      s = 0,
      u = 0,
      l = 0;
    if (n === (r ? "border" : "content")) return 0;
    for (; a < 4; a += 2)
      "margin" === n && (l += ce.css(e, n + Q[a], !0, i)),
        r
          ? ("content" === n && (u -= ce.css(e, "padding" + Q[a], !0, i)),
            "margin" !== n &&
              (u -= ce.css(e, "border" + Q[a] + "Width", !0, i)))
          : ((u += ce.css(e, "padding" + Q[a], !0, i)),
            "padding" !== n
              ? (u += ce.css(e, "border" + Q[a] + "Width", !0, i))
              : (s += ce.css(e, "border" + Q[a] + "Width", !0, i)));
    return (
      !r &&
        0 <= o &&
        (u +=
          Math.max(
            0,
            Math.ceil(
              e["offset" + t[0].toUpperCase() + t.slice(1)] - o - u - s - 0.5
            )
          ) || 0),
      u + l
    );
  }
  function ot(e, t, n) {
    var r = Xe(e),
      i =
        (!le.boxSizingReliable() || n) &&
        "border-box" === ce.css(e, "boxSizing", !1, r),
      o = i,
      a = Ge(e, t, r),
      s = "offset" + t[0].toUpperCase() + t.slice(1);
    if (_e.test(a)) {
      if (!n) return a;
      a = "auto";
    }
    return (
      ((!le.boxSizingReliable() && i) ||
        (!le.reliableTrDimensions() && fe(e, "tr")) ||
        "auto" === a ||
        (!parseFloat(a) && "inline" === ce.css(e, "display", !1, r))) &&
        e.getClientRects().length &&
        ((i = "border-box" === ce.css(e, "boxSizing", !1, r)),
        (o = s in e) && (a = e[s])),
      (a = parseFloat(a) || 0) +
        it(e, t, n || (i ? "border" : "content"), o, r, a) +
        "px"
    );
  }
  function at(e, t, n, r, i) {
    return new at.prototype.init(e, t, n, r, i);
  }
  ce.extend({
    cssHooks: {
      opacity: {
        get: function (e, t) {
          if (t) {
            var n = Ge(e, "opacity");
            return "" === n ? "1" : n;
          }
        },
      },
    },
    cssNumber: {
      animationIterationCount: !0,
      aspectRatio: !0,
      borderImageSlice: !0,
      columnCount: !0,
      flexGrow: !0,
      flexShrink: !0,
      fontWeight: !0,
      gridArea: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnStart: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowStart: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      scale: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
    },
    cssProps: {},
    style: function (e, t, n, r) {
      if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
        var i,
          o,
          a,
          s = F(t),
          u = ze.test(t),
          l = e.style;
        if (
          (u || (t = Ze(s)),
          (a = ce.cssHooks[t] || ce.cssHooks[s]),
          void 0 === n)
        )
          return a && "get" in a && void 0 !== (i = a.get(e, !1, r)) ? i : l[t];
        "string" === (o = typeof n) &&
          (i = Y.exec(n)) &&
          i[1] &&
          ((n = te(e, t, i)), (o = "number")),
          null != n &&
            n == n &&
            ("number" !== o ||
              u ||
              (n += (i && i[3]) || (ce.cssNumber[s] ? "" : "px")),
            le.clearCloneStyle ||
              "" !== n ||
              0 !== t.indexOf("background") ||
              (l[t] = "inherit"),
            (a && "set" in a && void 0 === (n = a.set(e, n, r))) ||
              (u ? l.setProperty(t, n) : (l[t] = n)));
      }
    },
    css: function (e, t, n, r) {
      var i,
        o,
        a,
        s = F(t);
      return (
        ze.test(t) || (t = Ze(s)),
        (a = ce.cssHooks[t] || ce.cssHooks[s]) &&
          "get" in a &&
          (i = a.get(e, !0, n)),
        void 0 === i && (i = Ge(e, t, r)),
        "normal" === i && t in nt && (i = nt[t]),
        "" === n || n
          ? ((o = parseFloat(i)), !0 === n || isFinite(o) ? o || 0 : i)
          : i
      );
    },
  }),
    ce.each(["height", "width"], function (e, u) {
      ce.cssHooks[u] = {
        get: function (e, t, n) {
          if (t)
            return !et.test(ce.css(e, "display")) ||
              (e.getClientRects().length && e.getBoundingClientRect().width)
              ? ot(e, u, n)
              : Ue(e, tt, function () {
                  return ot(e, u, n);
                });
        },
        set: function (e, t, n) {
          var r,
            i = Xe(e),
            o = !le.scrollboxSize() && "absolute" === i.position,
            a = (o || n) && "border-box" === ce.css(e, "boxSizing", !1, i),
            s = n ? it(e, u, n, a, i) : 0;
          return (
            a &&
              o &&
              (s -= Math.ceil(
                e["offset" + u[0].toUpperCase() + u.slice(1)] -
                  parseFloat(i[u]) -
                  it(e, u, "border", !1, i) -
                  0.5
              )),
            s &&
              (r = Y.exec(t)) &&
              "px" !== (r[3] || "px") &&
              ((e.style[u] = t), (t = ce.css(e, u))),
            rt(0, t, s)
          );
        },
      };
    }),
    (ce.cssHooks.marginLeft = Ye(le.reliableMarginLeft, function (e, t) {
      if (t)
        return (
          (parseFloat(Ge(e, "marginLeft")) ||
            e.getBoundingClientRect().left -
              Ue(e, { marginLeft: 0 }, function () {
                return e.getBoundingClientRect().left;
              })) + "px"
        );
    })),
    ce.each({ margin: "", padding: "", border: "Width" }, function (i, o) {
      (ce.cssHooks[i + o] = {
        expand: function (e) {
          for (
            var t = 0, n = {}, r = "string" == typeof e ? e.split(" ") : [e];
            t < 4;
            t++
          )
            n[i + Q[t] + o] = r[t] || r[t - 2] || r[0];
          return n;
        },
      }),
        "margin" !== i && (ce.cssHooks[i + o].set = rt);
    }),
    ce.fn.extend({
      css: function (e, t) {
        return M(
          this,
          function (e, t, n) {
            var r,
              i,
              o = {},
              a = 0;
            if (Array.isArray(t)) {
              for (r = Xe(e), i = t.length; a < i; a++)
                o[t[a]] = ce.css(e, t[a], !1, r);
              return o;
            }
            return void 0 !== n ? ce.style(e, t, n) : ce.css(e, t);
          },
          e,
          t,
          1 < arguments.length
        );
      },
    }),
    (((ce.Tween = at).prototype = {
      constructor: at,
      init: function (e, t, n, r, i, o) {
        (this.elem = e),
          (this.prop = n),
          (this.easing = i || ce.easing._default),
          (this.options = t),
          (this.start = this.now = this.cur()),
          (this.end = r),
          (this.unit = o || (ce.cssNumber[n] ? "" : "px"));
      },
      cur: function () {
        var e = at.propHooks[this.prop];
        return e && e.get ? e.get(this) : at.propHooks._default.get(this);
      },
      run: function (e) {
        var t,
          n = at.propHooks[this.prop];
        return (
          this.options.duration
            ? (this.pos = t =
                ce.easing[this.easing](
                  e,
                  this.options.duration * e,
                  0,
                  1,
                  this.options.duration
                ))
            : (this.pos = t = e),
          (this.now = (this.end - this.start) * t + this.start),
          this.options.step &&
            this.options.step.call(this.elem, this.now, this),
          n && n.set ? n.set(this) : at.propHooks._default.set(this),
          this
        );
      },
    }).init.prototype = at.prototype),
    ((at.propHooks = {
      _default: {
        get: function (e) {
          var t;
          return 1 !== e.elem.nodeType ||
            (null != e.elem[e.prop] && null == e.elem.style[e.prop])
            ? e.elem[e.prop]
            : (t = ce.css(e.elem, e.prop, "")) && "auto" !== t
              ? t
              : 0;
        },
        set: function (e) {
          ce.fx.step[e.prop]
            ? ce.fx.step[e.prop](e)
            : 1 !== e.elem.nodeType ||
                (!ce.cssHooks[e.prop] && null == e.elem.style[Ze(e.prop)])
              ? (e.elem[e.prop] = e.now)
              : ce.style(e.elem, e.prop, e.now + e.unit);
        },
      },
    }).scrollTop = at.propHooks.scrollLeft =
      {
        set: function (e) {
          e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now);
        },
      }),
    (ce.easing = {
      linear: function (e) {
        return e;
      },
      swing: function (e) {
        return 0.5 - Math.cos(e * Math.PI) / 2;
      },
      _default: "swing",
    }),
    (ce.fx = at.prototype.init),
    (ce.fx.step = {});
  var st,
    ut,
    lt,
    ct,
    ft = /^(?:toggle|show|hide)$/,
    pt = /queueHooks$/;
  function dt() {
    ut &&
      (!1 === C.hidden && ie.requestAnimationFrame
        ? ie.requestAnimationFrame(dt)
        : ie.setTimeout(dt, ce.fx.interval),
      ce.fx.tick());
  }
  function ht() {
    return (
      ie.setTimeout(function () {
        st = void 0;
      }),
      (st = Date.now())
    );
  }
  function gt(e, t) {
    var n,
      r = 0,
      i = { height: e };
    for (t = t ? 1 : 0; r < 4; r += 2 - t)
      i["margin" + (n = Q[r])] = i["padding" + n] = e;
    return t && (i.opacity = i.width = e), i;
  }
  function vt(e, t, n) {
    for (
      var r,
        i = (yt.tweeners[t] || []).concat(yt.tweeners["*"]),
        o = 0,
        a = i.length;
      o < a;
      o++
    )
      if ((r = i[o].call(n, t, e))) return r;
  }
  function yt(o, e, t) {
    var n,
      a,
      r = 0,
      i = yt.prefilters.length,
      s = ce.Deferred().always(function () {
        delete u.elem;
      }),
      u = function () {
        if (a) return !1;
        for (
          var e = st || ht(),
            t = Math.max(0, l.startTime + l.duration - e),
            n = 1 - (t / l.duration || 0),
            r = 0,
            i = l.tweens.length;
          r < i;
          r++
        )
          l.tweens[r].run(n);
        return (
          s.notifyWith(o, [l, n, t]),
          n < 1 && i
            ? t
            : (i || s.notifyWith(o, [l, 1, 0]), s.resolveWith(o, [l]), !1)
        );
      },
      l = s.promise({
        elem: o,
        props: ce.extend({}, e),
        opts: ce.extend(
          !0,
          { specialEasing: {}, easing: ce.easing._default },
          t
        ),
        originalProperties: e,
        originalOptions: t,
        startTime: st || ht(),
        duration: t.duration,
        tweens: [],
        createTween: function (e, t) {
          var n = ce.Tween(
            o,
            l.opts,
            e,
            t,
            l.opts.specialEasing[e] || l.opts.easing
          );
          return l.tweens.push(n), n;
        },
        stop: function (e) {
          var t = 0,
            n = e ? l.tweens.length : 0;
          if (a) return this;
          for (a = !0; t < n; t++) l.tweens[t].run(1);
          return (
            e
              ? (s.notifyWith(o, [l, 1, 0]), s.resolveWith(o, [l, e]))
              : s.rejectWith(o, [l, e]),
            this
          );
        },
      }),
      c = l.props;
    for (
      !(function (e, t) {
        var n, r, i, o, a;
        for (n in e)
          if (
            ((i = t[(r = F(n))]),
            (o = e[n]),
            Array.isArray(o) && ((i = o[1]), (o = e[n] = o[0])),
            n !== r && ((e[r] = o), delete e[n]),
            (a = ce.cssHooks[r]) && ("expand" in a))
          )
            for (n in ((o = a.expand(o)), delete e[r], o))
              (n in e) || ((e[n] = o[n]), (t[n] = i));
          else t[r] = i;
      })(c, l.opts.specialEasing);
      r < i;
      r++
    )
      if ((n = yt.prefilters[r].call(l, o, c, l.opts)))
        return (
          v(n.stop) &&
            (ce._queueHooks(l.elem, l.opts.queue).stop = n.stop.bind(n)),
          n
        );
    return (
      ce.map(c, vt, l),
      v(l.opts.start) && l.opts.start.call(o, l),
      l
        .progress(l.opts.progress)
        .done(l.opts.done, l.opts.complete)
        .fail(l.opts.fail)
        .always(l.opts.always),
      ce.fx.timer(ce.extend(u, { elem: o, anim: l, queue: l.opts.queue })),
      l
    );
  }
  (ce.Animation = ce.extend(yt, {
    tweeners: {
      "*": [
        function (e, t) {
          var n = this.createTween(e, t);
          return te(n.elem, e, Y.exec(t), n), n;
        },
      ],
    },
    tweener: function (e, t) {
      v(e) ? ((t = e), (e = ["*"])) : (e = e.match(D));
      for (var n, r = 0, i = e.length; r < i; r++)
        (n = e[r]),
          (yt.tweeners[n] = yt.tweeners[n] || []),
          yt.tweeners[n].unshift(t);
    },
    prefilters: [
      function (e, t, n) {
        var r,
          i,
          o,
          a,
          s,
          u,
          l,
          c,
          f = "width" in t || "height" in t,
          p = this,
          d = {},
          h = e.style,
          g = e.nodeType && ee(e),
          v = _.get(e, "fxshow");
        for (r in (n.queue ||
          (null == (a = ce._queueHooks(e, "fx")).unqueued &&
            ((a.unqueued = 0),
            (s = a.empty.fire),
            (a.empty.fire = function () {
              a.unqueued || s();
            })),
          a.unqueued++,
          p.always(function () {
            p.always(function () {
              a.unqueued--, ce.queue(e, "fx").length || a.empty.fire();
            });
          })),
        t))
          if (((i = t[r]), ft.test(i))) {
            if (
              (delete t[r],
              (o = o || "toggle" === i),
              i === (g ? "hide" : "show"))
            ) {
              if ("show" !== i || !v || void 0 === v[r]) continue;
              g = !0;
            }
            d[r] = (v && v[r]) || ce.style(e, r);
          }
        if ((u = !ce.isEmptyObject(t)) || !ce.isEmptyObject(d))
          for (r in (f &&
            1 === e.nodeType &&
            ((n.overflow = [h.overflow, h.overflowX, h.overflowY]),
            null == (l = v && v.display) && (l = _.get(e, "display")),
            "none" === (c = ce.css(e, "display")) &&
              (l
                ? (c = l)
                : (re([e], !0),
                  (l = e.style.display || l),
                  (c = ce.css(e, "display")),
                  re([e]))),
            ("inline" === c || ("inline-block" === c && null != l)) &&
              "none" === ce.css(e, "float") &&
              (u ||
                (p.done(function () {
                  h.display = l;
                }),
                null == l && ((c = h.display), (l = "none" === c ? "" : c))),
              (h.display = "inline-block"))),
          n.overflow &&
            ((h.overflow = "hidden"),
            p.always(function () {
              (h.overflow = n.overflow[0]),
                (h.overflowX = n.overflow[1]),
                (h.overflowY = n.overflow[2]);
            })),
          (u = !1),
          d))
            u ||
              (v
                ? "hidden" in v && (g = v.hidden)
                : (v = _.access(e, "fxshow", { display: l })),
              o && (v.hidden = !g),
              g && re([e], !0),
              p.done(function () {
                for (r in (g || re([e]), _.remove(e, "fxshow"), d))
                  ce.style(e, r, d[r]);
              })),
              (u = vt(g ? v[r] : 0, r, p)),
              r in v ||
                ((v[r] = u.start), g && ((u.end = u.start), (u.start = 0)));
      },
    ],
    prefilter: function (e, t) {
      t ? yt.prefilters.unshift(e) : yt.prefilters.push(e);
    },
  })),
    (ce.speed = function (e, t, n) {
      var r =
        e && "object" == typeof e
          ? ce.extend({}, e)
          : {
              complete: n || (!n && t) || (v(e) && e),
              duration: e,
              easing: (n && t) || (t && !v(t) && t),
            };
      return (
        ce.fx.off
          ? (r.duration = 0)
          : "number" != typeof r.duration &&
            (r.duration in ce.fx.speeds
              ? (r.duration = ce.fx.speeds[r.duration])
              : (r.duration = ce.fx.speeds._default)),
        (null != r.queue && !0 !== r.queue) || (r.queue = "fx"),
        (r.old = r.complete),
        (r.complete = function () {
          v(r.old) && r.old.call(this), r.queue && ce.dequeue(this, r.queue);
        }),
        r
      );
    }),
    ce.fn.extend({
      fadeTo: function (e, t, n, r) {
        return this.filter(ee)
          .css("opacity", 0)
          .show()
          .end()
          .animate({ opacity: t }, e, n, r);
      },
      animate: function (t, e, n, r) {
        var i = ce.isEmptyObject(t),
          o = ce.speed(e, n, r),
          a = function () {
            var e = yt(this, ce.extend({}, t), o);
            (i || _.get(this, "finish")) && e.stop(!0);
          };
        return (
          (a.finish = a),
          i || !1 === o.queue ? this.each(a) : this.queue(o.queue, a)
        );
      },
      stop: function (i, e, o) {
        var a = function (e) {
          var t = e.stop;
          delete e.stop, t(o);
        };
        return (
          "string" != typeof i && ((o = e), (e = i), (i = void 0)),
          e && this.queue(i || "fx", []),
          this.each(function () {
            var e = !0,
              t = null != i && i + "queueHooks",
              n = ce.timers,
              r = _.get(this);
            if (t) r[t] && r[t].stop && a(r[t]);
            else for (t in r) r[t] && r[t].stop && pt.test(t) && a(r[t]);
            for (t = n.length; t--; )
              n[t].elem !== this ||
                (null != i && n[t].queue !== i) ||
                (n[t].anim.stop(o), (e = !1), n.splice(t, 1));
            (!e && o) || ce.dequeue(this, i);
          })
        );
      },
      finish: function (a) {
        return (
          !1 !== a && (a = a || "fx"),
          this.each(function () {
            var e,
              t = _.get(this),
              n = t[a + "queue"],
              r = t[a + "queueHooks"],
              i = ce.timers,
              o = n ? n.length : 0;
            for (
              t.finish = !0,
                ce.queue(this, a, []),
                r && r.stop && r.stop.call(this, !0),
                e = i.length;
              e--;

            )
              i[e].elem === this &&
                i[e].queue === a &&
                (i[e].anim.stop(!0), i.splice(e, 1));
            for (e = 0; e < o; e++)
              n[e] && n[e].finish && n[e].finish.call(this);
            delete t.finish;
          })
        );
      },
    }),
    ce.each(["toggle", "show", "hide"], function (e, r) {
      var i = ce.fn[r];
      ce.fn[r] = function (e, t, n) {
        return null == e || "boolean" == typeof e
          ? i.apply(this, arguments)
          : this.animate(gt(r, !0), e, t, n);
      };
    }),
    ce.each(
      {
        slideDown: gt("show"),
        slideUp: gt("hide"),
        slideToggle: gt("toggle"),
        fadeIn: { opacity: "show" },
        fadeOut: { opacity: "hide" },
        fadeToggle: { opacity: "toggle" },
      },
      function (e, r) {
        ce.fn[e] = function (e, t, n) {
          return this.animate(r, e, t, n);
        };
      }
    ),
    (ce.timers = []),
    (ce.fx.tick = function () {
      var e,
        t = 0,
        n = ce.timers;
      for (st = Date.now(); t < n.length; t++)
        (e = n[t])() || n[t] !== e || n.splice(t--, 1);
      n.length || ce.fx.stop(), (st = void 0);
    }),
    (ce.fx.timer = function (e) {
      ce.timers.push(e), ce.fx.start();
    }),
    (ce.fx.interval = 13),
    (ce.fx.start = function () {
      ut || ((ut = !0), dt());
    }),
    (ce.fx.stop = function () {
      ut = null;
    }),
    (ce.fx.speeds = { slow: 600, fast: 200, _default: 400 }),
    (ce.fn.delay = function (r, e) {
      return (
        (r = (ce.fx && ce.fx.speeds[r]) || r),
        (e = e || "fx"),
        this.queue(e, function (e, t) {
          var n = ie.setTimeout(e, r);
          t.stop = function () {
            ie.clearTimeout(n);
          };
        })
      );
    }),
    (lt = C.createElement("input")),
    (ct = C.createElement("select").appendChild(C.createElement("option"))),
    (lt.type = "checkbox"),
    (le.checkOn = "" !== lt.value),
    (le.optSelected = ct.selected),
    ((lt = C.createElement("input")).value = "t"),
    (lt.type = "radio"),
    (le.radioValue = "t" === lt.value);
  var mt,
    xt = ce.expr.attrHandle;
  ce.fn.extend({
    attr: function (e, t) {
      return M(this, ce.attr, e, t, 1 < arguments.length);
    },
    removeAttr: function (e) {
      return this.each(function () {
        ce.removeAttr(this, e);
      });
    },
  }),
    ce.extend({
      attr: function (e, t, n) {
        var r,
          i,
          o = e.nodeType;
        if (3 !== o && 8 !== o && 2 !== o)
          return "undefined" == typeof e.getAttribute
            ? ce.prop(e, t, n)
            : ((1 === o && ce.isXMLDoc(e)) ||
                (i =
                  ce.attrHooks[t.toLowerCase()] ||
                  (ce.expr.match.bool.test(t) ? mt : void 0)),
              void 0 !== n
                ? null === n
                  ? void ce.removeAttr(e, t)
                  : i && "set" in i && void 0 !== (r = i.set(e, n, t))
                    ? r
                    : (e.setAttribute(t, n + ""), n)
                : i && "get" in i && null !== (r = i.get(e, t))
                  ? r
                  : null == (r = ce.find.attr(e, t))
                    ? void 0
                    : r);
      },
      attrHooks: {
        type: {
          set: function (e, t) {
            if (!le.radioValue && "radio" === t && fe(e, "input")) {
              var n = e.value;
              return e.setAttribute("type", t), n && (e.value = n), t;
            }
          },
        },
      },
      removeAttr: function (e, t) {
        var n,
          r = 0,
          i = t && t.match(D);
        if (i && 1 === e.nodeType) while ((n = i[r++])) e.removeAttribute(n);
      },
    }),
    (mt = {
      set: function (e, t, n) {
        return !1 === t ? ce.removeAttr(e, n) : e.setAttribute(n, n), n;
      },
    }),
    ce.each(ce.expr.match.bool.source.match(/\w+/g), function (e, t) {
      var a = xt[t] || ce.find.attr;
      xt[t] = function (e, t, n) {
        var r,
          i,
          o = t.toLowerCase();
        return (
          n ||
            ((i = xt[o]),
            (xt[o] = r),
            (r = null != a(e, t, n) ? o : null),
            (xt[o] = i)),
          r
        );
      };
    });
  var bt = /^(?:input|select|textarea|button)$/i,
    wt = /^(?:a|area)$/i;
  function Tt(e) {
    return (e.match(D) || []).join(" ");
  }
  function Ct(e) {
    return (e.getAttribute && e.getAttribute("class")) || "";
  }
  function kt(e) {
    return Array.isArray(e) ? e : ("string" == typeof e && e.match(D)) || [];
  }
  ce.fn.extend({
    prop: function (e, t) {
      return M(this, ce.prop, e, t, 1 < arguments.length);
    },
    removeProp: function (e) {
      return this.each(function () {
        delete this[ce.propFix[e] || e];
      });
    },
  }),
    ce.extend({
      prop: function (e, t, n) {
        var r,
          i,
          o = e.nodeType;
        if (3 !== o && 8 !== o && 2 !== o)
          return (
            (1 === o && ce.isXMLDoc(e)) ||
              ((t = ce.propFix[t] || t), (i = ce.propHooks[t])),
            void 0 !== n
              ? i && "set" in i && void 0 !== (r = i.set(e, n, t))
                ? r
                : (e[t] = n)
              : i && "get" in i && null !== (r = i.get(e, t))
                ? r
                : e[t]
          );
      },
      propHooks: {
        tabIndex: {
          get: function (e) {
            var t = ce.find.attr(e, "tabindex");
            return t
              ? parseInt(t, 10)
              : bt.test(e.nodeName) || (wt.test(e.nodeName) && e.href)
                ? 0
                : -1;
          },
        },
      },
      propFix: { for: "htmlFor", class: "className" },
    }),
    le.optSelected ||
      (ce.propHooks.selected = {
        get: function (e) {
          var t = e.parentNode;
          return t && t.parentNode && t.parentNode.selectedIndex, null;
        },
        set: function (e) {
          var t = e.parentNode;
          t && (t.selectedIndex, t.parentNode && t.parentNode.selectedIndex);
        },
      }),
    ce.each(
      [
        "tabIndex",
        "readOnly",
        "maxLength",
        "cellSpacing",
        "cellPadding",
        "rowSpan",
        "colSpan",
        "useMap",
        "frameBorder",
        "contentEditable",
      ],
      function () {
        ce.propFix[this.toLowerCase()] = this;
      }
    ),
    ce.fn.extend({
      addClass: function (t) {
        var e, n, r, i, o, a;
        return v(t)
          ? this.each(function (e) {
              ce(this).addClass(t.call(this, e, Ct(this)));
            })
          : (e = kt(t)).length
            ? this.each(function () {
                if (
                  ((r = Ct(this)),
                  (n = 1 === this.nodeType && " " + Tt(r) + " "))
                ) {
                  for (o = 0; o < e.length; o++)
                    (i = e[o]), n.indexOf(" " + i + " ") < 0 && (n += i + " ");
                  (a = Tt(n)), r !== a && this.setAttribute("class", a);
                }
              })
            : this;
      },
      removeClass: function (t) {
        var e, n, r, i, o, a;
        return v(t)
          ? this.each(function (e) {
              ce(this).removeClass(t.call(this, e, Ct(this)));
            })
          : arguments.length
            ? (e = kt(t)).length
              ? this.each(function () {
                  if (
                    ((r = Ct(this)),
                    (n = 1 === this.nodeType && " " + Tt(r) + " "))
                  ) {
                    for (o = 0; o < e.length; o++) {
                      i = e[o];
                      while (-1 < n.indexOf(" " + i + " "))
                        n = n.replace(" " + i + " ", " ");
                    }
                    (a = Tt(n)), r !== a && this.setAttribute("class", a);
                  }
                })
              : this
            : this.attr("class", "");
      },
      toggleClass: function (t, n) {
        var e,
          r,
          i,
          o,
          a = typeof t,
          s = "string" === a || Array.isArray(t);
        return v(t)
          ? this.each(function (e) {
              ce(this).toggleClass(t.call(this, e, Ct(this), n), n);
            })
          : "boolean" == typeof n && s
            ? n
              ? this.addClass(t)
              : this.removeClass(t)
            : ((e = kt(t)),
              this.each(function () {
                if (s)
                  for (o = ce(this), i = 0; i < e.length; i++)
                    (r = e[i]),
                      o.hasClass(r) ? o.removeClass(r) : o.addClass(r);
                else
                  (void 0 !== t && "boolean" !== a) ||
                    ((r = Ct(this)) && _.set(this, "__className__", r),
                    this.setAttribute &&
                      this.setAttribute(
                        "class",
                        r || !1 === t ? "" : _.get(this, "__className__") || ""
                      ));
              }));
      },
      hasClass: function (e) {
        var t,
          n,
          r = 0;
        t = " " + e + " ";
        while ((n = this[r++]))
          if (1 === n.nodeType && -1 < (" " + Tt(Ct(n)) + " ").indexOf(t))
            return !0;
        return !1;
      },
    });
  var St = /\r/g;
  ce.fn.extend({
    val: function (n) {
      var r,
        e,
        i,
        t = this[0];
      return arguments.length
        ? ((i = v(n)),
          this.each(function (e) {
            var t;
            1 === this.nodeType &&
              (null == (t = i ? n.call(this, e, ce(this).val()) : n)
                ? (t = "")
                : "number" == typeof t
                  ? (t += "")
                  : Array.isArray(t) &&
                    (t = ce.map(t, function (e) {
                      return null == e ? "" : e + "";
                    })),
              ((r =
                ce.valHooks[this.type] ||
                ce.valHooks[this.nodeName.toLowerCase()]) &&
                "set" in r &&
                void 0 !== r.set(this, t, "value")) ||
                (this.value = t));
          }))
        : t
          ? (r =
              ce.valHooks[t.type] || ce.valHooks[t.nodeName.toLowerCase()]) &&
            "get" in r &&
            void 0 !== (e = r.get(t, "value"))
            ? e
            : "string" == typeof (e = t.value)
              ? e.replace(St, "")
              : null == e
                ? ""
                : e
          : void 0;
    },
  }),
    ce.extend({
      valHooks: {
        option: {
          get: function (e) {
            var t = ce.find.attr(e, "value");
            return null != t ? t : Tt(ce.text(e));
          },
        },
        select: {
          get: function (e) {
            var t,
              n,
              r,
              i = e.options,
              o = e.selectedIndex,
              a = "select-one" === e.type,
              s = a ? null : [],
              u = a ? o + 1 : i.length;
            for (r = o < 0 ? u : a ? o : 0; r < u; r++)
              if (
                ((n = i[r]).selected || r === o) &&
                !n.disabled &&
                (!n.parentNode.disabled || !fe(n.parentNode, "optgroup"))
              ) {
                if (((t = ce(n).val()), a)) return t;
                s.push(t);
              }
            return s;
          },
          set: function (e, t) {
            var n,
              r,
              i = e.options,
              o = ce.makeArray(t),
              a = i.length;
            while (a--)
              ((r = i[a]).selected =
                -1 < ce.inArray(ce.valHooks.option.get(r), o)) && (n = !0);
            return n || (e.selectedIndex = -1), o;
          },
        },
      },
    }),
    ce.each(["radio", "checkbox"], function () {
      (ce.valHooks[this] = {
        set: function (e, t) {
          if (Array.isArray(t))
            return (e.checked = -1 < ce.inArray(ce(e).val(), t));
        },
      }),
        le.checkOn ||
          (ce.valHooks[this].get = function (e) {
            return null === e.getAttribute("value") ? "on" : e.value;
          });
    });
  var Et = ie.location,
    jt = { guid: Date.now() },
    At = /\?/;
  ce.parseXML = function (e) {
    var t, n;
    if (!e || "string" != typeof e) return null;
    try {
      t = new ie.DOMParser().parseFromString(e, "text/xml");
    } catch (e) {}
    return (
      (n = t && t.getElementsByTagName("parsererror")[0]),
      (t && !n) ||
        ce.error(
          "Invalid XML: " +
            (n
              ? ce
                  .map(n.childNodes, function (e) {
                    return e.textContent;
                  })
                  .join("\n")
              : e)
        ),
      t
    );
  };
  var Dt = /^(?:focusinfocus|focusoutblur)$/,
    Nt = function (e) {
      e.stopPropagation();
    };
  ce.extend(ce.event, {
    trigger: function (e, t, n, r) {
      var i,
        o,
        a,
        s,
        u,
        l,
        c,
        f,
        p = [n || C],
        d = ue.call(e, "type") ? e.type : e,
        h = ue.call(e, "namespace") ? e.namespace.split(".") : [];
      if (
        ((o = f = a = n = n || C),
        3 !== n.nodeType &&
          8 !== n.nodeType &&
          !Dt.test(d + ce.event.triggered) &&
          (-1 < d.indexOf(".") && ((d = (h = d.split(".")).shift()), h.sort()),
          (u = d.indexOf(":") < 0 && "on" + d),
          ((e = e[ce.expando]
            ? e
            : new ce.Event(d, "object" == typeof e && e)).isTrigger = r
            ? 2
            : 3),
          (e.namespace = h.join(".")),
          (e.rnamespace = e.namespace
            ? new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)")
            : null),
          (e.result = void 0),
          e.target || (e.target = n),
          (t = null == t ? [e] : ce.makeArray(t, [e])),
          (c = ce.event.special[d] || {}),
          r || !c.trigger || !1 !== c.trigger.apply(n, t)))
      ) {
        if (!r && !c.noBubble && !y(n)) {
          for (
            s = c.delegateType || d, Dt.test(s + d) || (o = o.parentNode);
            o;
            o = o.parentNode
          )
            p.push(o), (a = o);
          a === (n.ownerDocument || C) &&
            p.push(a.defaultView || a.parentWindow || ie);
        }
        i = 0;
        while ((o = p[i++]) && !e.isPropagationStopped())
          (f = o),
            (e.type = 1 < i ? s : c.bindType || d),
            (l =
              (_.get(o, "events") || Object.create(null))[e.type] &&
              _.get(o, "handle")) && l.apply(o, t),
            (l = u && o[u]) &&
              l.apply &&
              $(o) &&
              ((e.result = l.apply(o, t)),
              !1 === e.result && e.preventDefault());
        return (
          (e.type = d),
          r ||
            e.isDefaultPrevented() ||
            (c._default && !1 !== c._default.apply(p.pop(), t)) ||
            !$(n) ||
            (u &&
              v(n[d]) &&
              !y(n) &&
              ((a = n[u]) && (n[u] = null),
              (ce.event.triggered = d),
              e.isPropagationStopped() && f.addEventListener(d, Nt),
              n[d](),
              e.isPropagationStopped() && f.removeEventListener(d, Nt),
              (ce.event.triggered = void 0),
              a && (n[u] = a))),
          e.result
        );
      }
    },
    simulate: function (e, t, n) {
      var r = ce.extend(new ce.Event(), n, { type: e, isSimulated: !0 });
      ce.event.trigger(r, null, t);
    },
  }),
    ce.fn.extend({
      trigger: function (e, t) {
        return this.each(function () {
          ce.event.trigger(e, t, this);
        });
      },
      triggerHandler: function (e, t) {
        var n = this[0];
        if (n) return ce.event.trigger(e, t, n, !0);
      },
    });
  var qt = /\[\]$/,
    Lt = /\r?\n/g,
    Ht = /^(?:submit|button|image|reset|file)$/i,
    Ot = /^(?:input|select|textarea|keygen)/i;
  function Pt(n, e, r, i) {
    var t;
    if (Array.isArray(e))
      ce.each(e, function (e, t) {
        r || qt.test(n)
          ? i(n, t)
          : Pt(
              n + "[" + ("object" == typeof t && null != t ? e : "") + "]",
              t,
              r,
              i
            );
      });
    else if (r || "object" !== x(e)) i(n, e);
    else for (t in e) Pt(n + "[" + t + "]", e[t], r, i);
  }
  (ce.param = function (e, t) {
    var n,
      r = [],
      i = function (e, t) {
        var n = v(t) ? t() : t;
        r[r.length] =
          encodeURIComponent(e) + "=" + encodeURIComponent(null == n ? "" : n);
      };
    if (null == e) return "";
    if (Array.isArray(e) || (e.jquery && !ce.isPlainObject(e)))
      ce.each(e, function () {
        i(this.name, this.value);
      });
    else for (n in e) Pt(n, e[n], t, i);
    return r.join("&");
  }),
    ce.fn.extend({
      serialize: function () {
        return ce.param(this.serializeArray());
      },
      serializeArray: function () {
        return this.map(function () {
          var e = ce.prop(this, "elements");
          return e ? ce.makeArray(e) : this;
        })
          .filter(function () {
            var e = this.type;
            return (
              this.name &&
              !ce(this).is(":disabled") &&
              Ot.test(this.nodeName) &&
              !Ht.test(e) &&
              (this.checked || !we.test(e))
            );
          })
          .map(function (e, t) {
            var n = ce(this).val();
            return null == n
              ? null
              : Array.isArray(n)
                ? ce.map(n, function (e) {
                    return { name: t.name, value: e.replace(Lt, "\r\n") };
                  })
                : { name: t.name, value: n.replace(Lt, "\r\n") };
          })
          .get();
      },
    });
  var Mt = /%20/g,
    Rt = /#.*$/,
    It = /([?&])_=[^&]*/,
    Wt = /^(.*?):[ \t]*([^\r\n]*)$/gm,
    Ft = /^(?:GET|HEAD)$/,
    $t = /^\/\//,
    Bt = {},
    _t = {},
    zt = "*/".concat("*"),
    Xt = C.createElement("a");
  function Ut(o) {
    return function (e, t) {
      "string" != typeof e && ((t = e), (e = "*"));
      var n,
        r = 0,
        i = e.toLowerCase().match(D) || [];
      if (v(t))
        while ((n = i[r++]))
          "+" === n[0]
            ? ((n = n.slice(1) || "*"), (o[n] = o[n] || []).unshift(t))
            : (o[n] = o[n] || []).push(t);
    };
  }
  function Vt(t, i, o, a) {
    var s = {},
      u = t === _t;
    function l(e) {
      var r;
      return (
        (s[e] = !0),
        ce.each(t[e] || [], function (e, t) {
          var n = t(i, o, a);
          return "string" != typeof n || u || s[n]
            ? u
              ? !(r = n)
              : void 0
            : (i.dataTypes.unshift(n), l(n), !1);
        }),
        r
      );
    }
    return l(i.dataTypes[0]) || (!s["*"] && l("*"));
  }
  function Gt(e, t) {
    var n,
      r,
      i = ce.ajaxSettings.flatOptions || {};
    for (n in t) void 0 !== t[n] && ((i[n] ? e : r || (r = {}))[n] = t[n]);
    return r && ce.extend(!0, e, r), e;
  }
  (Xt.href = Et.href),
    ce.extend({
      active: 0,
      lastModified: {},
      etag: {},
      ajaxSettings: {
        url: Et.href,
        type: "GET",
        isLocal:
          /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(
            Et.protocol
          ),
        global: !0,
        processData: !0,
        async: !0,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        accepts: {
          "*": zt,
          text: "text/plain",
          html: "text/html",
          xml: "application/xml, text/xml",
          json: "application/json, text/javascript",
        },
        contents: { xml: /\bxml\b/, html: /\bhtml/, json: /\bjson\b/ },
        responseFields: {
          xml: "responseXML",
          text: "responseText",
          json: "responseJSON",
        },
        converters: {
          "* text": String,
          "text html": !0,
          "text json": JSON.parse,
          "text xml": ce.parseXML,
        },
        flatOptions: { url: !0, context: !0 },
      },
      ajaxSetup: function (e, t) {
        return t ? Gt(Gt(e, ce.ajaxSettings), t) : Gt(ce.ajaxSettings, e);
      },
      ajaxPrefilter: Ut(Bt),
      ajaxTransport: Ut(_t),
      ajax: function (e, t) {
        "object" == typeof e && ((t = e), (e = void 0)), (t = t || {});
        var c,
          f,
          p,
          n,
          d,
          r,
          h,
          g,
          i,
          o,
          v = ce.ajaxSetup({}, t),
          y = v.context || v,
          m = v.context && (y.nodeType || y.jquery) ? ce(y) : ce.event,
          x = ce.Deferred(),
          b = ce.Callbacks("once memory"),
          w = v.statusCode || {},
          a = {},
          s = {},
          u = "canceled",
          T = {
            readyState: 0,
            getResponseHeader: function (e) {
              var t;
              if (h) {
                if (!n) {
                  n = {};
                  while ((t = Wt.exec(p)))
                    n[t[1].toLowerCase() + " "] = (
                      n[t[1].toLowerCase() + " "] || []
                    ).concat(t[2]);
                }
                t = n[e.toLowerCase() + " "];
              }
              return null == t ? null : t.join(", ");
            },
            getAllResponseHeaders: function () {
              return h ? p : null;
            },
            setRequestHeader: function (e, t) {
              return (
                null == h &&
                  ((e = s[e.toLowerCase()] = s[e.toLowerCase()] || e),
                  (a[e] = t)),
                this
              );
            },
            overrideMimeType: function (e) {
              return null == h && (v.mimeType = e), this;
            },
            statusCode: function (e) {
              var t;
              if (e)
                if (h) T.always(e[T.status]);
                else for (t in e) w[t] = [w[t], e[t]];
              return this;
            },
            abort: function (e) {
              var t = e || u;
              return c && c.abort(t), l(0, t), this;
            },
          };
        if (
          (x.promise(T),
          (v.url = ((e || v.url || Et.href) + "").replace(
            $t,
            Et.protocol + "//"
          )),
          (v.type = t.method || t.type || v.method || v.type),
          (v.dataTypes = (v.dataType || "*").toLowerCase().match(D) || [""]),
          null == v.crossDomain)
        ) {
          r = C.createElement("a");
          try {
            (r.href = v.url),
              (r.href = r.href),
              (v.crossDomain =
                Xt.protocol + "//" + Xt.host != r.protocol + "//" + r.host);
          } catch (e) {
            v.crossDomain = !0;
          }
        }
        if (
          (v.data &&
            v.processData &&
            "string" != typeof v.data &&
            (v.data = ce.param(v.data, v.traditional)),
          Vt(Bt, v, t, T),
          h)
        )
          return T;
        for (i in ((g = ce.event && v.global) &&
          0 == ce.active++ &&
          ce.event.trigger("ajaxStart"),
        (v.type = v.type.toUpperCase()),
        (v.hasContent = !Ft.test(v.type)),
        (f = v.url.replace(Rt, "")),
        v.hasContent
          ? v.data &&
            v.processData &&
            0 ===
              (v.contentType || "").indexOf(
                "application/x-www-form-urlencoded"
              ) &&
            (v.data = v.data.replace(Mt, "+"))
          : ((o = v.url.slice(f.length)),
            v.data &&
              (v.processData || "string" == typeof v.data) &&
              ((f += (At.test(f) ? "&" : "?") + v.data), delete v.data),
            !1 === v.cache &&
              ((f = f.replace(It, "$1")),
              (o = (At.test(f) ? "&" : "?") + "_=" + jt.guid++ + o)),
            (v.url = f + o)),
        v.ifModified &&
          (ce.lastModified[f] &&
            T.setRequestHeader("If-Modified-Since", ce.lastModified[f]),
          ce.etag[f] && T.setRequestHeader("If-None-Match", ce.etag[f])),
        ((v.data && v.hasContent && !1 !== v.contentType) || t.contentType) &&
          T.setRequestHeader("Content-Type", v.contentType),
        T.setRequestHeader(
          "Accept",
          v.dataTypes[0] && v.accepts[v.dataTypes[0]]
            ? v.accepts[v.dataTypes[0]] +
                ("*" !== v.dataTypes[0] ? ", " + zt + "; q=0.01" : "")
            : v.accepts["*"]
        ),
        v.headers))
          T.setRequestHeader(i, v.headers[i]);
        if (v.beforeSend && (!1 === v.beforeSend.call(y, T, v) || h))
          return T.abort();
        if (
          ((u = "abort"),
          b.add(v.complete),
          T.done(v.success),
          T.fail(v.error),
          (c = Vt(_t, v, t, T)))
        ) {
          if (((T.readyState = 1), g && m.trigger("ajaxSend", [T, v]), h))
            return T;
          v.async &&
            0 < v.timeout &&
            (d = ie.setTimeout(function () {
              T.abort("timeout");
            }, v.timeout));
          try {
            (h = !1), c.send(a, l);
          } catch (e) {
            if (h) throw e;
            l(-1, e);
          }
        } else l(-1, "No Transport");
        function l(e, t, n, r) {
          var i,
            o,
            a,
            s,
            u,
            l = t;
          h ||
            ((h = !0),
            d && ie.clearTimeout(d),
            (c = void 0),
            (p = r || ""),
            (T.readyState = 0 < e ? 4 : 0),
            (i = (200 <= e && e < 300) || 304 === e),
            n &&
              (s = (function (e, t, n) {
                var r,
                  i,
                  o,
                  a,
                  s = e.contents,
                  u = e.dataTypes;
                while ("*" === u[0])
                  u.shift(),
                    void 0 === r &&
                      (r = e.mimeType || t.getResponseHeader("Content-Type"));
                if (r)
                  for (i in s)
                    if (s[i] && s[i].test(r)) {
                      u.unshift(i);
                      break;
                    }
                if (u[0] in n) o = u[0];
                else {
                  for (i in n) {
                    if (!u[0] || e.converters[i + " " + u[0]]) {
                      o = i;
                      break;
                    }
                    a || (a = i);
                  }
                  o = o || a;
                }
                if (o) return o !== u[0] && u.unshift(o), n[o];
              })(v, T, n)),
            !i &&
              -1 < ce.inArray("script", v.dataTypes) &&
              ce.inArray("json", v.dataTypes) < 0 &&
              (v.converters["text script"] = function () {}),
            (s = (function (e, t, n, r) {
              var i,
                o,
                a,
                s,
                u,
                l = {},
                c = e.dataTypes.slice();
              if (c[1])
                for (a in e.converters) l[a.toLowerCase()] = e.converters[a];
              o = c.shift();
              while (o)
                if (
                  (e.responseFields[o] && (n[e.responseFields[o]] = t),
                  !u && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)),
                  (u = o),
                  (o = c.shift()))
                )
                  if ("*" === o) o = u;
                  else if ("*" !== u && u !== o) {
                    if (!(a = l[u + " " + o] || l["* " + o]))
                      for (i in l)
                        if (
                          (s = i.split(" "))[1] === o &&
                          (a = l[u + " " + s[0]] || l["* " + s[0]])
                        ) {
                          !0 === a
                            ? (a = l[i])
                            : !0 !== l[i] && ((o = s[0]), c.unshift(s[1]));
                          break;
                        }
                    if (!0 !== a)
                      if (a && e["throws"]) t = a(t);
                      else
                        try {
                          t = a(t);
                        } catch (e) {
                          return {
                            state: "parsererror",
                            error: a
                              ? e
                              : "No conversion from " + u + " to " + o,
                          };
                        }
                  }
              return { state: "success", data: t };
            })(v, s, T, i)),
            i
              ? (v.ifModified &&
                  ((u = T.getResponseHeader("Last-Modified")) &&
                    (ce.lastModified[f] = u),
                  (u = T.getResponseHeader("etag")) && (ce.etag[f] = u)),
                204 === e || "HEAD" === v.type
                  ? (l = "nocontent")
                  : 304 === e
                    ? (l = "notmodified")
                    : ((l = s.state), (o = s.data), (i = !(a = s.error))))
              : ((a = l), (!e && l) || ((l = "error"), e < 0 && (e = 0))),
            (T.status = e),
            (T.statusText = (t || l) + ""),
            i ? x.resolveWith(y, [o, l, T]) : x.rejectWith(y, [T, l, a]),
            T.statusCode(w),
            (w = void 0),
            g && m.trigger(i ? "ajaxSuccess" : "ajaxError", [T, v, i ? o : a]),
            b.fireWith(y, [T, l]),
            g &&
              (m.trigger("ajaxComplete", [T, v]),
              --ce.active || ce.event.trigger("ajaxStop")));
        }
        return T;
      },
      getJSON: function (e, t, n) {
        return ce.get(e, t, n, "json");
      },
      getScript: function (e, t) {
        return ce.get(e, void 0, t, "script");
      },
    }),
    ce.each(["get", "post"], function (e, i) {
      ce[i] = function (e, t, n, r) {
        return (
          v(t) && ((r = r || n), (n = t), (t = void 0)),
          ce.ajax(
            ce.extend(
              { url: e, type: i, dataType: r, data: t, success: n },
              ce.isPlainObject(e) && e
            )
          )
        );
      };
    }),
    ce.ajaxPrefilter(function (e) {
      var t;
      for (t in e.headers)
        "content-type" === t.toLowerCase() &&
          (e.contentType = e.headers[t] || "");
    }),
    (ce._evalUrl = function (e, t, n) {
      return ce.ajax({
        url: e,
        type: "GET",
        dataType: "script",
        cache: !0,
        async: !1,
        global: !1,
        converters: { "text script": function () {} },
        dataFilter: function (e) {
          ce.globalEval(e, t, n);
        },
      });
    }),
    ce.fn.extend({
      wrapAll: function (e) {
        var t;
        return (
          this[0] &&
            (v(e) && (e = e.call(this[0])),
            (t = ce(e, this[0].ownerDocument).eq(0).clone(!0)),
            this[0].parentNode && t.insertBefore(this[0]),
            t
              .map(function () {
                var e = this;
                while (e.firstElementChild) e = e.firstElementChild;
                return e;
              })
              .append(this)),
          this
        );
      },
      wrapInner: function (n) {
        return v(n)
          ? this.each(function (e) {
              ce(this).wrapInner(n.call(this, e));
            })
          : this.each(function () {
              var e = ce(this),
                t = e.contents();
              t.length ? t.wrapAll(n) : e.append(n);
            });
      },
      wrap: function (t) {
        var n = v(t);
        return this.each(function (e) {
          ce(this).wrapAll(n ? t.call(this, e) : t);
        });
      },
      unwrap: function (e) {
        return (
          this.parent(e)
            .not("body")
            .each(function () {
              ce(this).replaceWith(this.childNodes);
            }),
          this
        );
      },
    }),
    (ce.expr.pseudos.hidden = function (e) {
      return !ce.expr.pseudos.visible(e);
    }),
    (ce.expr.pseudos.visible = function (e) {
      return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
    }),
    (ce.ajaxSettings.xhr = function () {
      try {
        return new ie.XMLHttpRequest();
      } catch (e) {}
    });
  var Yt = { 0: 200, 1223: 204 },
    Qt = ce.ajaxSettings.xhr();
  (le.cors = !!Qt && "withCredentials" in Qt),
    (le.ajax = Qt = !!Qt),
    ce.ajaxTransport(function (i) {
      var o, a;
      if (le.cors || (Qt && !i.crossDomain))
        return {
          send: function (e, t) {
            var n,
              r = i.xhr();
            if (
              (r.open(i.type, i.url, i.async, i.username, i.password),
              i.xhrFields)
            )
              for (n in i.xhrFields) r[n] = i.xhrFields[n];
            for (n in (i.mimeType &&
              r.overrideMimeType &&
              r.overrideMimeType(i.mimeType),
            i.crossDomain ||
              e["X-Requested-With"] ||
              (e["X-Requested-With"] = "XMLHttpRequest"),
            e))
              r.setRequestHeader(n, e[n]);
            (o = function (e) {
              return function () {
                o &&
                  ((o =
                    a =
                    r.onload =
                    r.onerror =
                    r.onabort =
                    r.ontimeout =
                    r.onreadystatechange =
                      null),
                  "abort" === e
                    ? r.abort()
                    : "error" === e
                      ? "number" != typeof r.status
                        ? t(0, "error")
                        : t(r.status, r.statusText)
                      : t(
                          Yt[r.status] || r.status,
                          r.statusText,
                          "text" !== (r.responseType || "text") ||
                            "string" != typeof r.responseText
                            ? { binary: r.response }
                            : { text: r.responseText },
                          r.getAllResponseHeaders()
                        ));
              };
            }),
              (r.onload = o()),
              (a = r.onerror = r.ontimeout = o("error")),
              void 0 !== r.onabort
                ? (r.onabort = a)
                : (r.onreadystatechange = function () {
                    4 === r.readyState &&
                      ie.setTimeout(function () {
                        o && a();
                      });
                  }),
              (o = o("abort"));
            try {
              r.send((i.hasContent && i.data) || null);
            } catch (e) {
              if (o) throw e;
            }
          },
          abort: function () {
            o && o();
          },
        };
    }),
    ce.ajaxPrefilter(function (e) {
      e.crossDomain && (e.contents.script = !1);
    }),
    ce.ajaxSetup({
      accepts: {
        script:
          "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
      },
      contents: { script: /\b(?:java|ecma)script\b/ },
      converters: {
        "text script": function (e) {
          return ce.globalEval(e), e;
        },
      },
    }),
    ce.ajaxPrefilter("script", function (e) {
      void 0 === e.cache && (e.cache = !1), e.crossDomain && (e.type = "GET");
    }),
    ce.ajaxTransport("script", function (n) {
      var r, i;
      if (n.crossDomain || n.scriptAttrs)
        return {
          send: function (e, t) {
            (r = ce("<script>")
              .attr(n.scriptAttrs || {})
              .prop({ charset: n.scriptCharset, src: n.url })
              .on(
                "load error",
                (i = function (e) {
                  r.remove(),
                    (i = null),
                    e && t("error" === e.type ? 404 : 200, e.type);
                })
              )),
              C.head.appendChild(r[0]);
          },
          abort: function () {
            i && i();
          },
        };
    });
  var Jt,
    Kt = [],
    Zt = /(=)\?(?=&|$)|\?\?/;
  ce.ajaxSetup({
    jsonp: "callback",
    jsonpCallback: function () {
      var e = Kt.pop() || ce.expando + "_" + jt.guid++;
      return (this[e] = !0), e;
    },
  }),
    ce.ajaxPrefilter("json jsonp", function (e, t, n) {
      var r,
        i,
        o,
        a =
          !1 !== e.jsonp &&
          (Zt.test(e.url)
            ? "url"
            : "string" == typeof e.data &&
              0 ===
                (e.contentType || "").indexOf(
                  "application/x-www-form-urlencoded"
                ) &&
              Zt.test(e.data) &&
              "data");
      if (a || "jsonp" === e.dataTypes[0])
        return (
          (r = e.jsonpCallback =
            v(e.jsonpCallback) ? e.jsonpCallback() : e.jsonpCallback),
          a
            ? (e[a] = e[a].replace(Zt, "$1" + r))
            : !1 !== e.jsonp &&
              (e.url += (At.test(e.url) ? "&" : "?") + e.jsonp + "=" + r),
          (e.converters["script json"] = function () {
            return o || ce.error(r + " was not called"), o[0];
          }),
          (e.dataTypes[0] = "json"),
          (i = ie[r]),
          (ie[r] = function () {
            o = arguments;
          }),
          n.always(function () {
            void 0 === i ? ce(ie).removeProp(r) : (ie[r] = i),
              e[r] && ((e.jsonpCallback = t.jsonpCallback), Kt.push(r)),
              o && v(i) && i(o[0]),
              (o = i = void 0);
          }),
          "script"
        );
    }),
    (le.createHTMLDocument =
      (((Jt = C.implementation.createHTMLDocument("").body).innerHTML =
        "<form></form><form></form>"),
      2 === Jt.childNodes.length)),
    (ce.parseHTML = function (e, t, n) {
      return "string" != typeof e
        ? []
        : ("boolean" == typeof t && ((n = t), (t = !1)),
          t ||
            (le.createHTMLDocument
              ? (((r = (t =
                  C.implementation.createHTMLDocument("")).createElement(
                  "base"
                )).href = C.location.href),
                t.head.appendChild(r))
              : (t = C)),
          (o = !n && []),
          (i = w.exec(e))
            ? [t.createElement(i[1])]
            : ((i = Ae([e], t, o)),
              o && o.length && ce(o).remove(),
              ce.merge([], i.childNodes)));
      var r, i, o;
    }),
    (ce.fn.load = function (e, t, n) {
      var r,
        i,
        o,
        a = this,
        s = e.indexOf(" ");
      return (
        -1 < s && ((r = Tt(e.slice(s))), (e = e.slice(0, s))),
        v(t)
          ? ((n = t), (t = void 0))
          : t && "object" == typeof t && (i = "POST"),
        0 < a.length &&
          ce
            .ajax({ url: e, type: i || "GET", dataType: "html", data: t })
            .done(function (e) {
              (o = arguments),
                a.html(r ? ce("<div>").append(ce.parseHTML(e)).find(r) : e);
            })
            .always(
              n &&
                function (e, t) {
                  a.each(function () {
                    n.apply(this, o || [e.responseText, t, e]);
                  });
                }
            ),
        this
      );
    }),
    (ce.expr.pseudos.animated = function (t) {
      return ce.grep(ce.timers, function (e) {
        return t === e.elem;
      }).length;
    }),
    (ce.offset = {
      setOffset: function (e, t, n) {
        var r,
          i,
          o,
          a,
          s,
          u,
          l = ce.css(e, "position"),
          c = ce(e),
          f = {};
        "static" === l && (e.style.position = "relative"),
          (s = c.offset()),
          (o = ce.css(e, "top")),
          (u = ce.css(e, "left")),
          ("absolute" === l || "fixed" === l) && -1 < (o + u).indexOf("auto")
            ? ((a = (r = c.position()).top), (i = r.left))
            : ((a = parseFloat(o) || 0), (i = parseFloat(u) || 0)),
          v(t) && (t = t.call(e, n, ce.extend({}, s))),
          null != t.top && (f.top = t.top - s.top + a),
          null != t.left && (f.left = t.left - s.left + i),
          "using" in t ? t.using.call(e, f) : c.css(f);
      },
    }),
    ce.fn.extend({
      offset: function (t) {
        if (arguments.length)
          return void 0 === t
            ? this
            : this.each(function (e) {
                ce.offset.setOffset(this, t, e);
              });
        var e,
          n,
          r = this[0];
        return r
          ? r.getClientRects().length
            ? ((e = r.getBoundingClientRect()),
              (n = r.ownerDocument.defaultView),
              { top: e.top + n.pageYOffset, left: e.left + n.pageXOffset })
            : { top: 0, left: 0 }
          : void 0;
      },
      position: function () {
        if (this[0]) {
          var e,
            t,
            n,
            r = this[0],
            i = { top: 0, left: 0 };
          if ("fixed" === ce.css(r, "position")) t = r.getBoundingClientRect();
          else {
            (t = this.offset()),
              (n = r.ownerDocument),
              (e = r.offsetParent || n.documentElement);
            while (
              e &&
              (e === n.body || e === n.documentElement) &&
              "static" === ce.css(e, "position")
            )
              e = e.parentNode;
            e &&
              e !== r &&
              1 === e.nodeType &&
              (((i = ce(e).offset()).top += ce.css(e, "borderTopWidth", !0)),
              (i.left += ce.css(e, "borderLeftWidth", !0)));
          }
          return {
            top: t.top - i.top - ce.css(r, "marginTop", !0),
            left: t.left - i.left - ce.css(r, "marginLeft", !0),
          };
        }
      },
      offsetParent: function () {
        return this.map(function () {
          var e = this.offsetParent;
          while (e && "static" === ce.css(e, "position")) e = e.offsetParent;
          return e || J;
        });
      },
    }),
    ce.each(
      { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" },
      function (t, i) {
        var o = "pageYOffset" === i;
        ce.fn[t] = function (e) {
          return M(
            this,
            function (e, t, n) {
              var r;
              if (
                (y(e) ? (r = e) : 9 === e.nodeType && (r = e.defaultView),
                void 0 === n)
              )
                return r ? r[i] : e[t];
              r
                ? r.scrollTo(o ? r.pageXOffset : n, o ? n : r.pageYOffset)
                : (e[t] = n);
            },
            t,
            e,
            arguments.length
          );
        };
      }
    ),
    ce.each(["top", "left"], function (e, n) {
      ce.cssHooks[n] = Ye(le.pixelPosition, function (e, t) {
        if (t)
          return (t = Ge(e, n)), _e.test(t) ? ce(e).position()[n] + "px" : t;
      });
    }),
    ce.each({ Height: "height", Width: "width" }, function (a, s) {
      ce.each(
        { padding: "inner" + a, content: s, "": "outer" + a },
        function (r, o) {
          ce.fn[o] = function (e, t) {
            var n = arguments.length && (r || "boolean" != typeof e),
              i = r || (!0 === e || !0 === t ? "margin" : "border");
            return M(
              this,
              function (e, t, n) {
                var r;
                return y(e)
                  ? 0 === o.indexOf("outer")
                    ? e["inner" + a]
                    : e.document.documentElement["client" + a]
                  : 9 === e.nodeType
                    ? ((r = e.documentElement),
                      Math.max(
                        e.body["scroll" + a],
                        r["scroll" + a],
                        e.body["offset" + a],
                        r["offset" + a],
                        r["client" + a]
                      ))
                    : void 0 === n
                      ? ce.css(e, t, i)
                      : ce.style(e, t, n, i);
              },
              s,
              n ? e : void 0,
              n
            );
          };
        }
      );
    }),
    ce.each(
      [
        "ajaxStart",
        "ajaxStop",
        "ajaxComplete",
        "ajaxError",
        "ajaxSuccess",
        "ajaxSend",
      ],
      function (e, t) {
        ce.fn[t] = function (e) {
          return this.on(t, e);
        };
      }
    ),
    ce.fn.extend({
      bind: function (e, t, n) {
        return this.on(e, null, t, n);
      },
      unbind: function (e, t) {
        return this.off(e, null, t);
      },
      delegate: function (e, t, n, r) {
        return this.on(t, e, n, r);
      },
      undelegate: function (e, t, n) {
        return 1 === arguments.length
          ? this.off(e, "**")
          : this.off(t, e || "**", n);
      },
      hover: function (e, t) {
        return this.on("mouseenter", e).on("mouseleave", t || e);
      },
    }),
    ce.each(
      "blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(
        " "
      ),
      function (e, n) {
        ce.fn[n] = function (e, t) {
          return 0 < arguments.length
            ? this.on(n, null, e, t)
            : this.trigger(n);
        };
      }
    );
  var en = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;
  (ce.proxy = function (e, t) {
    var n, r, i;
    if (("string" == typeof t && ((n = e[t]), (t = e), (e = n)), v(e)))
      return (
        (r = ae.call(arguments, 2)),
        ((i = function () {
          return e.apply(t || this, r.concat(ae.call(arguments)));
        }).guid = e.guid =
          e.guid || ce.guid++),
        i
      );
  }),
    (ce.holdReady = function (e) {
      e ? ce.readyWait++ : ce.ready(!0);
    }),
    (ce.isArray = Array.isArray),
    (ce.parseJSON = JSON.parse),
    (ce.nodeName = fe),
    (ce.isFunction = v),
    (ce.isWindow = y),
    (ce.camelCase = F),
    (ce.type = x),
    (ce.now = Date.now),
    (ce.isNumeric = function (e) {
      var t = ce.type(e);
      return ("number" === t || "string" === t) && !isNaN(e - parseFloat(e));
    }),
    (ce.trim = function (e) {
      return null == e ? "" : (e + "").replace(en, "$1");
    }),
    "function" == typeof define &&
      define.amd &&
      define("jquery", [], function () {
        return ce;
      });
  var tn = ie.jQuery,
    nn = ie.$;
  return (
    (ce.noConflict = function (e) {
      return (
        ie.$ === ce && (ie.$ = nn),
        e && ie.jQuery === ce && (ie.jQuery = tn),
        ce
      );
    }),
    "undefined" == typeof e && (ie.jQuery = ie.$ = ce),
    ce
  );
});

// jquery.dataTables.min.js
!(function (e) {
  if ("function" == typeof define && define.amd)
    define(["jquery"], function (t) {
      return e(t, window, document);
    });
  else if ("object" == typeof exports) {
    var t = require("jquery");
    module.exports =
      "undefined" == typeof window
        ? function (n, a) {
            return n || (n = window), a || (a = t(n)), e(a, n, n.document);
          }
        : e(t, window, window.document);
  } else window.DataTable = e(jQuery, window, document);
})(function (e, t, n) {
  function a(e, t) {
    t &&
      t.split(" ").forEach(function (t) {
        t && e.classList.add(t);
      });
  }
  function r(t) {
    var n,
      a,
      o = {};
    e.each(t, function (e) {
      (n = e.match(/^([^A-Z]+?)([A-Z])/)) &&
        -1 !== "a aa ai ao as b fn i m o s ".indexOf(n[1] + " ") &&
        ((a = e.replace(n[0], n[2].toLowerCase())),
        (o[a] = e),
        "o" === n[1] && r(t[e]));
    }),
      (t._hungarianMap = o);
  }
  function o(t, n, a) {
    var i;
    t._hungarianMap || r(t),
      e.each(n, function (r) {
        void 0 === (i = t._hungarianMap[r]) ||
          (!a && void 0 !== n[i]) ||
          ("o" === i.charAt(0)
            ? (n[i] || (n[i] = {}), e.extend(!0, n[i], n[r]), o(t[i], n[i], a))
            : (n[i] = n[r]));
      });
  }
  function i(e) {
    Je(e, "ordering", "bSort"),
      Je(e, "orderMulti", "bSortMulti"),
      Je(e, "orderClasses", "bSortClasses"),
      Je(e, "orderCellsTop", "bSortCellsTop"),
      Je(e, "order", "aaSorting"),
      Je(e, "orderFixed", "aaSortingFixed"),
      Je(e, "paging", "bPaginate"),
      Je(e, "pagingType", "sPaginationType"),
      Je(e, "pageLength", "iDisplayLength"),
      Je(e, "searching", "bFilter"),
      "boolean" == typeof e.sScrollX && (e.sScrollX = e.sScrollX ? "100%" : ""),
      "boolean" == typeof e.scrollX && (e.scrollX = e.scrollX ? "100%" : "");
    var t = e.aoSearchCols;
    if (t)
      for (var n = 0, a = t.length; n < a; n++)
        t[n] && o(Ce.models.oSearch, t[n]);
    e.serverSide && !e.searchDelay && (e.searchDelay = 400);
  }
  function l(e) {
    Je(e, "orderable", "bSortable"),
      Je(e, "orderData", "aDataSort"),
      Je(e, "orderSequence", "asSorting"),
      Je(e, "orderDataType", "sortDataType");
    var t = e.aDataSort;
    "number" != typeof t || Array.isArray(t) || (e.aDataSort = [t]);
  }
  function s(t) {
    var n = Ce.defaults.column,
      a = t.aoColumns.length;
    (n = e.extend({}, Ce.models.oColumn, n, {
      aDataSort: n.aDataSort ? n.aDataSort : [a],
      mData: n.mData ? n.mData : a,
      idx: a,
      searchFixed: {},
      colEl: e("<col>"),
    })),
      t.aoColumns.push(n),
      ((t = t.aoPreSearchCols)[a] = e.extend({}, Ce.models.oSearch, t[a]));
  }
  function u(n, a, r) {
    var i = n.aoColumns[a];
    null != r &&
      (l(r),
      o(Ce.defaults.column, r, !0),
      void 0 === r.mDataProp || r.mData || (r.mData = r.mDataProp),
      r.sType && (i._sManualType = r.sType),
      r.className && !r.sClass && (r.sClass = r.className),
      (a = i.sClass),
      e.extend(i, r),
      de(i, r, "sWidth", "sWidthOrig"),
      a !== i.sClass && (i.sClass = a + " " + i.sClass),
      void 0 !== r.iDataSort && (i.aDataSort = [r.iDataSort]),
      de(i, r, "aDataSort"));
    var s = i.mData,
      u = Ke(s);
    i.mRender &&
      Array.isArray(i.mRender) &&
      ((a = (r = i.mRender.slice()).shift()),
      (i.mRender = Ce.render[a].apply(t, r))),
      (i._render = i.mRender ? Ke(i.mRender) : null),
      (r = function (e) {
        return "string" == typeof e && -1 !== e.indexOf("@");
      }),
      (i._bAttrSrc =
        e.isPlainObject(s) && (r(s.sort) || r(s.type) || r(s.filter))),
      (i._setter = null),
      (i.fnGetData = function (e, t, n) {
        var a = u(e, t, void 0, n);
        return i._render && t ? i._render(a, t, e, n) : a;
      }),
      (i.fnSetData = function (e, t, n) {
        return et(s)(e, t, n);
      }),
      "number" == typeof s || i._isArrayHost || (n._rowReadObject = !0),
      n.oFeatures.bSort || (i.bSortable = !1);
  }
  function c(a) {
    !(function (a) {
      if (a.oFeatures.bAutoWidth) {
        var r = a.nTable,
          o = a.aoColumns,
          i = a.oScroll,
          l = i.sY,
          s = i.sX,
          u = i.sXInner;
        i = p(a, "bVisible");
        var d,
          f = r.getAttribute("width"),
          h = r.parentNode;
        (d = r.style.width) && -1 !== d.indexOf("%") && (f = d),
          ge(a, null, "column-calc", { visible: i }, !1);
        var g = e(r.cloneNode()).css("visibility", "hidden").removeAttr("id");
        g.append("<tbody>");
        var v = e("<tr/>").appendTo(g.find("tbody"));
        for (
          g.append(e(a.nTHead).clone()).append(e(a.nTFoot).clone()),
            g.find("tfoot th, tfoot td").css("width", ""),
            g.find("thead th, thead td").each(function () {
              var t = b(a, this, !0, !1);
              t
                ? ((this.style.width = t),
                  s &&
                    e(this).append(
                      e("<div/>").css({
                        width: t,
                        margin: 0,
                        padding: 0,
                        border: 0,
                        height: 1,
                      })
                    ))
                : (this.style.width = "");
            }),
            d = 0;
          d < i.length;
          d++
        ) {
          var m = i[d],
            y = o[m],
            D = Q(a, m);
          m = Ie.type.className[y.sType];
          var x = D + y.sContentPadding;
          (D = -1 === D.indexOf("<") ? n.createTextNode(x) : x),
            e("<td/>").addClass(m).addClass(y.sClass).append(D).appendTo(v);
        }
        for (
          e("[name]", g).removeAttr("name"),
            y = e("<div/>")
              .css(
                s || l
                  ? {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: 1,
                      right: 0,
                      overflow: "hidden",
                    }
                  : {}
              )
              .append(g)
              .appendTo(h),
            s && u
              ? g.width(u)
              : s
                ? (g.css("width", "auto"),
                  g.removeAttr("width"),
                  g.width() < h.clientWidth && f && g.width(h.clientWidth))
                : l
                  ? g.width(h.clientWidth)
                  : f && g.width(f),
            l = 0,
            u = g.find("tbody tr").eq(0).children(),
            d = 0;
          d < i.length;
          d++
        )
          (h = u[d].getBoundingClientRect().width),
            (l += h),
            (o[i[d]].sWidth = K(h));
        (r.style.width = K(l)),
          y.remove(),
          f && (r.style.width = K(f)),
          (!f && !s) ||
            a._reszEvt ||
            (e(t).on(
              "resize.DT-" + a.sInstance,
              Ce.util.throttle(function () {
                a.bDestroying || c(a);
              })
            ),
            (a._reszEvt = !0));
      }
    })(a);
    for (var r = a.aoColumns, o = 0; o < r.length; o++) {
      var i = b(a, [o], !1, !1);
      r[o].colEl.css("width", i);
    }
    ("" === (r = a.oScroll).sY && "" === r.sX) || Z(a),
      ge(a, null, "column-sizing", [a]);
  }
  function d(e, t) {
    var n = p(e, "bVisible");
    return "number" == typeof n[t] ? n[t] : null;
  }
  function f(e, t) {
    var n = p(e, "bVisible").indexOf(t);
    return -1 !== n ? n : null;
  }
  function h(t) {
    var n = t.aoHeader;
    t = t.aoColumns;
    var a = 0;
    if (n.length)
      for (var r = 0, o = n[0].length; r < o; r++)
        t[r].bVisible && "none" !== e(n[0][r].cell).css("display") && a++;
    return a;
  }
  function p(e, t) {
    var n = [];
    return (
      e.aoColumns.map(function (e, a) {
        e[t] && n.push(a);
      }),
      n
    );
  }
  function g(e) {
    var t,
      n,
      a,
      r = e.aoColumns,
      o = e.aoData,
      i = Ce.ext.type.detect,
      l = 0;
    for (t = r.length; l < t; l++) {
      var s = r[l],
        u = [];
      if (!s.sType && s._sManualType) s.sType = s._sManualType;
      else if (!s.sType) {
        var c = 0;
        for (n = i.length; c < n; c++) {
          var d = 0;
          for (a = o.length; d < a; d++)
            if (o[d]) {
              void 0 === u[d] && (u[d] = x(e, d, l, "type"));
              var f = i[c](u[d], e);
              if (!f && c !== i.length - 2) break;
              if ("html" === f && !ke(u[d])) break;
            }
          if (f) {
            s.sType = f;
            break;
          }
        }
        s.sType || (s.sType = "string");
      }
      if (
        ((c = Ie.type.className[s.sType]) &&
          (v(e.aoHeader, l, c), v(e.aoFooter, l, c)),
        (c = Ie.type.render[s.sType]) && !s._render)
      )
        for (
          s._render = Ce.util.get(c), c = l, n = (s = e).aoData, d = 0;
          d < n.length;
          d++
        )
          n[d].nTr &&
            ((a = x(s, d, c, "display")),
            (n[d].displayData[c] = a),
            S(n[d].anCells[c], a));
    }
  }
  function v(e, t, n) {
    e.forEach(function (e) {
      e[t].unique && a(e[t].cell, n);
    });
  }
  function b(e, t, n, a) {
    Array.isArray(t) || (t = m(t));
    var r = 0;
    e = e.aoColumns;
    for (var o = 0, i = t.length; o < i; o++) {
      var l = e[t[o]],
        s = n ? l.sWidthOrig : l.sWidth;
      if (a || !1 !== l.bVisible) {
        if (null == s) return null;
        if ("number" == typeof s) {
          var u = "px";
          r += s;
        } else
          (l = s.match(/([\d\.]+)([^\d]*)/)) &&
            ((r += 1 * l[1]), (u = 3 === l.length ? l[2] : "px"));
      }
    }
    return r + u;
  }
  function m(t) {
    return (t = e(t).closest("[data-dt-column]").attr("data-dt-column"))
      ? t.split(",").map(function (e) {
          return 1 * e;
        })
      : [];
  }
  function y(t, n, a, r) {
    var o = t.aoData.length,
      i = e.extend(!0, {}, Ce.models.oRow, { src: a ? "dom" : "data", idx: o });
    (i._aData = n), t.aoData.push(i);
    for (var l = t.aoColumns, s = 0, u = l.length; s < u; s++)
      l[s].sType = null;
    return (
      t.aiDisplayMaster.push(o),
      void 0 !== (n = t.rowIdFn(n)) && (t.aIds[n] = i),
      (!a && t.oFeatures.bDeferRender) || A(t, o, a, r),
      o
    );
  }
  function D(t, n) {
    var a;
    return (
      n instanceof e || (n = e(n)),
      n.map(function (e, n) {
        return (a = C(t, n)), y(t, a.data, n, a.cells);
      })
    );
  }
  function x(e, t, n, a) {
    "search" === a ? (a = "filter") : "order" === a && (a = "sort");
    var r = e.iDraw,
      o = e.aoColumns[n],
      i = e.aoData[t]._aData,
      l = o.sDefaultContent,
      s = o.fnGetData(i, a, { settings: e, row: t, col: n });
    if (
      ("display" !== a &&
        s &&
        "object" == typeof s &&
        s.nodeName &&
        (s = s.innerHTML),
      void 0 === s)
    )
      return (
        e.iDrawError != r &&
          null === l &&
          (ce(
            e,
            0,
            "Requested unknown parameter " +
              ("function" == typeof o.mData
                ? "{function}"
                : "'" + o.mData + "'") +
              " for row " +
              t +
              ", column " +
              n,
            4
          ),
          (e.iDrawError = r)),
        l
      );
    if ((s !== i && null !== s) || null === l || void 0 === a) {
      if ("function" == typeof s) return s.call(i);
    } else s = l;
    return null === s && "display" === a
      ? ""
      : ("filter" === a &&
          (e = Ce.ext.type.search)[o.sType] &&
          (s = e[o.sType](s)),
        s);
  }
  function S(t, n) {
    n && "object" == typeof n && n.nodeName
      ? e(t).empty().append(n)
      : (t.innerHTML = n);
  }
  function w(e) {
    return (e.match(/(\\.|[^.])+/g) || [""]).map(function (e) {
      return e.replace(/\\\./g, ".");
    });
  }
  function T(e) {
    (e.aoData.length = 0),
      (e.aiDisplayMaster.length = 0),
      (e.aiDisplay.length = 0),
      (e.aIds = {});
  }
  function _(e, t, n, a) {
    var r = e.aoData[t];
    if (
      ((r._aSortData = null),
      (r._aFilterData = null),
      (r.displayData = null),
      "dom" !== n && ((n && "auto" !== n) || "dom" !== r.src))
    ) {
      var o = r.anCells,
        i = I(e, t);
      if (o)
        if (void 0 !== a) S(o[a], i[a]);
        else for (t = 0, n = o.length; t < n; t++) S(o[t], i[t]);
    } else r._aData = C(e, r, a, void 0 === a ? void 0 : r._aData).data;
    if (((o = e.aoColumns), void 0 !== a))
      (o[a].sType = null), (o[a].maxLenString = null);
    else {
      for (t = 0, n = o.length; t < n; t++)
        (o[t].sType = null), (o[t].maxLenString = null);
      F(e, r);
    }
  }
  function C(e, t, n, a) {
    var r,
      o,
      i = [],
      l = t.firstChild,
      s = 0,
      u = e.aoColumns,
      c = e._rowReadObject;
    a = void 0 !== a ? a : c ? {} : [];
    var d = function (e, t) {
        if ("string" == typeof e) {
          var n = e.indexOf("@");
          -1 !== n && ((n = e.substring(n + 1)), et(e)(a, t.getAttribute(n)));
        }
      },
      f = function (e) {
        (void 0 !== n && n !== s) ||
          ((r = u[s]),
          (o = e.innerHTML.trim()),
          r && r._bAttrSrc
            ? (et(r.mData._)(a, o),
              d(r.mData.sort, e),
              d(r.mData.type, e),
              d(r.mData.filter, e))
            : c
              ? (r._setter || (r._setter = et(r.mData)), r._setter(a, o))
              : (a[s] = o)),
          s++;
      };
    if (l)
      for (; l; ) {
        var h = l.nodeName.toUpperCase();
        ("TD" != h && "TH" != h) || (f(l), i.push(l)), (l = l.nextSibling);
      }
    else for (l = 0, h = (i = t.anCells).length; l < h; l++) f(i[l]);
    return (
      (t = t.firstChild ? t : t.nTr) &&
        (t = t.getAttribute("id")) &&
        et(e.rowId)(a, t),
      { data: a, cells: i }
    );
  }
  function I(e, t) {
    var n = e.aoData[t],
      a = e.aoColumns;
    if (!n.displayData) {
      n.displayData = [];
      var r = 0;
      for (a = a.length; r < a; r++) n.displayData.push(x(e, t, r, "display"));
    }
    return n.displayData;
  }
  function A(t, r, o, i) {
    var l,
      s,
      u = t.aoData[r],
      c = u._aData,
      d = [],
      f = t.oClasses.tbody.row;
    if (null === u.nTr) {
      var h = o || n.createElement("tr");
      (u.nTr = h), (u.anCells = d), a(h, f), (h._DT_RowIndex = r), F(t, u);
      var p = 0;
      for (l = t.aoColumns.length; p < l; p++) {
        (f = t.aoColumns[p]),
          (u = (s = !o) ? n.createElement(f.sCellType) : i[p]) ||
            ce(t, 0, "Incorrect column count", 18),
          (u._DT_CellIndex = { row: r, column: p }),
          d.push(u);
        var g = I(t, r);
        (!s &&
          ((!f.mRender && f.mData === p) ||
            (e.isPlainObject(f.mData) && f.mData._ === p + ".display"))) ||
          S(u, g[p]),
          f.bVisible && !o
            ? h.appendChild(u)
            : !f.bVisible && o && u.parentNode.removeChild(u),
          f.fnCreatedCell &&
            f.fnCreatedCell.call(t.oInstance, u, x(t, r, p), c, r, p);
      }
      ge(t, "aoRowCreatedCallback", "row-created", [h, c, r, d]);
    } else a(u.nTr, f);
  }
  function F(t, n) {
    var a = n.nTr,
      r = n._aData;
    if (a) {
      var o = t.rowIdFn(r);
      o && (a.id = o),
        r.DT_RowClass &&
          ((o = r.DT_RowClass.split(" ")),
          (n.__rowc = n.__rowc ? Ye(n.__rowc.concat(o)) : o),
          e(a).removeClass(n.__rowc.join(" ")).addClass(r.DT_RowClass)),
        r.DT_RowAttr && e(a).attr(r.DT_RowAttr),
        r.DT_RowData && e(a).data(r.DT_RowData);
    }
  }
  function L(t, n) {
    var a,
      r = t.oClasses,
      o = t.aoColumns,
      i = "header" === n ? t.nTHead : t.nTFoot,
      l = "header" === n ? "sTitle" : n;
    if (i) {
      if (
        0 === e("th, td", i).length &&
        ("header" === n || Xe(t.aoColumns, l).join(""))
      ) {
        var s = e("<tr/>").appendTo(i),
          u = 0;
        for (a = o.length; u < a; u++)
          e("<th/>")
            .html(o[u][l] || "")
            .appendTo(s);
      }
      (o = H(t, i, !0)),
        "header" === n ? (t.aoHeader = o) : (t.aoFooter = o),
        e(i).children("tr").attr("role", "row"),
        e(i)
          .children("tr")
          .children("th, td")
          .each(function () {
            be(t, n)(t, e(this), r);
          });
    }
  }
  function j(t, n, a) {
    var r,
      o,
      i = [],
      l = [],
      s = t.aoColumns;
    if (((t = s.length), n)) {
      for (
        a ||
          (a = qe(t).filter(function (e) {
            return s[e].bVisible;
          })),
          t = 0;
        t < n.length;
        t++
      )
        (i[t] = n[t].slice().filter(function (e, t) {
          return a.includes(t);
        })),
          l.push([]);
      for (t = 0; t < i.length; t++)
        for (n = 0; n < i[t].length; n++) {
          var u = (o = 1);
          if (void 0 === l[t][n]) {
            for (
              r = i[t][n].cell;
              void 0 !== i[t + o] && i[t][n].cell == i[t + o][n].cell;

            )
              (l[t + o][n] = null), o++;
            for (
              ;
              void 0 !== i[t][n + u] && i[t][n].cell == i[t][n + u].cell;

            ) {
              for (var c = 0; c < o; c++) l[t + c][n + u] = null;
              u++;
            }
            l[t][n] = {
              cell: r,
              colspan: u,
              rowspan: o,
              title: e("span.dt-column-title", r).html(),
            };
          }
        }
      return l;
    }
  }
  function N(t, n) {
    for (var a, r, o = j(t, n), i = 0; i < n.length; i++) {
      if ((a = n[i].row)) for (; (r = a.firstChild); ) a.removeChild(r);
      for (r = 0; r < o[i].length; r++) {
        var l = o[i][r];
        l &&
          e(l.cell)
            .appendTo(a)
            .attr("rowspan", l.rowspan)
            .attr("colspan", l.colspan);
      }
    }
  }
  function P(t, n) {
    var r = "ssp" == me(t),
      o = t.iInitDisplayStart;
    if (
      (void 0 !== o &&
        -1 !== o &&
        ((t._iDisplayStart = r ? o : o >= t.fnRecordsDisplay() ? 0 : o),
        (t.iInitDisplayStart = -1)),
      -1 !== ge(t, "aoPreDrawCallback", "preDraw", [t]).indexOf(!1))
    )
      G(t, !1);
    else {
      (r = []), (o = 0);
      var i = "ssp" == me(t),
        l = t.aiDisplay,
        s = t._iDisplayStart,
        u = t.fnDisplayEnd(),
        c = t.aoColumns,
        d = e(t.nTBody);
      if (((t.bDrawing = !0), i)) {
        if (!t.bDestroying && !n)
          return (
            0 === t.iDraw && d.empty().append(O(t)),
            void (function (e) {
              e.iDraw++,
                G(e, !0),
                W(
                  e,
                  (function (e) {
                    var t = e.aoColumns,
                      n = e.oFeatures,
                      a = e.oPreviousSearch,
                      r = e.aoPreSearchCols,
                      o = function (e, n) {
                        return "function" == typeof t[e][n]
                          ? "function"
                          : t[e][n];
                      };
                    return {
                      draw: e.iDraw,
                      columns: t.map(function (e, t) {
                        return {
                          data: o(t, "mData"),
                          name: e.sName,
                          searchable: e.bSearchable,
                          orderable: e.bSortable,
                          search: {
                            value: r[t].search,
                            regex: r[t].regex,
                            fixed: Object.keys(e.searchFixed).map(function (t) {
                              return {
                                name: t,
                                term: e.searchFixed[t].toString(),
                              };
                            }),
                          },
                        };
                      }),
                      order: ae(e).map(function (e) {
                        return {
                          column: e.col,
                          dir: e.dir,
                          name: o(e.col, "sName"),
                        };
                      }),
                      start: e._iDisplayStart,
                      length: n.bPaginate ? e._iDisplayLength : -1,
                      search: {
                        value: a.search,
                        regex: a.regex,
                        fixed: Object.keys(e.searchFixed).map(function (t) {
                          return { name: t, term: e.searchFixed[t].toString() };
                        }),
                      },
                    };
                  })(e),
                  function (t) {
                    e: {
                      var n = X(e, t),
                        a = V(e, "draw", t),
                        r = V(e, "recordsTotal", t);
                      if (((t = V(e, "recordsFiltered", t)), void 0 !== a)) {
                        if (1 * a < e.iDraw) break e;
                        e.iDraw = 1 * a;
                      }
                      for (
                        n || (n = []),
                          T(e),
                          e._iRecordsTotal = parseInt(r, 10),
                          e._iRecordsDisplay = parseInt(t, 10),
                          a = 0,
                          r = n.length;
                        a < r;
                        a++
                      )
                        y(e, n[a]);
                      (e.aiDisplay = e.aiDisplayMaster.slice()),
                        P(e, !0),
                        $(e),
                        G(e, !1);
                    }
                  }
                );
            })(t)
          );
      } else t.iDraw++;
      if (0 !== l.length) {
        var f = i ? t.aoData.length : u;
        for (i = i ? 0 : s; i < f; i++) {
          var h = l[i],
            p = t.aoData[h];
          null === p.nTr && A(t, h);
          for (var g = p.nTr, v = 0; v < c.length; v++) {
            var b = c[v],
              m = p.anCells[v];
            a(m, Ie.type.className[b.sType]),
              a(m, b.sClass),
              a(m, t.oClasses.tbody.cell);
          }
          ge(t, "aoRowCallback", null, [g, p._aData, o, i, h]), r.push(g), o++;
        }
      } else r[0] = O(t);
      ge(t, "aoHeaderCallback", "header", [
        e(t.nTHead).children("tr")[0],
        Xe(t.aoData, "_aData"),
        s,
        u,
        l,
      ]),
        ge(t, "aoFooterCallback", "footer", [
          e(t.nTFoot).children("tr")[0],
          Xe(t.aoData, "_aData"),
          s,
          u,
          l,
        ]),
        d.children().detach(),
        d.append(e(r)),
        e(t.nTableWrapper).toggleClass(
          "dt-empty-footer",
          0 === e("tr", t.nTFoot).length
        ),
        ge(t, "aoDrawCallback", "draw", [t], !0),
        (t.bSorted = !1),
        (t.bFiltered = !1),
        (t.bDrawing = !1);
    }
  }
  function R(e, t, n) {
    var a = e.oFeatures,
      r = a.bSort;
    (a = a.bFilter),
      (void 0 !== n && !0 !== n) ||
        (r && re(e),
        a
          ? q(e, e.oPreviousSearch)
          : (e.aiDisplay = e.aiDisplayMaster.slice())),
      !0 !== t && (e._iDisplayStart = 0),
      (e._drawHold = t),
      P(e),
      (e._drawHold = !1);
  }
  function O(t) {
    var n = t.oLanguage,
      a = n.sZeroRecords,
      r = me(t);
    return (
      1 >= t.iDraw && ("ajax" === r || "ssp" === r)
        ? (a = n.sLoadingRecords)
        : n.sEmptyTable && 0 === t.fnRecordsTotal() && (a = n.sEmptyTable),
      e("<tr/>").append(
        e("<td />", { colSpan: h(t), class: t.oClasses.empty.row }).html(a)
      )[0]
    );
  }
  function k(t, n, a) {
    var r = {};
    e.each(n, function (t, n) {
      if (null !== n) {
        var a = t.replace(/([A-Z])/g, " $1").split(" ");
        r[a[0]] || (r[a[0]] = {});
        var o = 1 === a.length ? "full" : a[1].toLowerCase();
        (a = r[a[0]]),
          e.isPlainObject(n)
            ? (a[o] = n.contents
                ? n
                : {
                    contents: Object.keys(n).map(function (e) {
                      return { feature: e, opts: n[e] };
                    }),
                  })
            : (a[o] = { contents: n }),
          Array.isArray(a[o].contents) || (a[o].contents = [a[o].contents]);
      }
    }),
      (n = Object.keys(r)
        .map(function (e) {
          return 0 !== e.indexOf(a) ? null : { name: e, val: r[e] };
        })
        .filter(function (e) {
          return null !== e;
        })).sort(function (e, t) {
        var n = 1 * e.name.replace(/[^0-9]/g, "");
        return 1 * t.name.replace(/[^0-9]/g, "") - n;
      }),
      "bottom" === a && n.reverse();
    for (var o = [], i = 0, l = n.length; i < l; i++)
      n[i].val.full &&
        (o.push({ full: n[i].val.full }),
        E(t, o[o.length - 1]),
        delete n[i].val.full),
        Object.keys(n[i].val).length &&
          (o.push(n[i].val), E(t, o[o.length - 1]));
    return o;
  }
  function E(t, n) {
    var a = function (e, n) {
      return (
        Ie.features[e] || ce(t, 0, "Unknown feature: " + e),
        Ie.features[e].apply(this, [t, n])
      );
    };
    e.each(n, function (r) {
      for (var o = 0, i = (r = n[r].contents).length; o < i; o++)
        if (r[o])
          if ("string" == typeof r[o]) r[o] = a(r[o], null);
          else if (e.isPlainObject(r[o])) r[o] = a(r[o].feature, r[o].opts);
          else if ("function" == typeof r[o].node) r[o] = r[o].node(t);
          else if ("function" == typeof r[o]) {
            var l = r[o](t);
            r[o] = "function" == typeof l.node ? l.node() : l;
          }
    });
  }
  function M(t) {
    var n = t.oClasses,
      a = e(t.nTable),
      r = e("<div/>")
        .attr({ id: t.sTableId + "_wrapper", class: n.container })
        .insertBefore(a);
    (t.nTableWrapper = r[0]),
      (n = k(t, t.layout, "top")),
      (a = k(t, t.layout, "bottom"));
    var o = be(t, "layout");
    t.sDom
      ? (function (t, n, a) {
          n = n.match(/(".*?")|('.*?')|./g);
          for (var r, o, i, l, s, u = 0; u < n.length; u++) {
            if (((r = null), "<" == (o = n[u]))) {
              if (
                ((i = e("<div/>")), "'" == (l = n[u + 1])[0] || '"' == l[0])
              ) {
                if (
                  ((s = l.replace(/['"]/g, "")), (l = ""), -1 != s.indexOf("."))
                ) {
                  var c = s.split(".");
                  (l = c[0]), (c = c[1]);
                } else "#" == s[0] ? (l = s) : (c = s);
                i.attr("id", l.substring(1)).addClass(c), u++;
              }
              a.append(i), (a = i);
            } else
              ">" == o
                ? (a = a.parent())
                : "t" == o
                  ? (r = J(t))
                  : Ce.ext.feature.forEach(function (e) {
                      o == e.cFeature && (r = e.fnInit(t));
                    });
            r && a.append(r);
          }
        })(t, t.sDom, r)
      : (n.forEach(function (e) {
          o(t, r, e);
        }),
        o(t, r, { full: { table: !0, contents: [J(t)] } }),
        a.forEach(function (e) {
          o(t, r, e);
        })),
      (function (t) {
        var n = t.nTable;
        if (t.oFeatures.bProcessing) {
          var a = e("<div/>", {
            id: t.sTableId + "_processing",
            class: t.oClasses.processing.container,
            role: "status",
          })
            .html(t.oLanguage.sProcessing)
            .append("<div><div></div><div></div><div></div><div></div></div>")
            .insertBefore(n);
          e(n).on("processing.dt.DT", function (e, t, n) {
            a.css("display", n ? "block" : "none");
          });
        }
      })(t);
  }
  function H(t, n, a) {
    var r,
      o,
      i,
      l = t.aoColumns,
      s = e(n).children("tr"),
      c = n && "thead" === n.nodeName.toLowerCase(),
      d = [],
      f = 0;
    for (o = s.length; f < o; f++) d.push([]);
    for (f = 0, o = s.length; f < o; f++)
      for (r = (n = s[f]).firstChild; r; ) {
        if (
          "TD" == r.nodeName.toUpperCase() ||
          "TH" == r.nodeName.toUpperCase()
        ) {
          var h = [],
            p = 1 * r.getAttribute("colspan"),
            g = 1 * r.getAttribute("rowspan");
          (p = p && 0 !== p && 1 !== p ? p : 1),
            (g = g && 0 !== g && 1 !== g ? g : 1);
          var v = 0;
          for (i = d[f]; i[v]; ) v++;
          if (((i = 1 === p), a)) {
            if (i) {
              u(t, v, e(r).data());
              var b = l[v],
                m = r.getAttribute("width") || null,
                y = r.style.width.match(/width:\s*(\d+[pxem%]+)/);
              y && (m = y[1]),
                (b.sWidthOrig = b.sWidth || m),
                c
                  ? (null === b.sTitle ||
                      b.autoTitle ||
                      (r.innerHTML = b.sTitle),
                    !b.sTitle &&
                      i &&
                      ((b.sTitle = r.innerHTML.replace(/<.*?>/g, "")),
                      (b.autoTitle = !0)))
                  : b.footer && (r.innerHTML = b.footer),
                b.ariaTitle ||
                  (b.ariaTitle = e(r).attr("aria-label") || b.sTitle),
                b.className && e(r).addClass(b.className);
            }
            0 === e("span.dt-column-title", r).length &&
              e("<span>")
                .addClass("dt-column-title")
                .append(r.childNodes)
                .appendTo(r),
              c &&
                0 === e("span.dt-column-order", r).length &&
                e("<span>").addClass("dt-column-order").appendTo(r);
          }
          for (m = 0; m < p; m++) {
            for (b = 0; b < g; b++)
              (d[f + b][v + m] = { cell: r, unique: i }), (d[f + b].row = n);
            h.push(v + m);
          }
          r.setAttribute("data-dt-column", Ye(h).join(","));
        }
        r = r.nextSibling;
      }
    return d;
  }
  function W(t, n, a) {
    var r = t.ajax,
      o = t.oInstance,
      i = function (e) {
        var n = t.jqXHR ? t.jqXHR.status : null;
        (null === e || ("number" == typeof n && 204 == n)) &&
          X(t, (e = {}), []),
          (n = e.error || e.sError) && ce(t, 0, n),
          (t.json = e),
          ge(t, null, "xhr", [t, e, t.jqXHR], !0),
          a(e);
      };
    if (e.isPlainObject(r) && r.data) {
      var l = r.data,
        s = "function" == typeof l ? l(n, t) : l;
      (n = "function" == typeof l && s ? s : e.extend(!0, n, s)), delete r.data;
    }
    (s = {
      url: "string" == typeof r ? r : "",
      data: n,
      success: i,
      dataType: "json",
      cache: !1,
      type: t.sServerMethod,
      error: function (e, n) {
        -1 === ge(t, null, "xhr", [t, null, t.jqXHR], !0).indexOf(!0) &&
          ("parsererror" == n
            ? ce(t, 0, "Invalid JSON response", 1)
            : 4 === e.readyState && ce(t, 0, "Ajax error", 7)),
          G(t, !1);
      },
    }),
      e.isPlainObject(r) && e.extend(s, r),
      (t.oAjaxData = n),
      ge(t, null, "preXhr", [t, n, s], !0),
      "function" == typeof r
        ? (t.jqXHR = r.call(o, n, i, t))
        : "" === r.url
          ? i({})
          : ((t.jqXHR = e.ajax(s)), l && (r.data = l));
  }
  function X(t, n, a) {
    var r = "data";
    if (
      (e.isPlainObject(t.ajax) &&
        void 0 !== t.ajax.dataSrc &&
        ("string" == typeof (t = t.ajax.dataSrc) || "function" == typeof t
          ? (r = t)
          : void 0 !== t.data && (r = t.data)),
      !a)
    )
      return "data" === r ? n.aaData || n[r] : "" !== r ? Ke(r)(n) : n;
    et(r)(n, a);
  }
  function V(t, n, a) {
    return (t = e.isPlainObject(t.ajax) ? t.ajax.dataSrc : null) && t[n]
      ? Ke(t[n])(a)
      : ((t = ""),
        "draw" === n
          ? (t = "sEcho")
          : "recordsTotal" === n
            ? (t = "iTotalRecords")
            : "recordsFiltered" === n && (t = "iTotalDisplayRecords"),
        void 0 !== a[t] ? a[t] : a[n]);
  }
  function q(t, n) {
    var a = t.aoPreSearchCols;
    if ((g(t), "ssp" != me(t))) {
      !(function (e) {
        for (
          var t, n = e.aoColumns, a = e.aoData, r = !1, o = 0;
          o < a.length;
          o++
        )
          if (a[o]) {
            var i = a[o];
            if (!i._aFilterData) {
              var l = [];
              for (r = 0, t = n.length; r < t; r++) {
                var s = n[r];
                s.bSearchable
                  ? (null === (s = x(e, o, r, "filter")) && (s = ""),
                    "string" != typeof s && s.toString && (s = s.toString()))
                  : (s = ""),
                  s.indexOf &&
                    -1 !== s.indexOf("&") &&
                    ((nt.innerHTML = s),
                    (s = at ? nt.textContent : nt.innerText)),
                  s.replace && (s = s.replace(/[\r\n\u2028]/g, "")),
                  l.push(s);
              }
              (i._aFilterData = l), (i._sFilterRow = l.join("  ")), (r = !0);
            }
          }
      })(t),
        (t.aiDisplay = t.aiDisplayMaster.slice()),
        B(t.aiDisplay, t, n.search, n),
        e.each(t.searchFixed, function (e, n) {
          B(t.aiDisplay, t, n, {});
        });
      for (var r = 0; r < a.length; r++) {
        var o = a[r];
        B(t.aiDisplay, t, o.search, o, r),
          e.each(t.aoColumns[r].searchFixed, function (e, n) {
            B(t.aiDisplay, t, n, {}, r);
          });
      }
      !(function (e) {
        for (
          var t, n, a = Ce.ext.search, r = e.aiDisplay, o = 0, i = a.length;
          o < i;
          o++
        ) {
          for (var l = [], s = 0, u = r.length; s < u; s++)
            (n = r[s]),
              (t = e.aoData[n]),
              a[o](e, t._aFilterData, n, t._aData, s) && l.push(n);
          (r.length = 0), r.push.apply(r, l);
        }
      })(t);
    }
    (t.bFiltered = !0), ge(t, null, "search", [t]);
  }
  function B(t, n, a, r, o) {
    if ("" !== a) {
      var i = 0,
        l = "function" == typeof a ? a : null;
      for (
        a =
          a instanceof RegExp
            ? a
            : l
              ? null
              : (function (t, n) {
                  var a = [],
                    r = e.extend(
                      {},
                      {
                        boundary: !1,
                        caseInsensitive: !0,
                        exact: !1,
                        regex: !1,
                        smart: !0,
                      },
                      n
                    );
                  if (("string" != typeof t && (t = t.toString()), r.exact))
                    return new RegExp(
                      "^" + tt(t) + "$",
                      r.caseInsensitive ? "i" : ""
                    );
                  if (((t = r.regex ? t : tt(t)), r.smart)) {
                    var o = (
                        t.match(/!?["\u201C][^"\u201D]+["\u201D]|[^ ]+/g) || [
                          "",
                        ]
                      ).map(function (e) {
                        var t,
                          n = !1;
                        return (
                          "!" === e.charAt(0) &&
                            ((n = !0), (e = e.substring(1))),
                          '"' === e.charAt(0)
                            ? (e = (t = e.match(/^"(.*)"$/)) ? t[1] : e)
                            : "“" === e.charAt(0) &&
                              (e = (t = e.match(/^\u201C(.*)\u201D$/))
                                ? t[1]
                                : e),
                          n &&
                            (1 < e.length && a.push("(?!" + e + ")"), (e = "")),
                          e.replace('"', "")
                        );
                      }),
                      i = a.length ? a.join("") : "",
                      l = r.boundary ? "\\b" : "";
                    t =
                      "^(?=.*?" + l + o.join(")(?=.*?" + l) + ")(" + i + ".)*$";
                  }
                  return new RegExp(t, r.caseInsensitive ? "i" : "");
                })(a, r);
        i < t.length;

      ) {
        r = n.aoData[t[i]];
        var s = void 0 === o ? r._sFilterRow : r._aFilterData[o];
        ((l && !l(s, r._aData, t[i], o)) || (a && !a.test(s))) &&
          (t.splice(i, 1), i--),
          i++;
      }
    }
  }
  function U(e) {
    var t,
      n = e.iInitDisplayStart;
    if (e.bInitialised) {
      L(e, "header"),
        L(e, "footer"),
        N(e, e.aoHeader),
        N(e, e.aoFooter),
        M(e),
        (function (e) {
          var t = e.nTHead,
            n = t.querySelectorAll("tr"),
            a = e.bSortCellsTop;
          !0 === a ? (t = n[0]) : !1 === a && (t = n[n.length - 1]),
            te(
              e,
              t,
              t === e.nTHead
                ? 'tr:not([data-dt-order="disable"]):not([data-dt-order="icon-only"]) th:not([data-dt-order="disable"]):not([data-dt-order="icon-only"]), tr:not([data-dt-order="disable"]):not([data-dt-order="icon-only"]) td:not([data-dt-order="disable"]):not([data-dt-order="icon-only"])'
                : 'th:not([data-dt-order="disable"]):not([data-dt-order="icon-only"]), td:not([data-dt-order="disable"]):not([data-dt-order="icon-only"])'
            ),
            ne(e, (t = []), e.aaSorting),
            (e.aaSorting = t);
        })(e),
        ee(e),
        G(e, !0),
        ge(e, null, "preInit", [e], !0),
        R(e);
      var a = me(e);
      "ssp" != a &&
        ("ajax" == a
          ? W(e, {}, function (a) {
              for (a = X(e, a), t = 0; t < a.length; t++) y(e, a[t]);
              (e.iInitDisplayStart = n), R(e), G(e, !1), $(e);
            })
          : ($(e), G(e, !1)));
    } else
      setTimeout(function () {
        U(e);
      }, 200);
  }
  function $(e) {
    if (!e._bInitComplete) {
      var t = [e, e.json];
      (e._bInitComplete = !0),
        c(e),
        ge(e, null, "plugin-init", t, !0),
        ge(e, "aoInitComplete", "init", t, !0);
    }
  }
  function z(e, t) {
    var n = parseInt(t, 10);
    (e._iDisplayLength = n), ve(e), ge(e, null, "length", [e, n]);
  }
  function Y(e, t, n) {
    var a = e._iDisplayStart,
      r = e._iDisplayLength,
      o = e.fnRecordsDisplay();
    if (0 === o || -1 === r) a = 0;
    else if ("number" == typeof t) (a = t * r) > o && (a = 0);
    else if ("first" == t) a = 0;
    else if ("previous" == t) 0 > (a = 0 <= r ? a - r : 0) && (a = 0);
    else if ("next" == t) a + r < o && (a += r);
    else if ("last" == t) a = Math.floor((o - 1) / r) * r;
    else {
      if ("ellipsis" === t) return;
      ce(e, 0, "Unknown paging action: " + t, 5);
    }
    return (
      (t = e._iDisplayStart !== a),
      (e._iDisplayStart = a),
      ge(e, null, t ? "page" : "page-nc", [e]),
      t && n && P(e),
      t
    );
  }
  function G(e, t) {
    ge(e, null, "processing", [e, t]);
  }
  function J(t) {
    var n = e(t.nTable),
      a = t.oScroll;
    if ("" === a.sX && "" === a.sY) return t.nTable;
    var r = a.sX,
      o = a.sY,
      i = t.oClasses.scrolling,
      l = t.captionNode,
      s = l ? l._captionSide : null,
      u = e(n[0].cloneNode(!1)),
      c = e(n[0].cloneNode(!1)),
      d = n.children("tfoot");
    d.length || (d = null),
      (u = e("<div/>", { class: i.container })
        .append(
          e("<div/>", { class: i.header.self })
            .css({
              overflow: "hidden",
              position: "relative",
              border: 0,
              width: r ? (r ? K(r) : null) : "100%",
            })
            .append(
              e("<div/>", { class: i.header.inner })
                .css({
                  "box-sizing": "content-box",
                  width: a.sXInner || "100%",
                })
                .append(
                  u
                    .removeAttr("id")
                    .css("margin-left", 0)
                    .append("top" === s ? l : null)
                    .append(n.children("thead"))
                )
            )
        )
        .append(
          e("<div/>", { class: i.body })
            .css({
              position: "relative",
              overflow: "auto",
              width: r ? K(r) : null,
            })
            .append(n)
        )),
      d &&
        u.append(
          e("<div/>", { class: i.footer.self })
            .css({
              overflow: "hidden",
              border: 0,
              width: r ? (r ? K(r) : null) : "100%",
            })
            .append(
              e("<div/>", { class: i.footer.inner }).append(
                c
                  .removeAttr("id")
                  .css("margin-left", 0)
                  .append("bottom" === s ? l : null)
                  .append(n.children("tfoot"))
              )
            )
        );
    var f = (n = u.children())[0],
      h = n[1],
      p = d ? n[2] : null;
    return (
      e(h).on("scroll.DT", function () {
        var e = this.scrollLeft;
        (f.scrollLeft = e), d && (p.scrollLeft = e);
      }),
      e("th, td", f).on("focus", function () {
        var e = f.scrollLeft;
        (h.scrollLeft = e), d && (h.scrollLeft = e);
      }),
      e(h).css("max-height", o),
      a.bCollapse || e(h).css("height", o),
      (t.nScrollHead = f),
      (t.nScrollBody = h),
      (t.nScrollFoot = p),
      t.aoDrawCallback.push(Z),
      u[0]
    );
  }
  function Z(t) {
    var n = t.oScroll.iBarWidth,
      a = e(t.nScrollHead).children("div"),
      r = a.children("table"),
      o = t.nScrollBody,
      i = e(o),
      l = e(t.nScrollFoot).children("div"),
      s = l.children("table"),
      u = e(t.nTHead),
      d = e(t.nTable),
      f = t.nTFoot && e("th, td", t.nTFoot).length ? e(t.nTFoot) : null,
      h = t.oBrowser,
      p = o.scrollHeight > o.clientHeight;
    if (t.scrollBarVis !== p && void 0 !== t.scrollBarVis)
      (t.scrollBarVis = p), c(t);
    else {
      if (
        ((t.scrollBarVis = p),
        d.children("thead, tfoot").remove(),
        (u = u.clone().prependTo(d)).find("th, td").removeAttr("tabindex"),
        u.find("[id]").removeAttr("id"),
        f)
      ) {
        var g = f.clone().prependTo(d);
        g.find("[id]").removeAttr("id");
      }
      if (t.aiDisplay.length) {
        var v = d
          .find("tbody tr")
          .eq(0)
          .find("th, td")
          .map(function () {
            return e(this).outerWidth();
          });
        e("col", t.colgroup).each(function (e) {
          this.style.width.replace("px", "") !== v[e] &&
            (this.style.width = v[e] + "px");
        });
      }
      r.find("colgroup").remove(),
        r.append(t.colgroup.clone()),
        f && (s.find("colgroup").remove(), s.append(t.colgroup.clone())),
        e("th, td", u).each(function () {
          e(this).children().wrapAll('<div class="dt-scroll-sizing">');
        }),
        f &&
          e("th, td", g).each(function () {
            e(this).children().wrapAll('<div class="dt-scroll-sizing">');
          }),
        (g =
          Math.floor(d.height()) > o.clientHeight ||
          "scroll" == i.css("overflow-y")),
        (h = "padding" + (h.bScrollbarLeft ? "Left" : "Right")),
        (u = d.outerWidth()),
        r.css("width", K(u)),
        a.css("width", K(u)).css(h, g ? n + "px" : "0px"),
        f &&
          (s.css("width", K(u)),
          l.css("width", K(u)).css(h, g ? n + "px" : "0px")),
        d.children("colgroup").prependTo(d),
        i.trigger("scroll"),
        (!t.bSorted && !t.bFiltered) || t._drawHold || (o.scrollTop = 0);
    }
  }
  function Q(e, t) {
    var n = e.aoColumns[t];
    if (!n.maxLenString) {
      for (
        var a, r = "", o = -1, i = 0, l = e.aiDisplayMaster.length;
        i < l;
        i++
      ) {
        var s =
          (a = I(e, e.aiDisplayMaster[i])[t]) &&
          "object" == typeof a &&
          a.nodeType
            ? a.innerHTML
            : a + "";
        (s = s.replace(/id=".*?"/g, "").replace(/name=".*?"/g, "")),
          (a = Ue(s).replace(/&nbsp;/g, " ")).length > o &&
            ((r = s), (o = a.length));
      }
      n.maxLenString = r;
    }
    return n.maxLenString;
  }
  function K(e) {
    return null === e
      ? "0px"
      : "number" == typeof e
        ? 0 > e
          ? "0px"
          : e + "px"
        : e.match(/\d$/)
          ? e + "px"
          : e;
  }
  function ee(e) {
    var t = e.aoColumns;
    for (e.colgroup.empty(), _t = 0; _t < t.length; _t++)
      t[_t].bVisible && e.colgroup.append(t[_t].colEl);
  }
  function te(e, t, n, a, r) {
    he(t, n, function (t) {
      var n = void 0 === a ? m(t.target) : [a];
      n.length &&
        (G(e, !0),
        setTimeout(function () {
          for (var a = 0, o = n.length; a < o; a++)
            oe(e, n[a], t.shiftKey || 0 < a);
          re(e),
            (function (e) {
              var t = e.aiDisplayMaster;
              e.aiDisplay.sort(function (e, n) {
                return t.indexOf(e) - t.indexOf(n);
              });
            })(e),
            R(e, !1, !1),
            G(e, !1),
            r && r();
        }, 0));
    });
  }
  function ne(t, n, a) {
    var r = function (a) {
      if (e.isPlainObject(a)) {
        if (void 0 !== a.idx) n.push([a.idx, a.dir]);
        else if (a.name) {
          var r = Xe(t.aoColumns, "sName").indexOf(a.name);
          -1 !== r && n.push([r, a.dir]);
        }
      } else n.push(a);
    };
    if (e.isPlainObject(a)) r(a);
    else if (a.length && "number" == typeof a[0]) r(a);
    else if (a.length) for (var o = 0; o < a.length; o++) r(a[o]);
  }
  function ae(t) {
    var n = [],
      a = Ce.ext.type.order,
      r = t.aoColumns,
      o = t.aaSortingFixed,
      i = e.isPlainObject(o),
      l = [];
    if (!t.oFeatures.bSort) return n;
    for (
      Array.isArray(o) && ne(t, l, o),
        i && o.pre && ne(t, l, o.pre),
        ne(t, l, t.aaSorting),
        i && o.post && ne(t, l, o.post),
        t = 0;
      t < l.length;
      t++
    ) {
      var s = l[t][0];
      if (r[s]) {
        var u = r[s].aDataSort;
        for (o = 0, i = u.length; o < i; o++) {
          var c = u[o],
            d = r[c].sType || "string";
          void 0 === l[t]._idx && (l[t]._idx = r[c].asSorting.indexOf(l[t][1])),
            l[t][1] &&
              n.push({
                src: s,
                col: c,
                dir: l[t][1],
                index: l[t]._idx,
                type: d,
                formatter: a[d + "-pre"],
                sorter: a[d + "-" + l[t][1]],
              });
        }
      }
    }
    return n;
  }
  function re(e, t, n) {
    var a = [],
      r = Ce.ext.type.order,
      o = e.aoData,
      i = e.aiDisplayMaster;
    if ((g(e), void 0 !== t)) {
      var l = e.aoColumns[t],
        s = [
          {
            src: t,
            col: t,
            dir: n,
            index: 0,
            type: l.sType,
            formatter: r[l.sType + "-pre"],
            sorter: r[l.sType + "-" + n],
          },
        ];
      i = i.slice();
    } else s = ae(e);
    for (n = 0, r = s.length; n < r; n++) le(e, (l = s[n]).col);
    if ("ssp" != me(e) && 0 !== s.length) {
      for (n = 0, r = i.length; n < r; n++) a[n] = n;
      s.length && "desc" === s[0].dir && a.reverse(),
        i.sort(function (e, t) {
          var n,
            r = s.length,
            i = o[e]._aSortData,
            l = o[t]._aSortData;
          for (n = 0; n < r; n++) {
            var u = s[n],
              c = i[u.col],
              d = l[u.col];
            if (u.sorter) {
              if (0 !== (c = u.sorter(c, d))) return c;
            } else if (0 !== (c = c < d ? -1 : c > d ? 1 : 0))
              return "asc" === u.dir ? c : -c;
          }
          return (c = a[e]) < (d = a[t]) ? -1 : c > d ? 1 : 0;
        });
    } else
      0 === s.length &&
        i.sort(function (e, t) {
          return e < t ? -1 : e > t ? 1 : 0;
        });
    return void 0 === t && ((e.bSorted = !0), ge(e, null, "order", [e, s])), i;
  }
  function oe(e, t, n) {
    var a = e.aoColumns[t],
      r = e.aaSorting,
      o = a.asSorting,
      i = function (e, t) {
        var n = e._idx;
        return (
          void 0 === n && (n = o.indexOf(e[1])),
          n + 1 < o.length ? n + 1 : t ? null : 0
        );
      };
    a.bSortable &&
      ("number" == typeof r[0] && (r = e.aaSorting = [r]),
      n && e.oFeatures.bSortMulti
        ? -1 !== (e = Xe(r, "0").indexOf(t))
          ? (null === (t = i(r[e], !0)) && 1 === r.length && (t = 0),
            null === t ? r.splice(e, 1) : ((r[e][1] = o[t]), (r[e]._idx = t)))
          : (r.push([t, o[0], 0]), (r[r.length - 1]._idx = 0))
        : r.length && r[0][0] == t
          ? ((t = i(r[0])), (r.length = 1), (r[0][1] = o[t]), (r[0]._idx = t))
          : ((r.length = 0), r.push([t, o[0]]), (r[0]._idx = 0)));
  }
  function ie(t) {
    var n,
      a = t.aLastSort,
      r = t.oClasses.order.position,
      o = ae(t),
      i = t.oFeatures;
    if (i.bSort && i.bSortClasses) {
      for (i = 0, n = a.length; i < n; i++) {
        var l = a[i].src;
        e(Xe(t.aoData, "anCells", l)).removeClass(r + (2 > i ? i + 1 : 3));
      }
      for (i = 0, n = o.length; i < n; i++)
        (l = o[i].src),
          e(Xe(t.aoData, "anCells", l)).addClass(r + (2 > i ? i + 1 : 3));
    }
    t.aLastSort = o;
  }
  function le(e, t) {
    var n,
      a = e.aoColumns[t],
      r = Ce.ext.order[a.sSortDataType];
    r && (n = r.call(e.oInstance, e, t, f(e, t)));
    for (
      var o, i = Ce.ext.type.order[a.sType + "-pre"], l = e.aoData, s = 0;
      s < l.length;
      s++
    )
      l[s] &&
        ((a = l[s])._aSortData || (a._aSortData = []), !a._aSortData[t] || r) &&
        ((o = r ? n[s] : x(e, s, t, "sort")),
        (a._aSortData[t] = i ? i(o, e) : o));
  }
  function se(t) {
    if (!t._bLoadingState) {
      var n = {
        time: +new Date(),
        start: t._iDisplayStart,
        length: t._iDisplayLength,
        order: e.extend(!0, [], t.aaSorting),
        search: e.extend({}, t.oPreviousSearch),
        columns: t.aoColumns.map(function (n, a) {
          return {
            visible: n.bVisible,
            search: e.extend({}, t.aoPreSearchCols[a]),
          };
        }),
      };
      (t.oSavedState = n),
        ge(t, "aoStateSaveParams", "stateSaveParams", [t, n]),
        t.oFeatures.bStateSave &&
          !t.bDestroying &&
          t.fnStateSaveCallback.call(t.oInstance, t, n);
    }
  }
  function ue(t, n, a) {
    var r,
      o = t.aoColumns;
    t._bLoadingState = !0;
    var i = t._bInitComplete ? new Ce.Api(t) : null;
    if (n && n.time) {
      var l = t.iStateDuration;
      if (0 < l && n.time < +new Date() - 1e3 * l) t._bLoadingState = !1;
      else if (
        -1 !== ge(t, "aoStateLoadParams", "stateLoadParams", [t, n]).indexOf(!1)
      )
        t._bLoadingState = !1;
      else if (n.columns && o.length !== n.columns.length)
        t._bLoadingState = !1;
      else {
        if (
          ((t.oLoadedState = e.extend(!0, {}, n)),
          ge(t, null, "stateLoadInit", [t, n], !0),
          void 0 !== n.length &&
            (i ? i.page.len(n.length) : (t._iDisplayLength = n.length)),
          void 0 !== n.start &&
            (null === i
              ? ((t._iDisplayStart = n.start), (t.iInitDisplayStart = n.start))
              : Y(t, n.start / t._iDisplayLength)),
          void 0 !== n.order &&
            ((t.aaSorting = []),
            e.each(n.order, function (e, n) {
              t.aaSorting.push(n[0] >= o.length ? [0, n[1]] : n);
            })),
          void 0 !== n.search && e.extend(t.oPreviousSearch, n.search),
          n.columns)
        ) {
          for (l = 0, r = n.columns.length; l < r; l++) {
            var s = n.columns[l];
            void 0 !== s.visible &&
              (i
                ? i.column(l).visible(s.visible, !1)
                : (o[l].bVisible = s.visible)),
              void 0 !== s.search && e.extend(t.aoPreSearchCols[l], s.search);
          }
          i && i.columns.adjust();
        }
        (t._bLoadingState = !1), ge(t, "aoStateLoaded", "stateLoaded", [t, n]);
      }
    } else t._bLoadingState = !1;
    a();
  }
  function ce(e, n, a, r) {
    if (
      ((a =
        "DataTables warning: " +
        (e ? "table id=" + e.sTableId + " - " : "") +
        a),
      r &&
        (a +=
          ". For more information about this error, please see https://datatables.net/tn/" +
          r),
      n)
    )
      t.console && console.log && console.log(a);
    else if (
      ((n = (n = Ce.ext).sErrMode || n.errMode),
      e && ge(e, null, "dt-error", [e, r, a], !0),
      "alert" == n)
    )
      alert(a);
    else {
      if ("throw" == n) throw Error(a);
      "function" == typeof n && n(e, r, a);
    }
  }
  function de(t, n, a, r) {
    Array.isArray(a)
      ? e.each(a, function (e, a) {
          Array.isArray(a) ? de(t, n, a[0], a[1]) : de(t, n, a);
        })
      : (void 0 === r && (r = a), void 0 !== n[a] && (t[r] = n[a]));
  }
  function fe(t, n, a) {
    var r;
    for (r in n)
      if (Object.prototype.hasOwnProperty.call(n, r)) {
        var o = n[r];
        e.isPlainObject(o)
          ? (e.isPlainObject(t[r]) || (t[r] = {}), e.extend(!0, t[r], o))
          : a && "data" !== r && "aaData" !== r && Array.isArray(o)
            ? (t[r] = o.slice())
            : (t[r] = o);
      }
    return t;
  }
  function he(t, n, a) {
    e(t)
      .on("click.DT", n, function (e) {
        a(e);
      })
      .on("keypress.DT", n, function (e) {
        13 === e.which && (e.preventDefault(), a(e));
      })
      .on("selectstart.DT", n, function () {
        return !1;
      });
  }
  function pe(e, t, n) {
    n && e[t].push(n);
  }
  function ge(t, n, a, r, o) {
    var i = [];
    return (
      n &&
        (i = t[n]
          .slice()
          .reverse()
          .map(function (e) {
            return e.apply(t.oInstance, r);
          })),
      null !== a &&
        ((n = e.Event(a + ".dt")),
        (a = e(t.nTable)),
        (n.dt = t.api),
        a[o ? "trigger" : "triggerHandler"](n, r),
        o && 0 === a.parents("body").length && e("body").trigger(n, r),
        i.push(n.result)),
      i
    );
  }
  function ve(e) {
    var t = e._iDisplayStart,
      n = e.fnDisplayEnd(),
      a = e._iDisplayLength;
    t >= n && (t = n - a),
      (t -= t % a),
      (-1 === a || 0 > t) && (t = 0),
      (e._iDisplayStart = t);
  }
  function be(t, n) {
    var a = t.renderer,
      r = Ce.ext.renderer[n];
    return e.isPlainObject(a) && a[n]
      ? r[a[n]] || r._
      : ("string" == typeof a && r[a]) || r._;
  }
  function me(e) {
    return e.oFeatures.bServerSide ? "ssp" : e.ajax ? "ajax" : "dom";
  }
  function ye(e, t, n) {
    var a = e.fnFormatNumber,
      r = e._iDisplayStart + 1,
      o = e._iDisplayLength,
      i = e.fnRecordsDisplay(),
      l = e.fnRecordsTotal(),
      s = -1 === o;
    return t
      .replace(/_START_/g, a.call(e, r))
      .replace(/_END_/g, a.call(e, e.fnDisplayEnd()))
      .replace(/_MAX_/g, a.call(e, l))
      .replace(/_TOTAL_/g, a.call(e, i))
      .replace(/_PAGE_/g, a.call(e, s ? 1 : Math.ceil(r / o)))
      .replace(/_PAGES_/g, a.call(e, s ? 1 : Math.ceil(i / o)))
      .replace(/_ENTRIES_/g, e.api.i18n("entries", "", n))
      .replace(/_ENTRIES-MAX_/g, e.api.i18n("entries", "", l))
      .replace(/_ENTRIES-TOTAL_/g, e.api.i18n("entries", "", i));
  }
  function De(e, t, n) {
    return function () {
      var a = t.apply(e || this, arguments);
      return it.extend(a, a, n.methodExt), a;
    };
  }
  function xe(e, n, a, r, o) {
    return t.moment ? e[n](o) : t.luxon ? e[a](o) : r ? e[r](o) : e;
  }
  function Se(e, n, a) {
    if (t.moment) {
      var r = t.moment.utc(e, n, a, !0);
      if (!r.isValid()) return null;
    } else if (t.luxon) {
      if (
        !(r =
          n && "string" == typeof e
            ? t.luxon.DateTime.fromFormat(e, n)
            : t.luxon.DateTime.fromISO(e)).isValid
      )
        return null;
      r.setLocale(a);
    } else
      n
        ? (xt ||
            alert(
              "DataTables warning: Formatted date without Moment.js or Luxon - https://datatables.net/tn/17"
            ),
          (xt = !0))
        : (r = new Date(e));
    return r;
  }
  function we(e) {
    return function (t, n, a, r) {
      0 === arguments.length
        ? ((a = "en"), (t = n = null))
        : 1 === arguments.length
          ? ((a = "en"), (n = t), (t = null))
          : 2 === arguments.length && ((a = n), (n = t), (t = null));
      var o = "datetime" + (n ? "-" + n.replace(/[\W]/g, "_") : "");
      return (
        Ce.ext.type.order[o] ||
          Ce.type(o, {
            detect: function (e) {
              return e === o && o;
            },
            order: {
              pre: function (e) {
                return e.valueOf();
              },
            },
            className: "dt-right",
          }),
        function (i, l) {
          if (null == i)
            if ("--now" === r) {
              var s = new Date();
              i = new Date(
                Date.UTC(
                  s.getFullYear(),
                  s.getMonth(),
                  s.getDate(),
                  s.getHours(),
                  s.getMinutes(),
                  s.getSeconds()
                )
              );
            } else i = "";
          return "type" === l
            ? o
            : "" === i
              ? "sort" !== l
                ? ""
                : Se("0000-01-01 00:00:00", null, a)
              : null === n ||
                  t !== n ||
                  "sort" === l ||
                  "type" === l ||
                  i instanceof Date
                ? null === (s = Se(i, t, a))
                  ? i
                  : "sort" === l
                    ? s
                    : ((s =
                        null === n
                          ? xe(s, "toDate", "toJSDate", "")[e]()
                          : xe(s, "format", "toFormat", "toISOString", n)),
                      "display" === l ? $e(s) : s)
                : i;
        }
      );
    };
  }
  function Te(e, t, n, a) {
    var r = e.oLanguage.oPaginate,
      o = { display: "", active: !1, disabled: !1 };
    switch (t) {
      case "ellipsis":
        (o.display = "&#x2026;"), (o.disabled = !0);
        break;
      case "first":
        (o.display = r.sFirst), 0 === n && (o.disabled = !0);
        break;
      case "previous":
        (o.display = r.sPrevious), 0 === n && (o.disabled = !0);
        break;
      case "next":
        (o.display = r.sNext), (0 !== a && n !== a - 1) || (o.disabled = !0);
        break;
      case "last":
        (o.display = r.sLast), (0 !== a && n !== a - 1) || (o.disabled = !0);
        break;
      default:
        "number" == typeof t &&
          ((o.display = e.fnFormatNumber(t + 1)), n === t && (o.active = !0));
    }
    return o;
  }
  function _e(e, t, n) {
    var a = Math.floor(n / 2);
    return (
      t <= n
        ? (e = qe(0, t))
        : 1 === n
          ? (e = [e])
          : 3 === n
            ? 1 >= e
              ? (e = [0, 1, "ellipsis"])
              : e >= t - 2
                ? (e = qe(t - 2, t)).unshift("ellipsis")
                : (e = ["ellipsis", e, "ellipsis"])
            : e <= a
              ? (e = qe(0, n - 2)).push("ellipsis", t - 1)
              : (e >= t - 1 - a
                  ? (e = qe(t - (n - 2), t))
                  : (e = qe(e - a + 2, e + a - 1)).push("ellipsis", t - 1),
                e.unshift(0, "ellipsis")),
      e
    );
  }
  var Ce = function (n, a) {
    if (Ce.factory(n, a)) return Ce;
    if (this instanceof Ce) return e(n).DataTable(a);
    var r = this,
      c = void 0 === (a = n),
      d = this.length;
    return (
      c && (a = {}),
      (this.api = function () {
        return new it(this);
      }),
      this.each(function () {
        var n,
          f = {},
          h = 1 < d ? fe(f, a, !0) : a,
          p = 0;
        f = this.getAttribute("id");
        var g = !1,
          v = Ce.defaults,
          b = e(this);
        if ("table" != this.nodeName.toLowerCase())
          ce(
            null,
            0,
            "Non-table node initialisation (" + this.nodeName + ")",
            2
          );
        else {
          e(this).trigger("options.dt", h),
            i(v),
            l(v.column),
            o(v, v, !0),
            o(v.column, v.column, !0),
            o(v, e.extend(h, b.data()), !0);
          var m = Ce.settings;
          for (p = 0, n = m.length; p < n; p++) {
            var S = m[p];
            if (
              S.nTable == this ||
              (S.nTHead && S.nTHead.parentNode == this) ||
              (S.nTFoot && S.nTFoot.parentNode == this)
            ) {
              var w = void 0 !== h.bRetrieve ? h.bRetrieve : v.bRetrieve;
              if (c || w) return S.oInstance;
              if (void 0 !== h.bDestroy ? h.bDestroy : v.bDestroy) {
                new Ce.Api(S).destroy();
                break;
              }
              return void ce(S, 0, "Cannot reinitialise DataTable", 3);
            }
            if (S.sTableId == this.id) {
              m.splice(p, 1);
              break;
            }
          }
          (null !== f && "" !== f) ||
            (this.id = f = "DataTables_Table_" + Ce.ext._unique++);
          var T = e.extend(!0, {}, Ce.models.oSettings, {
            sDestroyWidth: b[0].style.width,
            sInstance: f,
            sTableId: f,
            colgroup: e("<colgroup>").prependTo(this),
            fastData: function (e, t, n) {
              return x(T, e, t, n);
            },
          });
          (T.nTable = this),
            (T.oInit = h),
            m.push(T),
            (T.api = new it(T)),
            (T.oInstance = 1 === r.length ? r : b.dataTable()),
            i(h),
            h.aLengthMenu &&
              !h.iDisplayLength &&
              (h.iDisplayLength = Array.isArray(h.aLengthMenu[0])
                ? h.aLengthMenu[0][0]
                : e.isPlainObject(h.aLengthMenu[0])
                  ? h.aLengthMenu[0].value
                  : h.aLengthMenu[0]),
            (h = fe(e.extend(!0, {}, v), h)),
            de(
              T.oFeatures,
              h,
              "bPaginate bLengthChange bFilter bSort bSortMulti bInfo bProcessing bAutoWidth bSortClasses bServerSide bDeferRender".split(
                " "
              )
            ),
            de(T, h, [
              "ajax",
              "fnFormatNumber",
              "sServerMethod",
              "aaSorting",
              "aaSortingFixed",
              "aLengthMenu",
              "sPaginationType",
              "iStateDuration",
              "bSortCellsTop",
              "iTabIndex",
              "sDom",
              "fnStateLoadCallback",
              "fnStateSaveCallback",
              "renderer",
              "searchDelay",
              "rowId",
              "caption",
              "layout",
              ["iCookieDuration", "iStateDuration"],
              ["oSearch", "oPreviousSearch"],
              ["aoSearchCols", "aoPreSearchCols"],
              ["iDisplayLength", "_iDisplayLength"],
            ]),
            de(T.oScroll, h, [
              ["sScrollX", "sX"],
              ["sScrollXInner", "sXInner"],
              ["sScrollY", "sY"],
              ["bScrollCollapse", "bCollapse"],
            ]),
            de(T.oLanguage, h, "fnInfoCallback"),
            pe(T, "aoDrawCallback", h.fnDrawCallback),
            pe(T, "aoStateSaveParams", h.fnStateSaveParams),
            pe(T, "aoStateLoadParams", h.fnStateLoadParams),
            pe(T, "aoStateLoaded", h.fnStateLoaded),
            pe(T, "aoRowCallback", h.fnRowCallback),
            pe(T, "aoRowCreatedCallback", h.fnCreatedRow),
            pe(T, "aoHeaderCallback", h.fnHeaderCallback),
            pe(T, "aoFooterCallback", h.fnFooterCallback),
            pe(T, "aoInitComplete", h.fnInitComplete),
            pe(T, "aoPreDrawCallback", h.fnPreDrawCallback),
            (T.rowIdFn = Ke(h.rowId)),
            (function (n) {
              if (!Ce.__browser) {
                var a = {};
                Ce.__browser = a;
                var r = e("<div/>")
                    .css({
                      position: "fixed",
                      top: 0,
                      left: -1 * t.pageXOffset,
                      height: 1,
                      width: 1,
                      overflow: "hidden",
                    })
                    .append(
                      e("<div/>")
                        .css({
                          position: "absolute",
                          top: 1,
                          left: 1,
                          width: 100,
                          overflow: "scroll",
                        })
                        .append(e("<div/>").css({ width: "100%", height: 10 }))
                    )
                    .appendTo("body"),
                  o = r.children(),
                  i = o.children();
                (a.barWidth = o[0].offsetWidth - o[0].clientWidth),
                  (a.bScrollbarLeft = 1 !== Math.round(i.offset().left)),
                  r.remove();
              }
              e.extend(n.oBrowser, Ce.__browser),
                (n.oScroll.iBarWidth = Ce.__browser.barWidth);
            })(T);
          var _ = T.oClasses;
          e.extend(_, Ce.ext.classes, h.oClasses),
            b.addClass(_.table),
            T.oFeatures.bPaginate || (h.iDisplayStart = 0),
            void 0 === T.iInitDisplayStart &&
              ((T.iInitDisplayStart = h.iDisplayStart),
              (T._iDisplayStart = h.iDisplayStart));
          var C = T.oLanguage;
          e.extend(!0, C, h.oLanguage),
            C.sUrl
              ? (e.ajax({
                  dataType: "json",
                  url: C.sUrl,
                  success: function (t) {
                    o(v.oLanguage, t),
                      e.extend(!0, C, t, T.oInit.oLanguage),
                      ge(T, null, "i18n", [T]),
                      U(T);
                  },
                  error: function () {
                    ce(T, 0, "i18n file loading error", 21), U(T);
                  },
                }),
                (g = !0))
              : ge(T, null, "i18n", [T]),
            (f = []);
          var I = this.getElementsByTagName("thead");
          if (((m = H(T, I[0])), h.aoColumns)) f = h.aoColumns;
          else if (m.length)
            for (p = 0, n = m[0].length; p < n; p++) f.push(null);
          for (p = 0, n = f.length; p < n; p++) s(T);
          if (
            ((function (t, n, a, r, o) {
              var i,
                l,
                u,
                c = t.aoColumns;
              if (a) {
                var d = 0;
                for (i = a.length; d < i; d++)
                  a[d] && a[d].name && (c[d].sName = a[d].name);
              }
              if (n)
                for (d = n.length - 1; 0 <= d; d--) {
                  var f = n[d],
                    h =
                      void 0 !== f.target
                        ? f.target
                        : void 0 !== f.targets
                          ? f.targets
                          : f.aTargets;
                  for (
                    Array.isArray(h) || (h = [h]), i = 0, l = h.length;
                    i < l;
                    i++
                  ) {
                    var p = h[i];
                    if ("number" == typeof p && 0 <= p) {
                      for (; c.length <= p; ) s(t);
                      o(p, f);
                    } else if ("number" == typeof p && 0 > p)
                      o(c.length + p, f);
                    else if ("string" == typeof p) {
                      var g = 0;
                      for (u = c.length; g < u; g++)
                        -1 !== p.indexOf(":name")
                          ? c[g].sName === p.replace(":name", "") && o(g, f)
                          : r.forEach(function (t) {
                              (t = e(t[g].cell)),
                                p.match(/^[a-z][\w-]*$/i) && (p = "." + p),
                                ("_all" === p || t.is(p)) && o(g, f);
                            });
                    }
                  }
                }
              if (a) for (d = 0, i = a.length; d < i; d++) o(d, a[d]);
            })(T, h.aoColumnDefs, f, m, function (e, t) {
              u(T, e, t);
            }),
            (f = b.children("tbody").find("tr").eq(0)).length)
          ) {
            var A = function (e, t) {
              return null !== e.getAttribute("data-" + t) ? t : null;
            };
            e(f[0])
              .children("th, td")
              .each(function (e, t) {
                var n = T.aoColumns[e];
                if (
                  (n || ce(T, 0, "Incorrect column count", 18), n.mData === e)
                ) {
                  var a = A(t, "sort") || A(t, "order"),
                    r = A(t, "filter") || A(t, "search");
                  (null === a && null === r) ||
                    ((n.mData = {
                      _: e + ".display",
                      sort: null !== a ? e + ".@data-" + a : void 0,
                      type: null !== a ? e + ".@data-" + a : void 0,
                      filter: null !== r ? e + ".@data-" + r : void 0,
                    }),
                    (n._isArrayHost = !0),
                    u(T, e));
                }
              });
          }
          var F = T.oFeatures;
          (f = function () {
            if (void 0 === h.aaSorting) {
              var t = T.aaSorting;
              for (p = 0, n = t.length; p < n; p++)
                t[p][1] = T.aoColumns[p].asSorting[0];
            }
            if (
              (ie(T),
              pe(T, "aoDrawCallback", function () {
                (T.bSorted || "ssp" === me(T) || F.bDeferRender) && ie(T);
              }),
              (t = b.children("caption")),
              T.caption &&
                (0 === t.length && (t = e("<caption/>").appendTo(b)),
                t.html(T.caption)),
              t.length &&
                ((t[0]._captionSide = t.css("caption-side")),
                (T.captionNode = t[0])),
              0 === I.length && (I = e("<thead/>").appendTo(b)),
              (T.nTHead = I[0]),
              e("tr", I).addClass(_.thead.row),
              0 === (t = b.children("tbody")).length &&
                (t = e("<tbody/>").insertAfter(I)),
              (T.nTBody = t[0]),
              0 === (t = b.children("tfoot")).length &&
                (t = e("<tfoot/>").appendTo(b)),
              (T.nTFoot = t[0]),
              e("tr", t).addClass(_.tfoot.row),
              h.aaData)
            )
              for (p = 0; p < h.aaData.length; p++) y(T, h.aaData[p]);
            else "dom" == me(T) && D(T, e(T.nTBody).children("tr"));
            (T.aiDisplay = T.aiDisplayMaster.slice()),
              (T.bInitialised = !0),
              !1 === g && U(T);
          }),
            pe(T, "aoDrawCallback", se),
            h.bStateSave
              ? ((F.bStateSave = !0),
                (function (e, t, n) {
                  if (e.oFeatures.bStateSave)
                    return (
                      void 0 !==
                        (t = e.fnStateLoadCallback.call(
                          e.oInstance,
                          e,
                          function (t) {
                            ue(e, t, n);
                          }
                        )) && ue(e, t, n),
                      !0
                    );
                  n();
                })(T, h, f))
              : f();
        }
      }),
      (r = null),
      this
    );
  };
  (Ce.ext = Ie =
    {
      buttons: {},
      classes: {},
      builder: "dt/dt-2.0.0",
      errMode: "alert",
      feature: [],
      features: {},
      search: [],
      selector: { cell: [], column: [], row: [] },
      legacy: { ajax: null },
      pager: {},
      renderer: { pageButton: {}, header: {} },
      order: {},
      type: { className: {}, detect: [], render: {}, search: {}, order: {} },
      _unique: 0,
      fnVersionCheck: Ce.fnVersionCheck,
      iApiIndex: 0,
      sVersion: Ce.version,
    }),
    e.extend(Ie, {
      afnFiltering: Ie.search,
      aTypes: Ie.type.detect,
      ofnSearch: Ie.type.search,
      oSort: Ie.type.order,
      afnSortData: Ie.order,
      aoFeatures: Ie.feature,
      oStdClasses: Ie.classes,
      oPagination: Ie.pager,
    }),
    e.extend(Ce.ext.classes, {
      container: "dt-container",
      empty: { row: "dt-empty" },
      info: { container: "dt-info" },
      length: { container: "dt-length", select: "dt-input" },
      order: {
        canAsc: "dt-orderable-asc",
        canDesc: "dt-orderable-desc",
        isAsc: "dt-ordering-asc",
        isDesc: "dt-ordering-desc",
        none: "dt-orderable-none",
        position: "sorting_",
      },
      processing: { container: "dt-processing" },
      scrolling: {
        body: "dt-scroll-body",
        container: "dt-scroll",
        footer: { self: "dt-scroll-foot", inner: "dt-scroll-footInner" },
        header: { self: "dt-scroll-head", inner: "dt-scroll-headInner" },
      },
      search: { container: "dt-search", input: "dt-input" },
      table: "dataTable",
      tbody: { cell: "", row: "" },
      thead: { cell: "", row: "" },
      tfoot: { cell: "", row: "" },
      paging: {
        active: "current",
        button: "dt-paging-button",
        container: "dt-paging",
        disabled: "disabled",
      },
    });
  var Ie,
    Ae,
    Fe,
    Le = {},
    je = /[\r\n\u2028]/g,
    Ne = /<.*?>/g,
    Pe =
      /^\d{2,4}[./-]\d{1,2}[./-]\d{1,2}([T ]{1}\d{1,2}[:.]\d{2}([.:]\d{2})?)?$/,
    Re = RegExp(
      "(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\|\\$|\\^|\\-)",
      "g"
    ),
    Oe =
      /['\u00A0,$\u00a3\u20ac\u00a5%\u2009\u202F\u20BD\u20a9\u20BArfk\u0243\u039e]/gi,
    ke = function (e) {
      return !e || !0 === e || "-" === e;
    },
    Ee = function (e) {
      var t = parseInt(e, 10);
      return !isNaN(t) && isFinite(e) ? t : null;
    },
    Me = function (e, t) {
      return (
        Le[t] || (Le[t] = new RegExp(tt(t), "g")),
        "string" == typeof e && "." !== t
          ? e.replace(/\./g, "").replace(Le[t], ".")
          : e
      );
    },
    He = function (e, t, n) {
      var a = typeof e,
        r = "string" === a;
      return (
        !("number" !== a && "bigint" !== a && !ke(e)) ||
        (t && r && (e = Me(e, t)),
        n && r && (e = e.replace(Oe, "")),
        !isNaN(parseFloat(e)) && isFinite(e))
      );
    },
    We = function (e, t, n) {
      return (
        !!ke(e) ||
        ("string" == typeof e && e.match(/<(input|select)/i)
          ? null
          : ((ke(e) || "string" == typeof e) && !!He(Ue(e), t, n)) || null)
      );
    },
    Xe = function (e, t, n) {
      var a = [],
        r = 0,
        o = e.length;
      if (void 0 !== n)
        for (; r < o; r++) e[r] && e[r][t] && a.push(e[r][t][n]);
      else for (; r < o; r++) e[r] && a.push(e[r][t]);
      return a;
    },
    Ve = function (e, t, n, a) {
      var r = [],
        o = 0,
        i = t.length;
      if (void 0 !== a) for (; o < i; o++) e[t[o]][n] && r.push(e[t[o]][n][a]);
      else for (; o < i; o++) e[t[o]] && r.push(e[t[o]][n]);
      return r;
    },
    qe = function (e, t) {
      var n = [];
      if (void 0 === t) {
        t = 0;
        var a = e;
      } else (a = t), (t = e);
      for (var r = t; r < a; r++) n.push(r);
      return n;
    },
    Be = function (e) {
      for (var t = [], n = 0, a = e.length; n < a; n++) e[n] && t.push(e[n]);
      return t;
    },
    Ue = function (e) {
      return e.replace(Ne, "").replace(/<script/i, "");
    },
    $e = function (e) {
      return (
        Array.isArray(e) && (e = e.join(",")),
        "string" == typeof e
          ? e
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
          : e
      );
    },
    ze = function (e, t) {
      if ("string" != typeof e) return e;
      var n = e.normalize("NFD");
      return n.length !== e.length
        ? (!0 === t ? e + " " : "") + n.replace(/[\u0300-\u036f]/g, "")
        : n;
    },
    Ye = function (e) {
      if (Array.from && Set) return Array.from(new Set(e));
      e: {
        if (!(2 > e.length))
          for (
            var t = e.slice().sort(), n = t[0], a = 1, r = t.length;
            a < r;
            a++
          ) {
            if (t[a] === n) {
              t = !1;
              break e;
            }
            n = t[a];
          }
        t = !0;
      }
      if (t) return e.slice();
      (t = []), (r = e.length);
      var o,
        i = 0;
      a = 0;
      e: for (; a < r; a++) {
        for (n = e[a], o = 0; o < i; o++) if (t[o] === n) continue e;
        t.push(n), i++;
      }
      return t;
    },
    Ge = function (e, t) {
      if (Array.isArray(t)) for (var n = 0; n < t.length; n++) Ge(e, t[n]);
      else e.push(t);
      return e;
    };
  Ce.util = {
    diacritics: function (e, t) {
      if ("function" != typeof e) return ze(e, t);
      ze = e;
    },
    debounce: function (e, t) {
      var n;
      return function () {
        var a = this,
          r = arguments;
        clearTimeout(n),
          (n = setTimeout(function () {
            e.apply(a, r);
          }, t || 250));
      };
    },
    throttle: function (e, t) {
      var n,
        a,
        r = void 0 !== t ? t : 200;
      return function () {
        var t = this,
          o = +new Date(),
          i = arguments;
        n && o < n + r
          ? (clearTimeout(a),
            (a = setTimeout(function () {
              (n = void 0), e.apply(t, i);
            }, r)))
          : ((n = o), e.apply(t, i));
      };
    },
    escapeRegex: function (e) {
      return e.replace(Re, "\\$1");
    },
    set: function (t) {
      if (e.isPlainObject(t)) return Ce.util.set(t._);
      if (null === t) return function () {};
      if ("function" == typeof t)
        return function (e, n, a) {
          t(e, "set", n, a);
        };
      if (
        "string" != typeof t ||
        (-1 === t.indexOf(".") &&
          -1 === t.indexOf("[") &&
          -1 === t.indexOf("("))
      )
        return function (e, n) {
          e[t] = n;
        };
      var n = function (e, t, a) {
        for (
          var r, o, i = (a = w(a))[a.length - 1], l = 0, s = a.length - 1;
          l < s;
          l++
        ) {
          if ("__proto__" === a[l] || "constructor" === a[l])
            throw Error("Cannot set prototype values");
          if (((r = a[l].match(Ze)), (o = a[l].match(Qe)), r)) {
            if (
              ((a[l] = a[l].replace(Ze, "")),
              (e[a[l]] = []),
              (i = a.slice()).splice(0, l + 1),
              (r = i.join(".")),
              Array.isArray(t))
            )
              for (o = 0, s = t.length; o < s; o++)
                n((i = {}), t[o], r), e[a[l]].push(i);
            else e[a[l]] = t;
            return;
          }
          o && ((a[l] = a[l].replace(Qe, "")), (e = e[a[l]](t))),
            (null !== e[a[l]] && void 0 !== e[a[l]]) || (e[a[l]] = {}),
            (e = e[a[l]]);
        }
        i.match(Qe) ? e[i.replace(Qe, "")](t) : (e[i.replace(Ze, "")] = t);
      };
      return function (e, a) {
        return n(e, a, t);
      };
    },
    get: function (t) {
      if (e.isPlainObject(t)) {
        var n = {};
        return (
          e.each(t, function (e, t) {
            t && (n[e] = Ce.util.get(t));
          }),
          function (e, t, a, r) {
            var o = n[t] || n._;
            return void 0 !== o ? o(e, t, a, r) : e;
          }
        );
      }
      if (null === t)
        return function (e) {
          return e;
        };
      if ("function" == typeof t)
        return function (e, n, a, r) {
          return t(e, n, a, r);
        };
      if (
        "string" != typeof t ||
        (-1 === t.indexOf(".") &&
          -1 === t.indexOf("[") &&
          -1 === t.indexOf("("))
      )
        return function (e) {
          return e[t];
        };
      var a = function (e, t, n) {
        if ("" !== n)
          for (var r = w(n), o = 0, i = r.length; o < i; o++) {
            n = r[o].match(Ze);
            var l = r[o].match(Qe);
            if (n) {
              if (
                ((r[o] = r[o].replace(Ze, "")),
                "" !== r[o] && (e = e[r[o]]),
                (l = []),
                r.splice(0, o + 1),
                (r = r.join(".")),
                Array.isArray(e))
              )
                for (o = 0, i = e.length; o < i; o++) l.push(a(e[o], t, r));
              e =
                "" === (e = n[0].substring(1, n[0].length - 1)) ? l : l.join(e);
              break;
            }
            if (l) (r[o] = r[o].replace(Qe, "")), (e = e[r[o]]());
            else {
              if (null === e || null === e[r[o]]) return null;
              if (void 0 === e || void 0 === e[r[o]]) return;
              e = e[r[o]];
            }
          }
        return e;
      };
      return function (e, n) {
        return a(e, n, t);
      };
    },
    stripHtml: function (e) {
      var t = typeof e;
      if ("function" !== t) return "string" === t ? Ue(e) : e;
      Ue = e;
    },
    escapeHtml: function (e) {
      var t = typeof e;
      if ("function" !== t)
        return "string" === t || Array.isArray(e) ? $e(e) : e;
      $e = e;
    },
    unique: Ye,
  };
  var Je = function (e, t, n) {
      void 0 !== e[t] && (e[n] = e[t]);
    },
    Ze = /\[.*?\]$/,
    Qe = /\(\)$/,
    Ke = Ce.util.get,
    et = Ce.util.set,
    tt = Ce.util.escapeRegex,
    nt = e("<div>")[0],
    at = void 0 !== nt.textContent,
    rt = [],
    ot = Array.prototype,
    it = function (t, n) {
      if (!(this instanceof it)) return new it(t, n);
      var a = [],
        r = function (t) {
          (t = (function (t) {
            var n,
              a = Ce.settings,
              r = Xe(a, "nTable");
            return t
              ? t.nTable && t.oFeatures
                ? [t]
                : t.nodeName && "table" === t.nodeName.toLowerCase()
                  ? -1 !== (t = r.indexOf(t))
                    ? [a[t]]
                    : null
                  : t && "function" == typeof t.settings
                    ? t.settings().toArray()
                    : ("string" == typeof t
                        ? (n = e(t).get())
                        : t instanceof e && (n = t.get()),
                      n
                        ? a.filter(function (e, t) {
                            return n.includes(r[t]);
                          })
                        : void 0)
              : [];
          })(t)) && a.push.apply(a, t);
        };
      if (Array.isArray(t)) for (var o = 0, i = t.length; o < i; o++) r(t[o]);
      else r(t);
      (this.context = 1 < a.length ? Ye(a) : a),
        n && this.push.apply(this, n),
        (this.selector = { rows: null, cols: null, opts: null }),
        it.extend(this, this, rt);
    };
  (Ce.Api = it),
    e.extend(it.prototype, {
      any: function () {
        return 0 !== this.count();
      },
      context: [],
      count: function () {
        return this.flatten().length;
      },
      each: function (e) {
        for (var t = 0, n = this.length; t < n; t++)
          e.call(this, this[t], t, this);
        return this;
      },
      eq: function (e) {
        var t = this.context;
        return t.length > e ? new it(t[e], this[e]) : null;
      },
      filter: function (e) {
        return (e = ot.filter.call(this, e, this)), new it(this.context, e);
      },
      flatten: function () {
        var e = [];
        return new it(this.context, e.concat.apply(e, this.toArray()));
      },
      get: function (e) {
        return this[e];
      },
      join: ot.join,
      includes: function (e) {
        return -1 !== this.indexOf(e);
      },
      indexOf: ot.indexOf,
      iterator: function (e, t, n, a) {
        var r,
          o,
          i,
          l = [],
          s = this.context,
          u = this.selector;
        "string" == typeof e && ((a = n), (n = t), (t = e), (e = !1));
        var c = 0;
        for (r = s.length; c < r; c++) {
          var d = new it(s[c]);
          if ("table" === t) {
            var f = n.call(d, s[c], c);
            void 0 !== f && l.push(f);
          } else if ("columns" === t || "rows" === t)
            void 0 !== (f = n.call(d, s[c], this[c], c)) && l.push(f);
          else if (
            "every" === t ||
            "column" === t ||
            "column-rows" === t ||
            "row" === t ||
            "cell" === t
          ) {
            var h = this[c];
            "column-rows" === t && (i = ft(s[c], u.opts));
            var p = 0;
            for (o = h.length; p < o; p++)
              (f = h[p]),
                void 0 !==
                  (f =
                    "cell" === t
                      ? n.call(d, s[c], f.row, f.column, c, p)
                      : n.call(d, s[c], f, c, p, i)) && l.push(f);
          }
        }
        return l.length || a
          ? (((t = (e = new it(s, e ? l.concat.apply([], l) : l))
              .selector).rows = u.rows),
            (t.cols = u.cols),
            (t.opts = u.opts),
            e)
          : this;
      },
      lastIndexOf: ot.lastIndexOf,
      length: 0,
      map: function (e) {
        return (e = ot.map.call(this, e, this)), new it(this.context, e);
      },
      pluck: function (e) {
        var t = Ce.util.get(e);
        return this.map(function (e) {
          return t(e);
        });
      },
      pop: ot.pop,
      push: ot.push,
      reduce: ot.reduce,
      reduceRight: ot.reduceRight,
      reverse: ot.reverse,
      selector: null,
      shift: ot.shift,
      slice: function () {
        return new it(this.context, this);
      },
      sort: ot.sort,
      splice: ot.splice,
      toArray: function () {
        return ot.slice.call(this);
      },
      to$: function () {
        return e(this);
      },
      toJQuery: function () {
        return e(this);
      },
      unique: function () {
        return new it(this.context, Ye(this.toArray()));
      },
      unshift: ot.unshift,
    }),
    (t.__apiStruct = rt),
    (it.extend = function (e, t, n) {
      if (n.length && t && (t instanceof it || t.__dt_wrapper)) {
        var a,
          r = 0;
        for (a = n.length; r < a; r++) {
          var o = n[r];
          (t[o.name] =
            "function" === o.type
              ? De(e, o.val, o)
              : "object" === o.type
                ? {}
                : o.val),
            (t[o.name].__dt_wrapper = !0),
            it.extend(e, t[o.name], o.propExt);
        }
      }
    }),
    (it.register = Ae =
      function (t, n) {
        if (Array.isArray(t))
          for (var a = 0, r = t.length; a < r; a++) it.register(t[a], n);
        else {
          var o,
            i = t.split("."),
            l = rt;
          for (a = 0, r = i.length; a < r; a++) {
            var s = (o = -1 !== i[a].indexOf("()"))
              ? i[a].replace("()", "")
              : i[a];
            e: {
              for (var u = 0, c = l.length; u < c; u++)
                if (l[u].name === s) {
                  u = l[u];
                  break e;
                }
              u = null;
            }
            u ||
              ((u = {
                name: s,
                val: {},
                methodExt: [],
                propExt: [],
                type: "object",
              }),
              l.push(u)),
              a === r - 1
                ? ((u.val = n),
                  (u.type =
                    "function" == typeof n
                      ? "function"
                      : e.isPlainObject(n)
                        ? "object"
                        : "other"))
                : (l = o ? u.methodExt : u.propExt);
          }
        }
      }),
    (it.registerPlural = Fe =
      function (e, t, n) {
        it.register(e, n),
          it.register(t, function () {
            var e = n.apply(this, arguments);
            return e === this
              ? this
              : e instanceof it
                ? e.length
                  ? Array.isArray(e[0])
                    ? new it(e.context, e[0])
                    : e[0]
                  : void 0
                : e;
          });
      });
  var lt = function (t, n) {
    if (Array.isArray(t)) {
      var a = [];
      return (
        t.forEach(function (e) {
          (e = lt(e, n)), a.push.apply(a, e);
        }),
        a.filter(function (e) {
          return e;
        })
      );
    }
    if ("number" == typeof t) return [n[t]];
    var r = n.map(function (e) {
      return e.nTable;
    });
    return e(r)
      .filter(t)
      .map(function () {
        var e = r.indexOf(this);
        return n[e];
      })
      .toArray();
  };
  Ae("tables()", function (e) {
    return null != e ? new it(lt(e, this.context)) : this;
  }),
    Ae("table()", function (e) {
      var t = (e = this.tables(e)).context;
      return t.length ? new it(t[0]) : e;
    }),
    [
      ["nodes", "node", "nTable"],
      ["body", "body", "nTBody"],
      ["header", "header", "nTHead"],
      ["footer", "footer", "nTFoot"],
    ].forEach(function (e) {
      Fe("tables()." + e[0] + "()", "table()." + e[1] + "()", function () {
        return this.iterator(
          "table",
          function (t) {
            return t[e[2]];
          },
          1
        );
      });
    }),
    [
      ["header", "aoHeader"],
      ["footer", "aoFooter"],
    ].forEach(function (e) {
      Ae("table()." + e[0] + ".structure()", function (t) {
        t = this.columns(t).indexes().flatten();
        var n = this.context[0];
        return j(n, n[e[1]], t);
      });
    }),
    Fe("tables().containers()", "table().container()", function () {
      return this.iterator(
        "table",
        function (e) {
          return e.nTableWrapper;
        },
        1
      );
    }),
    Ae("tables().every()", function (e) {
      var t = this;
      return this.iterator("table", function (n, a) {
        e.call(t.table(a), a);
      });
    }),
    Ae("caption()", function (t, n) {
      var a = this.context;
      if (void 0 === t) {
        var r = a[0].captionNode;
        return r && a.length ? r.innerHTML : null;
      }
      return this.iterator(
        "table",
        function (a) {
          var r = e(a.nTable),
            o = e(a.captionNode),
            i = e(a.nTableWrapper);
          o.length ||
            ((o = e("<caption/>").html(t)),
            (a.captionNode = o[0]),
            n || (r.prepend(o), (n = o.css("caption-side")))),
            o.html(t),
            n && (o.css("caption-side", n), (o[0]._captionSide = n)),
            i.find("div.dataTables_scroll").length
              ? i
                  .find(
                    "div.dataTables_scroll" +
                      ("top" === n ? "Head" : "Foot") +
                      " table"
                  )
                  .prepend(o)
              : r.prepend(o);
        },
        1
      );
    }),
    Ae("caption.node()", function () {
      var e = this.context;
      return e.length ? e[0].captionNode : null;
    }),
    Ae("draw()", function (e) {
      return this.iterator("table", function (t) {
        "page" === e
          ? P(t)
          : ("string" == typeof e && (e = "full-hold" !== e), R(t, !1 === e));
      });
    }),
    Ae("page()", function (e) {
      return void 0 === e
        ? this.page.info().page
        : this.iterator("table", function (t) {
            Y(t, e);
          });
    }),
    Ae("page.info()", function () {
      if (0 !== this.context.length) {
        var e = this.context[0],
          t = e._iDisplayStart,
          n = e.oFeatures.bPaginate ? e._iDisplayLength : -1,
          a = e.fnRecordsDisplay(),
          r = -1 === n;
        return {
          page: r ? 0 : Math.floor(t / n),
          pages: r ? 1 : Math.ceil(a / n),
          start: t,
          end: e.fnDisplayEnd(),
          length: n,
          recordsTotal: e.fnRecordsTotal(),
          recordsDisplay: a,
          serverSide: "ssp" === me(e),
        };
      }
    }),
    Ae("page.len()", function (e) {
      return void 0 === e
        ? 0 !== this.context.length
          ? this.context[0]._iDisplayLength
          : void 0
        : this.iterator("table", function (t) {
            z(t, e);
          });
    });
  var st = function (e, t, n) {
    if (n) {
      var a = new it(e);
      a.one("draw", function () {
        n(a.ajax.json());
      });
    }
    if ("ssp" == me(e)) R(e, t);
    else {
      G(e, !0);
      var r = e.jqXHR;
      r && 4 !== r.readyState && r.abort(),
        W(e, {}, function (n) {
          T(e);
          for (var a = 0, r = (n = X(e, n)).length; a < r; a++) y(e, n[a]);
          R(e, t), $(e), G(e, !1);
        });
    }
  };
  Ae("ajax.json()", function () {
    var e = this.context;
    if (0 < e.length) return e[0].json;
  }),
    Ae("ajax.params()", function () {
      var e = this.context;
      if (0 < e.length) return e[0].oAjaxData;
    }),
    Ae("ajax.reload()", function (e, t) {
      return this.iterator("table", function (n) {
        st(n, !1 === t, e);
      });
    }),
    Ae("ajax.url()", function (t) {
      var n = this.context;
      if (void 0 === t) {
        if (0 === n.length) return;
        return (n = n[0]), e.isPlainObject(n.ajax) ? n.ajax.url : n.ajax;
      }
      return this.iterator("table", function (n) {
        e.isPlainObject(n.ajax) ? (n.ajax.url = t) : (n.ajax = t);
      });
    }),
    Ae("ajax.url().load()", function (e, t) {
      return this.iterator("table", function (n) {
        st(n, !1 === t, e);
      });
    });
  var ut = function (e, t, n, a, r) {
      var o,
        i,
        l = [],
        s = typeof t;
      for (
        (t && "string" !== s && "function" !== s && void 0 !== t.length) ||
          (t = [t]),
          s = 0,
          o = t.length;
        s < o;
        s++
      ) {
        var u =
            t[s] && t[s].split && !t[s].match(/[[(:]/)
              ? t[s].split(",")
              : [t[s]],
          c = 0;
        for (i = u.length; c < i; c++) {
          var d = n("string" == typeof u[c] ? u[c].trim() : u[c]);
          (d = d.filter(function (e) {
            return null != e;
          })) &&
            d.length &&
            (l = l.concat(d));
        }
      }
      if ((e = Ie.selector[e]).length)
        for (s = 0, o = e.length; s < o; s++) l = e[s](a, r, l);
      return Ye(l);
    },
    ct = function (t) {
      return (
        t || (t = {}),
        t.filter && void 0 === t.search && (t.search = t.filter),
        e.extend({ search: "none", order: "current", page: "all" }, t)
      );
    },
    dt = function (e) {
      var t = new it(e.context[0]);
      return (
        e.length && t.push(e[0]),
        (t.selector = e.selector),
        t.length && 1 < t[0].length && t[0].splice(1),
        t
      );
    },
    ft = function (e, t) {
      var n = [],
        a = e.aiDisplay,
        r = e.aiDisplayMaster,
        o = t.search,
        i = t.order,
        l = t.page;
      if ("ssp" == me(e)) return "removed" === o ? [] : qe(0, r.length);
      if ("current" == l)
        for (i = e._iDisplayStart, l = e.fnDisplayEnd(); i < l; i++)
          n.push(a[i]);
      else if ("current" == i || "applied" == i) {
        if ("none" == o) n = r.slice();
        else if ("applied" == o) n = a.slice();
        else if ("removed" == o) {
          var s = {};
          for (i = 0, l = a.length; i < l; i++) s[a[i]] = null;
          r.forEach(function (e) {
            Object.prototype.hasOwnProperty.call(s, e) || n.push(e);
          });
        }
      } else if ("index" == i || "original" == i)
        for (i = 0, l = e.aoData.length; i < l; i++)
          e.aoData[i] &&
            ("none" == o
              ? n.push(i)
              : ((-1 === (r = a.indexOf(i)) && "removed" == o) ||
                  (0 <= r && "applied" == o)) &&
                n.push(i));
      else if ("number" == typeof i)
        if (((l = re(e, i, "asc")), "none" === o)) n = l;
        else
          for (i = 0; i < l.length; i++)
            ((-1 === (r = a.indexOf(l[i])) && "removed" == o) ||
              (0 <= r && "applied" == o)) &&
              n.push(l[i]);
      return n;
    };
  Ae("rows()", function (t, n) {
    void 0 === t ? (t = "") : e.isPlainObject(t) && ((n = t), (t = "")),
      (n = ct(n));
    var a = this.iterator(
      "table",
      function (a) {
        return (function (t, n, a) {
          var r;
          if (
            ((n = ut(
              "row",
              n,
              function (n) {
                var o = Ee(n),
                  i = t.aoData;
                if (null !== o && !a) return [o];
                if ((r || (r = ft(t, a)), null !== o && -1 !== r.indexOf(o)))
                  return [o];
                if (null == n || "" === n) return r;
                if ("function" == typeof n)
                  return r.map(function (e) {
                    var t = i[e];
                    return n(e, t._aData, t.nTr) ? e : null;
                  });
                if (n.nodeName) {
                  o = n._DT_RowIndex;
                  var l = n._DT_CellIndex;
                  return void 0 !== o
                    ? i[o] && i[o].nTr === n
                      ? [o]
                      : []
                    : l
                      ? i[l.row] && i[l.row].nTr === n.parentNode
                        ? [l.row]
                        : []
                      : (o = e(n).closest("*[data-dt-row]")).length
                        ? [o.data("dt-row")]
                        : [];
                }
                return "string" == typeof n &&
                  "#" === n.charAt(0) &&
                  void 0 !== (o = t.aIds[n.replace(/^#/, "")])
                  ? [o.idx]
                  : ((o = Be(Ve(t.aoData, r, "nTr"))),
                    e(o)
                      .filter(n)
                      .map(function () {
                        return this._DT_RowIndex;
                      })
                      .toArray());
              },
              t,
              a
            )),
            "current" === a.order || "applied" === a.order)
          ) {
            var o = t.aiDisplayMaster;
            n.sort(function (e, t) {
              return o.indexOf(e) - o.indexOf(t);
            });
          }
          return n;
        })(a, t, n);
      },
      1
    );
    return (a.selector.rows = t), (a.selector.opts = n), a;
  }),
    Ae("rows().nodes()", function () {
      return this.iterator(
        "row",
        function (e, t) {
          return e.aoData[t].nTr || void 0;
        },
        1
      );
    }),
    Ae("rows().data()", function () {
      return this.iterator(
        !0,
        "rows",
        function (e, t) {
          return Ve(e.aoData, t, "_aData");
        },
        1
      );
    }),
    Fe("rows().cache()", "row().cache()", function (e) {
      return this.iterator(
        "row",
        function (t, n) {
          var a = t.aoData[n];
          return "search" === e ? a._aFilterData : a._aSortData;
        },
        1
      );
    }),
    Fe("rows().invalidate()", "row().invalidate()", function (e) {
      return this.iterator("row", function (t, n) {
        _(t, n, e);
      });
    }),
    Fe("rows().indexes()", "row().index()", function () {
      return this.iterator(
        "row",
        function (e, t) {
          return t;
        },
        1
      );
    }),
    Fe("rows().ids()", "row().id()", function (e) {
      for (var t = [], n = this.context, a = 0, r = n.length; a < r; a++)
        for (var o = 0, i = this[a].length; o < i; o++) {
          var l = n[a].rowIdFn(n[a].aoData[this[a][o]]._aData);
          t.push((!0 === e ? "#" : "") + l);
        }
      return new it(n, t);
    }),
    Fe("rows().remove()", "row().remove()", function () {
      return (
        this.iterator("row", function (e, t) {
          var n = e.aoData,
            a = n[t],
            r = e.aiDisplayMaster.indexOf(t);
          -1 !== r && e.aiDisplayMaster.splice(r, 1),
            -1 !== (r = e.aiDisplay.indexOf(t)) && e.aiDisplay.splice(r, 1),
            0 < e._iRecordsDisplay && e._iRecordsDisplay--,
            ve(e),
            void 0 !== (a = e.rowIdFn(a._aData)) && delete e.aIds[a],
            (n[t] = null);
        }),
        this
      );
    }),
    Ae("rows.add()", function (e) {
      var t = this.iterator(
          "table",
          function (t) {
            var n,
              a = [],
              r = 0;
            for (n = e.length; r < n; r++) {
              var o = e[r];
              o.nodeName && "TR" === o.nodeName.toUpperCase()
                ? a.push(D(t, o)[0])
                : a.push(y(t, o));
            }
            return a;
          },
          1
        ),
        n = this.rows(-1);
      return n.pop(), n.push.apply(n, t), n;
    }),
    Ae("row()", function (e, t) {
      return dt(this.rows(e, t));
    }),
    Ae("row().data()", function (e) {
      var t = this.context;
      if (void 0 === e)
        return t.length && this.length && this[0].length
          ? t[0].aoData[this[0]]._aData
          : void 0;
      var n = t[0].aoData[this[0]];
      return (
        (n._aData = e),
        Array.isArray(e) && n.nTr && n.nTr.id && et(t[0].rowId)(e, n.nTr.id),
        _(t[0], this[0], "data"),
        this
      );
    }),
    Ae("row().node()", function () {
      var e = this.context;
      return (
        (e.length &&
          this.length &&
          this[0].length &&
          e[0].aoData[this[0]].nTr) ||
        null
      );
    }),
    Ae("row.add()", function (t) {
      t instanceof e && t.length && (t = t[0]);
      var n = this.iterator("table", function (e) {
        return t.nodeName && "TR" === t.nodeName.toUpperCase()
          ? D(e, t)[0]
          : y(e, t);
      });
      return this.row(n[0]);
    }),
    e(n).on("plugin-init.dt", function (e, t) {
      var n = new it(t);
      n.on("stateSaveParams.DT", function (e, t, n) {
        e = t.rowIdFn;
        for (var a = t.aiDisplayMaster, r = [], o = 0; o < a.length; o++) {
          var i = t.aoData[a[o]];
          i._detailsShow && r.push("#" + e(i._aData));
        }
        n.childRows = r;
      }),
        n.on("stateLoaded.DT", function (e, t, a) {
          ht(n, a);
        }),
        ht(n, n.state.loaded());
    });
  var ht = function (e, t) {
      t &&
        t.childRows &&
        e
          .rows(
            t.childRows.map(function (e) {
              return e.replace(/:/g, "\\:");
            })
          )
          .every(function () {
            ge(e.settings()[0], null, "requestChild", [this]);
          });
    },
    pt = Ce.util.throttle(function (e) {
      se(e[0]);
    }, 500),
    gt = function (t, n) {
      var a = t.context;
      if (a.length) {
        var r = a[0].aoData[void 0 !== n ? n : t[0]];
        r &&
          r._details &&
          (r._details.remove(),
          (r._detailsShow = void 0),
          (r._details = void 0),
          e(r.nTr).removeClass("dt-hasChild"),
          pt(a));
      }
    },
    vt = function (t, n) {
      var a = t.context;
      if (a.length && t.length) {
        var r = a[0].aoData[t[0]];
        r._details &&
          ((r._detailsShow = n)
            ? (r._details.insertAfter(r.nTr), e(r.nTr).addClass("dt-hasChild"))
            : (r._details.detach(), e(r.nTr).removeClass("dt-hasChild")),
          ge(a[0], null, "childRow", [n, t.row(t[0])]),
          bt(a[0]),
          pt(a));
      }
    },
    bt = function (t) {
      var n = new it(t),
        a = t.aoData;
      n.off(
        "draw.dt.DT_details column-sizing.dt.DT_details destroy.dt.DT_details"
      ),
        0 < Xe(a, "_details").length &&
          (n.on("draw.dt.DT_details", function (e, r) {
            t === r &&
              n
                .rows({ page: "current" })
                .eq(0)
                .each(function (e) {
                  (e = a[e])._detailsShow && e._details.insertAfter(e.nTr);
                });
          }),
          n.on("column-sizing.dt.DT_details", function (n, r) {
            if (t === r)
              for (var o, i = h(r), l = 0, s = a.length; l < s; l++)
                (o = a[l])._details &&
                  o._details.each(function () {
                    var t = e(this).children("td");
                    1 == t.length && t.attr("colspan", i);
                  });
          }),
          n.on("destroy.dt.DT_details", function (e, r) {
            if (t === r)
              for (var o = 0, i = a.length; o < i; o++)
                a[o]._details && gt(n, o);
          }));
    };
  Ae("row().child()", function (t, n) {
    var a = this.context;
    return void 0 === t
      ? a.length && this.length
        ? a[0].aoData[this[0]]._details
        : void 0
      : (!0 === t
          ? this.child.show()
          : !1 === t
            ? gt(this)
            : a.length &&
              this.length &&
              (function (t, n, a, r) {
                var o = [],
                  i = function (a, r) {
                    if (Array.isArray(a) || a instanceof e)
                      for (var l = 0, s = a.length; l < s; l++) i(a[l], r);
                    else
                      a.nodeName && "tr" === a.nodeName.toLowerCase()
                        ? (a.setAttribute("data-dt-row", n.idx), o.push(a))
                        : ((l = e("<tr><td></td></tr>")
                            .attr("data-dt-row", n.idx)
                            .addClass(r)),
                          (e("td", l).addClass(r).html(a)[0].colSpan = h(t)),
                          o.push(l[0]));
                  };
                i(a, r),
                  n._details && n._details.detach(),
                  (n._details = e(o)),
                  n._detailsShow && n._details.insertAfter(n.nTr);
              })(a[0], a[0].aoData[this[0]], t, n),
        this);
  }),
    Ae(["row().child.show()", "row().child().show()"], function () {
      return vt(this, !0), this;
    }),
    Ae(["row().child.hide()", "row().child().hide()"], function () {
      return vt(this, !1), this;
    }),
    Ae(["row().child.remove()", "row().child().remove()"], function () {
      return gt(this), this;
    }),
    Ae("row().child.isShown()", function () {
      var e = this.context;
      return (
        (e.length && this.length && e[0].aoData[this[0]]._detailsShow) || !1
      );
    });
  var mt = /^([^:]+):(name|title|visIdx|visible)$/,
    yt = function (e, t, n, a, r, o) {
      (n = []), (a = 0);
      for (var i = r.length; a < i; a++) n.push(x(e, r[a], t, o));
      return n;
    };
  Ae("columns()", function (t, n) {
    void 0 === t ? (t = "") : e.isPlainObject(t) && ((n = t), (t = "")),
      (n = ct(n));
    var a = this.iterator(
      "table",
      function (a) {
        return (function (t, n, a) {
          var r = t.aoColumns,
            o = Xe(r, "sName"),
            i = Xe(r, "sTitle"),
            l = Ce.util.get("[].[].cell")(t.aoHeader),
            s = Ye(Ge([], l));
          return ut(
            "column",
            n,
            function (n) {
              var l = Ee(n);
              if ("" === n) return qe(r.length);
              if (null !== l) return [0 <= l ? l : r.length + l];
              if ("function" == typeof n) {
                var u = ft(t, a);
                return r.map(function (e, a) {
                  return n(a, yt(t, a, 0, 0, u)) ? a : null;
                });
              }
              var c = "string" == typeof n ? n.match(mt) : "";
              if (c)
                switch (c[2]) {
                  case "visIdx":
                  case "visible":
                    if (0 > (l = parseInt(c[1], 10))) {
                      var f = r.map(function (e, t) {
                        return e.bVisible ? t : null;
                      });
                      return [f[f.length + l]];
                    }
                    return [d(t, l)];
                  case "name":
                    return o.map(function (e, t) {
                      return e === c[1] ? t : null;
                    });
                  case "title":
                    return i.map(function (e, t) {
                      return e === c[1] ? t : null;
                    });
                  default:
                    return [];
                }
              return n.nodeName && n._DT_CellIndex
                ? [n._DT_CellIndex.column]
                : (l = e(s)
                      .filter(n)
                      .map(function () {
                        return m(this);
                      })
                      .toArray()).length || !n.nodeName
                  ? l
                  : (l = e(n).closest("*[data-dt-column]")).length
                    ? [l.data("dt-column")]
                    : [];
            },
            t,
            a
          );
        })(a, t, n);
      },
      1
    );
    return (a.selector.cols = t), (a.selector.opts = n), a;
  }),
    Fe("columns().header()", "column().header()", function (e) {
      return this.iterator(
        "column",
        function (t, n) {
          var a = t.aoHeader;
          return a[void 0 !== e ? e : t.bSortCellsTop ? 0 : a.length - 1][n]
            .cell;
        },
        1
      );
    }),
    Fe("columns().footer()", "column().footer()", function (e) {
      return this.iterator(
        "column",
        function (t, n) {
          return t.aoFooter.length
            ? t.aoFooter[void 0 !== e ? e : 0][n].cell
            : null;
        },
        1
      );
    }),
    Fe("columns().data()", "column().data()", function () {
      return this.iterator("column-rows", yt, 1);
    }),
    Fe("columns().render()", "column().render()", function (e) {
      return this.iterator(
        "column-rows",
        function (t, n, a, r, o) {
          return yt(t, n, a, r, o, e);
        },
        1
      );
    }),
    Fe("columns().dataSrc()", "column().dataSrc()", function () {
      return this.iterator(
        "column",
        function (e, t) {
          return e.aoColumns[t].mData;
        },
        1
      );
    }),
    Fe("columns().cache()", "column().cache()", function (e) {
      return this.iterator(
        "column-rows",
        function (t, n, a, r, o) {
          return Ve(
            t.aoData,
            o,
            "search" === e ? "_aFilterData" : "_aSortData",
            n
          );
        },
        1
      );
    }),
    Fe("columns().init()", "column().init()", function () {
      return this.iterator(
        "column",
        function (e, t) {
          return e.aoColumns[t];
        },
        1
      );
    }),
    Fe("columns().nodes()", "column().nodes()", function () {
      return this.iterator(
        "column-rows",
        function (e, t, n, a, r) {
          return Ve(e.aoData, r, "anCells", t);
        },
        1
      );
    }),
    Fe("columns().titles()", "column().title()", function (t, n) {
      return this.iterator(
        "column",
        function (a, r) {
          "number" == typeof t && ((n = t), (t = void 0));
          var o = e("span.dt-column-title", this.column(r).header(n));
          return void 0 !== t ? (o.html(t), this) : o.html();
        },
        1
      );
    }),
    Fe("columns().types()", "column().type()", function () {
      return this.iterator(
        "column",
        function (e, t) {
          var n = e.aoColumns[t].sType;
          return n || g(e), n;
        },
        1
      );
    }),
    Fe("columns().visible()", "column().visible()", function (t, n) {
      var a = this,
        r = [],
        o = this.iterator("column", function (n, a) {
          if (void 0 === t) return n.aoColumns[a].bVisible;
          var o,
            i = n.aoColumns,
            l = i[a],
            s = n.aoData;
          if (void 0 === t) l = l.bVisible;
          else if (l.bVisible === t) l = !1;
          else {
            if (t) {
              var u = Xe(i, "bVisible").indexOf(!0, a + 1),
                c = 0;
              for (o = s.length; c < o; c++)
                if (s[c]) {
                  var d = s[c].nTr;
                  (i = s[c].anCells), d && d.insertBefore(i[a], i[u] || null);
                }
            } else e(Xe(n.aoData, "anCells", a)).detach();
            (l.bVisible = t), ee(n), (l = !0);
          }
          l && r.push(a);
        });
      return (
        void 0 !== t &&
          this.iterator("table", function (o) {
            N(o, o.aoHeader),
              N(o, o.aoFooter),
              o.aiDisplay.length ||
                e(o.nTBody).find("td[colspan]").attr("colspan", h(o)),
              se(o),
              a.iterator("column", function (e, a) {
                r.includes(a) && ge(e, null, "column-visibility", [e, a, t, n]);
              }),
              r.length && (void 0 === n || n) && a.columns.adjust();
          }),
        o
      );
    }),
    Fe("columns().widths()", "column().width()", function () {
      var t = this.columns(":visible").count();
      (t = e("<tr>").html("<td>" + Array(t).join("</td><td>") + "</td>")),
        e(this.table().body()).append(t);
      var n = t.children().map(function () {
        return e(this).outerWidth();
      });
      return (
        t.remove(),
        this.iterator(
          "column",
          function (e, t) {
            var a = f(e, t);
            return null !== a ? n[a] : 0;
          },
          1
        )
      );
    }),
    Fe("columns().indexes()", "column().index()", function (e) {
      return this.iterator(
        "column",
        function (t, n) {
          return "visible" === e ? f(t, n) : n;
        },
        1
      );
    }),
    Ae("columns.adjust()", function () {
      return this.iterator(
        "table",
        function (e) {
          c(e);
        },
        1
      );
    }),
    Ae("column.index()", function (e, t) {
      if (0 !== this.context.length) {
        var n = this.context[0];
        if ("fromVisible" === e || "toData" === e) return d(n, t);
        if ("fromData" === e || "toVisible" === e) return f(n, t);
      }
    }),
    Ae("column()", function (e, t) {
      return dt(this.columns(e, t));
    });
  Ae("cells()", function (t, n, a) {
    if (
      (e.isPlainObject(t) &&
        (void 0 === t.row ? ((a = t), (t = null)) : ((a = n), (n = null))),
      e.isPlainObject(n) && ((a = n), (n = null)),
      null == n)
    )
      return this.iterator("table", function (n) {
        return (function (t, n, a) {
          var r,
            o,
            i,
            l,
            s,
            u,
            c,
            d = t.aoData,
            f = ft(t, a),
            h = Be(Ve(d, f, "anCells")),
            p = e(Ge([], h)),
            g = t.aoColumns.length;
          return ut(
            "cell",
            n,
            function (n) {
              var a = "function" == typeof n;
              if (null == n || a) {
                for (o = [], i = 0, l = f.length; i < l; i++)
                  for (r = f[i], s = 0; s < g; s++)
                    (u = { row: r, column: s }),
                      a
                        ? ((c = d[r]),
                          n(u, x(t, r, s), c.anCells ? c.anCells[s] : null) &&
                            o.push(u))
                        : o.push(u);
                return o;
              }
              return e.isPlainObject(n)
                ? void 0 !== n.column &&
                  void 0 !== n.row &&
                  -1 !== f.indexOf(n.row)
                  ? [n]
                  : []
                : (a = p
                      .filter(n)
                      .map(function (e, t) {
                        return {
                          row: t._DT_CellIndex.row,
                          column: t._DT_CellIndex.column,
                        };
                      })
                      .toArray()).length || !n.nodeName
                  ? a
                  : (c = e(n).closest("*[data-dt-row]")).length
                    ? [{ row: c.data("dt-row"), column: c.data("dt-column") }]
                    : [];
            },
            t,
            a
          );
        })(n, t, ct(a));
      });
    var r,
      o,
      i,
      l,
      s = a ? { page: a.page, order: a.order, search: a.search } : {},
      u = this.columns(n, s),
      c = this.rows(t, s);
    return (
      (s = this.iterator(
        "table",
        function (e, t) {
          var n = [];
          for (r = 0, o = c[t].length; r < o; r++)
            for (i = 0, l = u[t].length; i < l; i++)
              n.push({ row: c[t][r], column: u[t][i] });
          return n;
        },
        1
      )),
      (s = a && a.selected ? this.cells(s, a) : s),
      e.extend(s.selector, { cols: n, rows: t, opts: a }),
      s
    );
  }),
    Fe("cells().nodes()", "cell().node()", function () {
      return this.iterator(
        "cell",
        function (e, t, n) {
          return (e = e.aoData[t]) && e.anCells ? e.anCells[n] : void 0;
        },
        1
      );
    }),
    Ae("cells().data()", function () {
      return this.iterator(
        "cell",
        function (e, t, n) {
          return x(e, t, n);
        },
        1
      );
    }),
    Fe("cells().cache()", "cell().cache()", function (e) {
      return (
        (e = "search" === e ? "_aFilterData" : "_aSortData"),
        this.iterator(
          "cell",
          function (t, n, a) {
            return t.aoData[n][e][a];
          },
          1
        )
      );
    }),
    Fe("cells().render()", "cell().render()", function (e) {
      return this.iterator(
        "cell",
        function (t, n, a) {
          return x(t, n, a, e);
        },
        1
      );
    }),
    Fe("cells().indexes()", "cell().index()", function () {
      return this.iterator(
        "cell",
        function (e, t, n) {
          return { row: t, column: n, columnVisible: f(e, n) };
        },
        1
      );
    }),
    Fe("cells().invalidate()", "cell().invalidate()", function (e) {
      return this.iterator("cell", function (t, n, a) {
        _(t, n, e, a);
      });
    }),
    Ae("cell()", function (e, t, n) {
      return dt(this.cells(e, t, n));
    }),
    Ae("cell().data()", function (e) {
      var t = this.context,
        n = this[0];
      if (void 0 === e)
        return t.length && n.length ? x(t[0], n[0].row, n[0].column) : void 0;
      var a = t[0],
        r = n[0].row,
        o = n[0].column;
      return (
        a.aoColumns[o].fnSetData(a.aoData[r]._aData, e, {
          settings: a,
          row: r,
          col: o,
        }),
        _(t[0], n[0].row, "data", n[0].column),
        this
      );
    }),
    Ae("order()", function (e, t) {
      var n = this.context,
        a = Array.prototype.slice.call(arguments);
      return void 0 === e
        ? 0 !== n.length
          ? n[0].aaSorting
          : void 0
        : ("number" == typeof e ? (e = [[e, t]]) : 1 < a.length && (e = a),
          this.iterator("table", function (t) {
            t.aaSorting = Array.isArray(e) ? e.slice() : e;
          }));
    }),
    Ae("order.listener()", function (e, t, n) {
      return this.iterator("table", function (a) {
        te(a, e, {}, t, n);
      });
    }),
    Ae("order.fixed()", function (t) {
      if (!t) {
        var n = this.context;
        return (
          (n = n.length ? n[0].aaSortingFixed : void 0),
          Array.isArray(n) ? { pre: n } : n
        );
      }
      return this.iterator("table", function (n) {
        n.aaSortingFixed = e.extend(!0, {}, t);
      });
    }),
    Ae(["columns().order()", "column().order()"], function (e) {
      var t = this;
      return e
        ? this.iterator("table", function (n, a) {
            n.aaSorting = t[a].map(function (t) {
              return [t, e];
            });
          })
        : this.iterator(
            "column",
            function (e, t) {
              for (var n = ae(e), a = 0, r = n.length; a < r; a++)
                if (n[a].col === t) return n[a].dir;
              return null;
            },
            1
          );
    }),
    Fe("columns().orderable()", "column().orderable()", function (e) {
      return this.iterator(
        "column",
        function (t, n) {
          var a = t.aoColumns[n];
          return e ? a.asSorting : a.bSortable;
        },
        1
      );
    }),
    Ae("processing()", function (e) {
      return this.iterator("table", function (t) {
        G(t, e);
      });
    }),
    Ae("search()", function (t, n, a, r) {
      var o = this.context;
      return void 0 === t
        ? 0 !== o.length
          ? o[0].oPreviousSearch.search
          : void 0
        : this.iterator("table", function (o) {
            o.oFeatures.bFilter &&
              q(
                o,
                "object" == typeof n
                  ? e.extend(o.oPreviousSearch, n, { search: t })
                  : e.extend(o.oPreviousSearch, {
                      search: t,
                      regex: null !== n && n,
                      smart: null === a || a,
                      caseInsensitive: null === r || r,
                    })
              );
          });
    }),
    Ae("search.fixed()", function (e, t) {
      var n = this.iterator(!0, "table", function (n) {
        return (
          (n = n.searchFixed),
          e
            ? void 0 === t
              ? n[e]
              : (null === t ? delete n[e] : (n[e] = t), this)
            : Object.keys(n)
        );
      });
      return void 0 !== e && void 0 === t ? n[0] : n;
    }),
    Fe("columns().search()", "column().search()", function (t, n, a, r) {
      return this.iterator("column", function (o, i) {
        var l = o.aoPreSearchCols;
        if (void 0 === t) return l[i].search;
        o.oFeatures.bFilter &&
          ("object" == typeof n
            ? e.extend(l[i], n, { search: t })
            : e.extend(l[i], {
                search: t,
                regex: null !== n && n,
                smart: null === a || a,
                caseInsensitive: null === r || r,
              }),
          q(o, o.oPreviousSearch));
      });
    }),
    Ae(
      ["columns().search.fixed()", "column().search.fixed()"],
      function (e, t) {
        var n = this.iterator(!0, "column", function (n, a) {
          var r = n.aoColumns[a].searchFixed;
          return e
            ? void 0 === t
              ? r[e]
              : (null === t ? delete r[e] : (r[e] = t), this)
            : Object.keys(r);
        });
        return void 0 !== e && void 0 === t ? n[0] : n;
      }
    ),
    Ae("state()", function (t, n) {
      if (!t) return this.context.length ? this.context[0].oSavedState : null;
      var a = e.extend(!0, {}, t);
      return this.iterator("table", function (e) {
        !1 !== n && (a.time = +new Date() + 100), ue(e, a, function () {});
      });
    }),
    Ae("state.clear()", function () {
      return this.iterator("table", function (e) {
        e.fnStateSaveCallback.call(e.oInstance, e, {});
      });
    }),
    Ae("state.loaded()", function () {
      return this.context.length ? this.context[0].oLoadedState : null;
    }),
    Ae("state.save()", function () {
      return this.iterator("table", function (e) {
        se(e);
      });
    }),
    (Ce.use = function (a, r) {
      "lib" === r || a.fn
        ? (e = a)
        : "win" == r || a.document
          ? ((t = a), (n = a.document))
          : ("datetime" !== r && "DateTime" !== a.type) || (Ce.DateTime = a);
    }),
    (Ce.factory = function (a, r) {
      var o = !1;
      return (
        a && a.document && ((t = a), (n = a.document)),
        r && r.fn && r.fn.jquery && ((e = r), (o = !0)),
        o
      );
    }),
    (Ce.versionCheck = function (e, t) {
      for (
        var n,
          a,
          r = t ? t.split(".") : Ce.version.split("."),
          o = e.split("."),
          i = 0,
          l = o.length;
        i < l;
        i++
      )
        if ((n = parseInt(r[i], 10) || 0) !== (a = parseInt(o[i], 10) || 0))
          return n > a;
      return !0;
    }),
    (Ce.isDataTable = function (t) {
      var n = e(t).get(0),
        a = !1;
      return (
        t instanceof Ce.Api ||
        (e.each(Ce.settings, function (t, r) {
          var o = r.nScrollHead ? e("table", r.nScrollHead)[0] : null,
            i = r.nScrollFoot ? e("table", r.nScrollFoot)[0] : null;
          (r.nTable !== n && o !== n && i !== n) || (a = !0);
        }),
        a)
      );
    }),
    (Ce.tables = function (t) {
      var n = !1;
      e.isPlainObject(t) && ((n = t.api), (t = t.visible));
      var a = Ce.settings
        .filter(function (n) {
          return !!(!t || (t && e(n.nTable).is(":visible")));
        })
        .map(function (e) {
          return e.nTable;
        });
      return n ? new it(a) : a;
    }),
    (Ce.camelToHungarian = o),
    Ae("$()", function (t, n) {
      var a = this.rows(n).nodes();
      return (
        (a = e(a)), e([].concat(a.filter(t).toArray(), a.find(t).toArray()))
      );
    }),
    e.each(["on", "one", "off"], function (t, n) {
      Ae(n + "()", function () {
        var t = Array.prototype.slice.call(arguments);
        t[0] = t[0]
          .split(/\s/)
          .map(function (e) {
            return e.match(/\.dt\b/) ? e : e + ".dt";
          })
          .join(" ");
        var a = e(this.tables().nodes());
        return a[n].apply(a, t), this;
      });
    }),
    Ae("clear()", function () {
      return this.iterator("table", function (e) {
        T(e);
      });
    }),
    Ae("error()", function (e) {
      return this.iterator("table", function (t) {
        ce(t, 0, e);
      });
    }),
    Ae("settings()", function () {
      return new it(this.context, this.context);
    }),
    Ae("init()", function () {
      var e = this.context;
      return e.length ? e[0].oInit : null;
    }),
    Ae("data()", function () {
      return this.iterator("table", function (e) {
        return Xe(e.aoData, "_aData");
      }).flatten();
    }),
    Ae("trigger()", function (e, t, n) {
      return this.iterator("table", function (a) {
        return ge(a, null, e, t, n);
      }).flatten();
    }),
    Ae("ready()", function (e) {
      var t = this.context;
      return e
        ? this.tables().every(function () {
            this.context[0]._bInitComplete
              ? e.call(this)
              : this.on("init", function () {
                  e.call(this);
                });
          })
        : t.length
          ? t[0]._bInitComplete || !1
          : null;
    }),
    Ae("destroy()", function (n) {
      return (
        (n = n || !1),
        this.iterator("table", function (a) {
          var r = a.oClasses,
            o = a.nTable,
            i = a.nTBody,
            l = a.nTHead,
            s = a.nTFoot,
            u = e(o),
            c = e(i);
          i = e(a.nTableWrapper);
          var d = a.aoData.map(function (e) {
              return e ? e.nTr : null;
            }),
            f = r.order;
          (a.bDestroying = !0),
            ge(a, "aoDestroyCallback", "destroy", [a], !0),
            n || new it(a).columns().visible(!0),
            i.off(".DT").find(":not(tbody *)").off(".DT"),
            e(t).off(".DT-" + a.sInstance),
            o != l.parentNode && (u.children("thead").detach(), u.append(l)),
            s &&
              o != s.parentNode &&
              (u.children("tfoot").detach(), u.append(s)),
            (a.aaSorting = []),
            (a.aaSortingFixed = []),
            ie(a),
            e("th, td", l)
              .removeClass(
                f.canAsc + " " + f.canDesc + " " + f.isAsc + " " + f.isDesc
              )
              .css("width", ""),
            c.children().detach(),
            c.append(d),
            (l = a.nTableWrapper.parentNode),
            (s = a.nTableWrapper.nextSibling),
            u[(c = n ? "remove" : "detach")](),
            i[c](),
            !n &&
              l &&
              (l.insertBefore(o, s),
              u.css("width", a.sDestroyWidth).removeClass(r.table)),
            -1 !== (a = Ce.settings.indexOf(a)) && Ce.settings.splice(a, 1);
        })
      );
    }),
    e.each(["column", "row", "cell"], function (e, t) {
      Ae(t + "s().every()", function (e) {
        var n,
          a = this.selector.opts,
          r = this,
          o = 0;
        return this.iterator("every", function (i, l, s) {
          (n = r[t](l, a)),
            "cell" === t
              ? e.call(n, n[0][0].row, n[0][0].column, s, o)
              : e.call(n, l, s, o),
            o++;
        });
      });
    }),
    Ae("i18n()", function (t, n, a) {
      var r = this.context[0];
      return (
        void 0 === (t = Ke(t)(r.oLanguage)) && (t = n),
        e.isPlainObject(t) &&
          (t = void 0 !== a && void 0 !== t[a] ? t[a] : t._),
        "string" == typeof t ? t.replace("%d", a) : t
      );
    }),
    (Ce.version = "2.0.0"),
    (Ce.settings = []),
    (Ce.models = {}),
    (Ce.models.oSearch = {
      caseInsensitive: !0,
      search: "",
      regex: !1,
      smart: !0,
      return: !1,
    }),
    (Ce.models.oRow = {
      nTr: null,
      anCells: null,
      _aData: [],
      _aSortData: null,
      _aFilterData: null,
      _sFilterRow: null,
      src: null,
      idx: -1,
      displayData: null,
    }),
    (Ce.models.oColumn = {
      idx: null,
      aDataSort: null,
      asSorting: null,
      bSearchable: null,
      bSortable: null,
      bVisible: null,
      _sManualType: null,
      _bAttrSrc: !1,
      fnCreatedCell: null,
      fnGetData: null,
      fnSetData: null,
      mData: null,
      mRender: null,
      sClass: null,
      sContentPadding: null,
      sDefaultContent: null,
      sName: null,
      sSortDataType: "std",
      sSortingClass: null,
      sTitle: null,
      sType: null,
      sWidth: null,
      sWidthOrig: null,
      maxLenString: null,
      searchFixed: null,
    }),
    (Ce.defaults = {
      aaData: null,
      aaSorting: [[0, "asc"]],
      aaSortingFixed: [],
      ajax: null,
      aLengthMenu: [10, 25, 50, 100],
      aoColumns: null,
      aoColumnDefs: null,
      aoSearchCols: [],
      bAutoWidth: !0,
      bDeferRender: !0,
      bDestroy: !1,
      bFilter: !0,
      bInfo: !0,
      bLengthChange: !0,
      bPaginate: !0,
      bProcessing: !1,
      bRetrieve: !1,
      bScrollCollapse: !1,
      bServerSide: !1,
      bSort: !0,
      bSortMulti: !0,
      bSortCellsTop: null,
      bSortClasses: !0,
      bStateSave: !1,
      fnCreatedRow: null,
      fnDrawCallback: null,
      fnFooterCallback: null,
      fnFormatNumber: function (e) {
        return e
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, this.oLanguage.sThousands);
      },
      fnHeaderCallback: null,
      fnInfoCallback: null,
      fnInitComplete: null,
      fnPreDrawCallback: null,
      fnRowCallback: null,
      fnStateLoadCallback: function (e) {
        try {
          return JSON.parse(
            (-1 === e.iStateDuration ? sessionStorage : localStorage).getItem(
              "DataTables_" + e.sInstance + "_" + location.pathname
            )
          );
        } catch (e) {
          return {};
        }
      },
      fnStateLoadParams: null,
      fnStateLoaded: null,
      fnStateSaveCallback: function (e, t) {
        try {
          (-1 === e.iStateDuration ? sessionStorage : localStorage).setItem(
            "DataTables_" + e.sInstance + "_" + location.pathname,
            JSON.stringify(t)
          );
        } catch (e) {}
      },
      fnStateSaveParams: null,
      iStateDuration: 7200,
      iDisplayLength: 10,
      iDisplayStart: 0,
      iTabIndex: 0,
      oClasses: {},
      oLanguage: {
        oAria: {
          orderable: ": Activate to sort",
          orderableReverse: ": Activate to invert sorting",
          orderableRemove: ": Activate to remove sorting",
          paginate: {
            first: "First",
            last: "Last",
            next: "Next",
            previous: "Previous",
          },
        },
        oPaginate: { sFirst: "«", sLast: "»", sNext: "›", sPrevious: "‹" },
        entries: { _: "entries", 1: "entry" },
        sEmptyTable: "No data available in table",
        sInfo: "Showing _START_ to _END_ of _TOTAL_ _ENTRIES-TOTAL_",
        sInfoEmpty: "Showing 0 to 0 of 0 _ENTRIES-TOTAL_",
        sInfoFiltered: "(filtered from _MAX_ total _ENTRIES-MAX_)",
        sInfoPostFix: "",
        sDecimal: "",
        sThousands: ",",
        sLengthMenu: "_MENU_ _ENTRIES_ per page",
        sLoadingRecords: "Loading...",
        sProcessing: "",
        sSearch: "Search:",
        sSearchPlaceholder: "",
        sUrl: "",
        sZeroRecords: "No matching records found",
      },
      oSearch: e.extend({}, Ce.models.oSearch),
      layout: {
        topStart: "pageLength",
        topEnd: "search",
        bottomStart: "info",
        bottomEnd: "paging",
      },
      sDom: null,
      searchDelay: null,
      sPaginationType: "full_numbers",
      sScrollX: "",
      sScrollXInner: "",
      sScrollY: "",
      sServerMethod: "GET",
      renderer: null,
      rowId: "DT_RowId",
      caption: null,
    }),
    r(Ce.defaults),
    (Ce.defaults.column = {
      aDataSort: null,
      iDataSort: -1,
      ariaTitle: "",
      asSorting: ["asc", "desc", ""],
      bSearchable: !0,
      bSortable: !0,
      bVisible: !0,
      fnCreatedCell: null,
      mData: null,
      mRender: null,
      sCellType: "td",
      sClass: "",
      sContentPadding: "",
      sDefaultContent: null,
      sName: "",
      sSortDataType: "std",
      sTitle: null,
      sType: null,
      sWidth: null,
    }),
    r(Ce.defaults.column),
    (Ce.models.oSettings = {
      oFeatures: {
        bAutoWidth: null,
        bDeferRender: null,
        bFilter: null,
        bInfo: !0,
        bLengthChange: !0,
        bPaginate: null,
        bProcessing: null,
        bServerSide: null,
        bSort: null,
        bSortMulti: null,
        bSortClasses: null,
        bStateSave: null,
      },
      oScroll: {
        bCollapse: null,
        iBarWidth: 0,
        sX: null,
        sXInner: null,
        sY: null,
      },
      oLanguage: { fnInfoCallback: null },
      oBrowser: { bScrollbarLeft: !1, barWidth: 0 },
      ajax: null,
      aanFeatures: [],
      aoData: [],
      aiDisplay: [],
      aiDisplayMaster: [],
      aIds: {},
      aoColumns: [],
      aoHeader: [],
      aoFooter: [],
      oPreviousSearch: {},
      searchFixed: {},
      aoPreSearchCols: [],
      aaSorting: null,
      aaSortingFixed: [],
      sDestroyWidth: 0,
      aoRowCallback: [],
      aoHeaderCallback: [],
      aoFooterCallback: [],
      aoDrawCallback: [],
      aoRowCreatedCallback: [],
      aoPreDrawCallback: [],
      aoInitComplete: [],
      aoStateSaveParams: [],
      aoStateLoadParams: [],
      aoStateLoaded: [],
      sTableId: "",
      nTable: null,
      nTHead: null,
      nTFoot: null,
      nTBody: null,
      nTableWrapper: null,
      bInitialised: !1,
      aoOpenRows: [],
      sDom: null,
      searchDelay: null,
      sPaginationType: "two_button",
      pagingControls: 0,
      iStateDuration: 0,
      aoStateSave: [],
      aoStateLoad: [],
      oSavedState: null,
      oLoadedState: null,
      bAjaxDataGet: !0,
      jqXHR: null,
      json: void 0,
      oAjaxData: void 0,
      sServerMethod: null,
      fnFormatNumber: null,
      aLengthMenu: null,
      iDraw: 0,
      bDrawing: !1,
      iDrawError: -1,
      _iDisplayLength: 10,
      _iDisplayStart: 0,
      _iRecordsTotal: 0,
      _iRecordsDisplay: 0,
      oClasses: {},
      bFiltered: !1,
      bSorted: !1,
      bSortCellsTop: null,
      oInit: null,
      aoDestroyCallback: [],
      fnRecordsTotal: function () {
        return "ssp" == me(this)
          ? 1 * this._iRecordsTotal
          : this.aiDisplayMaster.length;
      },
      fnRecordsDisplay: function () {
        return "ssp" == me(this)
          ? 1 * this._iRecordsDisplay
          : this.aiDisplay.length;
      },
      fnDisplayEnd: function () {
        var e = this._iDisplayLength,
          t = this._iDisplayStart,
          n = t + e,
          a = this.aiDisplay.length,
          r = this.oFeatures,
          o = r.bPaginate;
        return r.bServerSide
          ? !1 === o || -1 === e
            ? t + a
            : Math.min(t + e, this._iRecordsDisplay)
          : !o || n > a || -1 === e
            ? a
            : n;
      },
      oInstance: null,
      sInstance: null,
      iTabIndex: 0,
      nScrollHead: null,
      nScrollFoot: null,
      aLastSort: [],
      oPlugins: {},
      rowIdFn: null,
      rowId: null,
      caption: "",
      captionNode: null,
      colgroup: null,
    }),
    (Ce.ext = Ie =
      {
        buttons: {},
        classes: {},
        builder: "dt/dt-2.0.0",
        errMode: "alert",
        feature: [],
        features: {},
        search: [],
        selector: { cell: [], column: [], row: [] },
        legacy: { ajax: null },
        pager: {},
        renderer: { pageButton: {}, header: {} },
        order: {},
        type: { className: {}, detect: [], render: {}, search: {}, order: {} },
        _unique: 0,
        fnVersionCheck: Ce.fnVersionCheck,
        iApiIndex: 0,
        sVersion: Ce.version,
      }),
    e.extend(Ie, {
      afnFiltering: Ie.search,
      aTypes: Ie.type.detect,
      ofnSearch: Ie.type.search,
      oSort: Ie.type.order,
      afnSortData: Ie.order,
      aoFeatures: Ie.feature,
      oStdClasses: Ie.classes,
      oPagination: Ie.pager,
    }),
    e.extend(Ce.ext.classes, {
      container: "dt-container",
      empty: { row: "dt-empty" },
      info: { container: "dt-info" },
      length: { container: "dt-length", select: "dt-input" },
      order: {
        canAsc: "dt-orderable-asc",
        canDesc: "dt-orderable-desc",
        isAsc: "dt-ordering-asc",
        isDesc: "dt-ordering-desc",
        none: "dt-orderable-none",
        position: "sorting_",
      },
      processing: { container: "dt-processing" },
      scrolling: {
        body: "dt-scroll-body",
        container: "dt-scroll",
        footer: { self: "dt-scroll-foot", inner: "dt-scroll-footInner" },
        header: { self: "dt-scroll-head", inner: "dt-scroll-headInner" },
      },
      search: { container: "dt-search", input: "dt-input" },
      table: "dataTable",
      tbody: { cell: "", row: "" },
      thead: { cell: "", row: "" },
      tfoot: { cell: "", row: "" },
      paging: {
        active: "current",
        button: "dt-paging-button",
        container: "dt-paging",
        disabled: "disabled",
      },
    }),
    e.extend(Ce.ext.pager, {
      simple: function () {
        return ["previous", "next"];
      },
      full: function () {
        return ["first", "previous", "next", "last"];
      },
      numbers: function () {
        return ["numbers"];
      },
      simple_numbers: function () {
        return ["previous", "numbers", "next"];
      },
      full_numbers: function () {
        return ["first", "previous", "numbers", "next", "last"];
      },
      first_last: function () {
        return ["first", "last"];
      },
      first_last_numbers: function () {
        return ["first", "numbers", "last"];
      },
      _numbers: _e,
      numbers_length: 7,
    }),
    e.extend(!0, Ce.ext.renderer, {
      pagingButton: {
        _: function (t, n, a, r, o) {
          var i = [(t = t.oClasses.paging).button];
          return (
            r && i.push(t.active),
            o && i.push(t.disabled),
            {
              display: (n =
                "ellipsis" === n
                  ? e('<span class="ellipsis"></span>').html(a)[0]
                  : e("<button>", {
                      class: i.join(" "),
                      role: "link",
                      type: "button",
                    }).html(a)),
              clicker: n,
            }
          );
        },
      },
      pagingContainer: {
        _: function (e, t) {
          return t;
        },
      },
    });
  var Dt = function (e, t) {
      return function (n) {
        return ke(n) || "string" != typeof n
          ? n
          : ((n = n.replace(je, " ")),
            e && (n = Ue(n)),
            t && (n = ze(n, !0)),
            n);
      };
    },
    xt = !1,
    St = ",",
    wt = ".";
  if (void 0 !== t.Intl)
    try {
      for (
        var Tt = new Intl.NumberFormat().formatToParts(100000.1), _t = 0;
        _t < Tt.length;
        _t++
      )
        "group" === Tt[_t].type
          ? (St = Tt[_t].value)
          : "decimal" === Tt[_t].type && (wt = Tt[_t].value);
    } catch (e) {}
  (Ce.datetime = function (e, t) {
    var n = "datetime-detect-" + e.replace(/[\W]/g, "_");
    t || (t = "en"),
      Ce.ext.type.order[n] ||
        Ce.type(n, {
          detect: function (a) {
            var r = Se(a, e, t);
            return !("" !== a && !r) && n;
          },
          order: {
            pre: function (n) {
              return Se(n, e, t) || 0;
            },
          },
          className: "dt-right",
        });
  }),
    (Ce.render = {
      date: we("toLocaleDateString"),
      datetime: we("toLocaleString"),
      time: we("toLocaleTimeString"),
      number: function (e, t, n, a, r) {
        return (
          null == e && (e = St),
          null == t && (t = wt),
          {
            display: function (o) {
              if (
                ("number" != typeof o && "string" != typeof o) ||
                "" === o ||
                null === o
              )
                return o;
              var i = 0 > o ? "-" : "",
                l = parseFloat(o),
                s = Math.abs(l);
              return 1e11 <= s || (1e-4 > s && 0 !== s)
                ? (i = l.toExponential(n).split(/e\+?/))[0] +
                    " x 10<sup>" +
                    i[1] +
                    "</sup>"
                : isNaN(l)
                  ? $e(o)
                  : ((l = l.toFixed(n)),
                    (o = Math.abs(l)),
                    (l = parseInt(o, 10)),
                    (o = n ? t + (o - l).toFixed(n).substring(2) : ""),
                    0 === l && 0 === parseFloat(o) && (i = ""),
                    i +
                      (a || "") +
                      l.toString().replace(/\B(?=(\d{3})+(?!\d))/g, e) +
                      o +
                      (r || ""));
            },
          }
        );
      },
      text: function () {
        return { display: $e, filter: $e };
      },
    });
  var Ct = Ce.ext.type;
  (Ce.type = function (e, t, n) {
    if (!t)
      return {
        className: Ct.className[e],
        detect: Ct.detect.find(function (t) {
          return t.name === e;
        }),
        order: {
          pre: Ct.order[e + "-pre"],
          asc: Ct.order[e + "-asc"],
          desc: Ct.order[e + "-desc"],
        },
        render: Ct.render[e],
        search: Ct.search[e],
      };
    var a = function (t) {
        var n = function (n, a) {
          var r = t(n, a);
          return !0 === r ? e : r;
        };
        Object.defineProperty(n, "name", { value: e });
        var a = Ct.detect.findIndex(function (t) {
          return t.name === e;
        });
        -1 === a ? Ct.detect.unshift(n) : Ct.detect.splice(a, 1, n);
      },
      r = function (t) {
        (Ct.order[e + "-pre"] = t.pre),
          (Ct.order[e + "-asc"] = t.asc),
          (Ct.order[e + "-desc"] = t.desc);
      };
    n || ((n = t), (t = null)),
      "className" === t
        ? (Ct.className[e] = n)
        : "detect" === t
          ? a(n)
          : "order" === t
            ? r(n)
            : "render" === t
              ? (Ct.render[e] = n)
              : "search" === t
                ? (Ct.search[e] = n)
                : t ||
                  (n.className && (Ct.className[e] = n.className),
                  void 0 !== n.detect && a(n.detect),
                  n.order && r(n.order),
                  void 0 !== n.render && (Ct.render[e] = n.render),
                  void 0 !== n.search && (Ct.search[e] = n.search));
  }),
    (Ce.types = function () {
      return Ct.detect.map(function (e) {
        return e.name;
      });
    }),
    Ce.type("string", {
      detect: function () {
        return "string";
      },
      order: {
        pre: function (e) {
          return ke(e)
            ? ""
            : "string" == typeof e
              ? e.toLowerCase()
              : e.toString
                ? e.toString()
                : "";
        },
      },
      search: Dt(!1, !0),
    }),
    Ce.type("html", {
      detect: function (e) {
        return ke(e) || ("string" == typeof e && -1 !== e.indexOf("<"))
          ? "html"
          : null;
      },
      order: {
        pre: function (e) {
          return ke(e) ? "" : e.replace ? Ue(e).trim().toLowerCase() : e + "";
        },
      },
      search: Dt(!0, !0),
    }),
    Ce.type("date", {
      className: "dt-type-date",
      detect: function (e) {
        if (e && !(e instanceof Date) && !Pe.test(e)) return null;
        var t = Date.parse(e);
        return (null !== t && !isNaN(t)) || ke(e) ? "date" : null;
      },
      order: {
        pre: function (e) {
          return (e = Date.parse(e)), isNaN(e) ? -1 / 0 : e;
        },
      },
    }),
    Ce.type("html-num-fmt", {
      className: "dt-type-numeric",
      detect: function (e, t) {
        return We(e, t.oLanguage.sDecimal, !0) ? "html-num-fmt" : null;
      },
      order: {
        pre: function (e, t) {
          return It(e, t.oLanguage.sDecimal, Ne, Oe);
        },
      },
      search: Dt(!0, !0),
    }),
    Ce.type("html-num", {
      className: "dt-type-numeric",
      detect: function (e, t) {
        return We(e, t.oLanguage.sDecimal) ? "html-num" : null;
      },
      order: {
        pre: function (e, t) {
          return It(e, t.oLanguage.sDecimal, Ne);
        },
      },
      search: Dt(!0, !0),
    }),
    Ce.type("num-fmt", {
      className: "dt-type-numeric",
      detect: function (e, t) {
        return He(e, t.oLanguage.sDecimal, !0) ? "num-fmt" : null;
      },
      order: {
        pre: function (e, t) {
          return It(e, t.oLanguage.sDecimal, Oe);
        },
      },
    }),
    Ce.type("num", {
      className: "dt-type-numeric",
      detect: function (e, t) {
        return He(e, t.oLanguage.sDecimal) ? "num" : null;
      },
      order: {
        pre: function (e, t) {
          return It(e, t.oLanguage.sDecimal);
        },
      },
    });
  var It = function (e, t, n, a) {
    if (0 !== e && (!e || "-" === e)) return -1 / 0;
    var r = typeof e;
    return "number" === r || "bigint" === r
      ? e
      : (t && (e = Me(e, t)),
        e.replace && (n && (e = e.replace(n, "")), a && (e = e.replace(a, ""))),
        1 * e);
  };
  e.extend(!0, Ce.ext.renderer, {
    footer: {
      _: function (e, t, n) {
        t.addClass(n.tfoot.cell);
      },
    },
    header: {
      _: function (t, n, a) {
        n.addClass(a.thead.cell), t.oFeatures.bSort || n.addClass(a.order.none);
        var r = t.bSortCellsTop,
          o = n.closest("thead").find("tr"),
          i = n.parent().index();
        "disable" === n.attr("data-dt-order") ||
          "disable" === n.parent().attr("data-dt-order") ||
          (!0 === r && 0 !== i) ||
          (!1 === r && i !== o.length - 1) ||
          e(t.nTable).on("order.dt.DT", function (e, r, o) {
            if (t === r) {
              var i = a.order,
                l = r.api.columns(n);
              e = t.aoColumns[l.flatten()[0]];
              var s = l.orderable().includes(!0),
                u = "",
                c = l.indexes(),
                d = l.orderable(!0).flatten(),
                f = o
                  .map(function (e) {
                    return e.col;
                  })
                  .join(",");
              n
                .removeClass(i.isAsc + " " + i.isDesc)
                .toggleClass(i.none, !s)
                .toggleClass(i.canAsc, s && d.includes("asc"))
                .toggleClass(i.canDesc, s && d.includes("desc")),
                -1 !== (d = f.indexOf(c.toArray().join(","))) &&
                  ((l = l.order()),
                  n.addClass(
                    l.includes("asc")
                      ? i.isAsc
                      : "" + l.includes("desc")
                        ? i.isDesc
                        : ""
                  )),
                0 === d && f.length === c.count()
                  ? ((o = o[0]),
                    (i = e.asSorting),
                    n.attr(
                      "aria-sort",
                      "asc" === o.dir ? "ascending" : "descending"
                    ),
                    (u = i[o.index + 1] ? "Reverse" : "Remove"))
                  : n.removeAttr("aria-sort"),
                n.attr(
                  "aria-label",
                  s
                    ? e.ariaTitle + r.api.i18n("oAria.orderable" + u)
                    : e.ariaTitle
                ),
                s &&
                  (n.find(".dt-column-title").attr("role", "button"),
                  n.attr("tabindex", 0));
            }
          });
      },
    },
    layout: {
      _: function (t, n, a) {
        var r = e("<div/>").addClass("dt-layout-row").appendTo(n);
        e.each(a, function (t, n) {
          var a = n.table ? "" : "dt-" + t + " ";
          n.table && r.addClass("dt-layout-table"),
            e("<div/>")
              .attr({
                id: n.id || null,
                class: "dt-layout-cell " + a + (n.className || ""),
              })
              .append(n.contents)
              .appendTo(r);
        });
      },
    },
  }),
    (Ce.feature = {}),
    (Ce.feature.register = function (e, t, n) {
      (Ce.ext.features[e] = t),
        n && Ie.feature.push({ cFeature: n, fnInit: t });
    }),
    Ce.feature.register(
      "info",
      function (t, n) {
        if (!t.oFeatures.bInfo) return null;
        var a = t.oLanguage,
          r = t.sTableId,
          o = e("<div/>", { class: t.oClasses.info.container });
        return (
          (n = e.extend(
            {
              callback: a.fnInfoCallback,
              empty: a.sInfoEmpty,
              postfix: a.sInfoPostFix,
              search: a.sInfoFiltered,
              text: a.sInfo,
            },
            n
          )),
          t.aoDrawCallback.push(function (e) {
            var t = n,
              a = e._iDisplayStart + 1,
              r = e.fnDisplayEnd(),
              i = e.fnRecordsTotal(),
              l = e.fnRecordsDisplay(),
              s = l ? t.text : t.empty;
            l !== i && (s += " " + t.search),
              (s = ye(e, (s += t.postfix))),
              t.callback &&
                (s = t.callback.call(e.oInstance, e, a, r, i, l, s)),
              o.html(s),
              ge(e, null, "info", [e, o[0], s]);
          }),
          e("#" + r + "_info", t.nWrapper).length ||
            (o.attr({ "aria-live": "polite", id: r + "_info", role: "status" }),
            e(t.nTable).attr("aria-describedby", r + "_info")),
          o
        );
      },
      "i"
    );
  var At = 0;
  Ce.feature.register(
    "search",
    function (t, a) {
      if (!t.oFeatures.bFilter) return null;
      var r = t.oClasses.search,
        o = t.sTableId,
        i = t.oLanguage,
        l = t.oPreviousSearch,
        s = '<input type="search" class="' + r.input + '"/>';
      -1 ===
        (a = e.extend(
          { placeholder: i.sSearchPlaceholder, text: i.sSearch },
          a
        )).text.indexOf("_INPUT_") && (a.text += "_INPUT_"),
        (a.text = ye(t, a.text)),
        (i = a.text.match(/_INPUT_$/));
      var u = a.text.match(/^_INPUT_/),
        c = a.text.replace(/_INPUT_/, ""),
        d = "<label>" + a.text + "</label>";
      u
        ? (d = "_INPUT_<label>" + c + "</label>")
        : i && (d = "<label>" + c + "</label>_INPUT_"),
        (r = e("<div>")
          .addClass(r.container)
          .append(d.replace(/_INPUT_/, s)))
          .find("label")
          .attr("for", "dt-search-" + At),
        r.find("input").attr("id", "dt-search-" + At),
        At++;
      var f = function (e) {
        var n = this.value;
        (l.return && "Enter" !== e.key) ||
          n == l.search ||
          ((l.search = n), q(t, l), (t._iDisplayStart = 0), P(t));
      };
      s = null !== t.searchDelay ? t.searchDelay : 0;
      var h = e("input", r)
        .val(l.search)
        .attr("placeholder", a.placeholder)
        .on(
          "keyup.DT search.DT input.DT paste.DT cut.DT",
          s ? Ce.util.debounce(f, s) : f
        )
        .on("mouseup.DT", function (e) {
          setTimeout(function () {
            f.call(h[0], e);
          }, 10);
        })
        .on("keypress.DT", function (e) {
          if (13 == e.keyCode) return !1;
        })
        .attr("aria-controls", o);
      return (
        e(t.nTable).on("search.dt.DT", function (e, a) {
          t === a &&
            h[0] !== n.activeElement &&
            h.val("function" != typeof l.search ? l.search : "");
        }),
        r
      );
    },
    "f"
  ),
    Ce.feature.register(
      "paging",
      function (t, a) {
        if (!t.oFeatures.bPaginate) return null;
        a = e.extend(
          { numbers: Ce.ext.pager.numbers_length, type: t.sPaginationType },
          a
        );
        var r = e("<div/>").addClass(
            t.oClasses.paging.container + " paging_" + a.type
          ),
          o = function () {
            !(function t(a, r, o) {
              if (a._bInitComplete) {
                var i = Ce.ext.pager[o.type],
                  l = a.oLanguage.oAria.paginate || {},
                  s = a._iDisplayStart,
                  u = a._iDisplayLength,
                  c = a.fnRecordsDisplay(),
                  d = -1 === u,
                  f = d ? 0 : Math.ceil(s / u),
                  h = d ? 1 : Math.ceil(c / u);
                for (
                  s = i()
                    .map(function (e) {
                      return "numbers" === e ? _e(f, h, o.numbers) : e;
                    })
                    .flat(),
                    i = [],
                    u = 0;
                  u < s.length;
                  u++
                ) {
                  (c = s[u]), (d = Te(a, c, f, h));
                  var p = be(a, "pagingButton")(
                    a,
                    c,
                    d.display,
                    d.active,
                    d.disabled
                  );
                  e(p.clicker).attr({
                    "aria-controls": a.sTableId,
                    "aria-disabled": d.disabled ? "true" : null,
                    "aria-current": d.active ? "page" : null,
                    "aria-label": l[c],
                    "data-dt-idx": c,
                    tabIndex: d.disabled ? -1 : a.iTabIndex,
                  }),
                    "number" != typeof c && e(p.clicker).addClass(c),
                    he(p.clicker, { action: c }, function (e) {
                      e.preventDefault(), Y(a, e.data.action, !0);
                    }),
                    i.push(p.display);
                }
                (l = be(a, "pagingContainer")(a, i)),
                  (s = r.find(n.activeElement).data("dt-idx")),
                  r.empty().append(l),
                  void 0 !== s &&
                    r.find("[data-dt-idx=" + s + "]").trigger("focus"),
                  i.length &&
                    1 < o.numbers &&
                    e(r).outerHeight() >= 2 * e(i[0]).outerHeight() - 10 &&
                    t(a, r, e.extend({}, o, { numbers: o.numbers - 2 }));
              }
            })(t, r, a);
          };
        return (
          t.aoDrawCallback.push(o), e(t.nTable).on("column-sizing.dt.DT", o), r
        );
      },
      "p"
    );
  var Ft = 0;
  return (
    Ce.feature.register(
      "pageLength",
      function (t, n) {
        var a = t.oFeatures;
        if (!a.bPaginate || !a.bLengthChange) return null;
        n = e.extend({ menu: t.aLengthMenu, text: t.oLanguage.sLengthMenu }, n);
        var r = t.oClasses.length,
          o = t.sTableId,
          i = n.menu;
        a = [];
        var l,
          s = [];
        if (Array.isArray(i[0])) (a = i[0]), (s = i[1]);
        else
          for (l = 0; l < i.length; l++)
            e.isPlainObject(i[l])
              ? (a.push(i[l].value), s.push(i[l].label))
              : (a.push(i[l]), s.push(i[l]));
        (l = n.text.match(/_MENU_$/)), (i = n.text.match(/^_MENU_/));
        var u = n.text.replace(/_MENU_/, ""),
          c = "<label>" + n.text + "</label>";
        i
          ? (c = "_MENU_<label>" + u + "</label>")
          : l && (c = "<label>" + u + "</label>_MENU_");
        var d = e("<div/>")
            .addClass(r.container)
            .append(c.replace("_MENU_", "<span></span>")),
          f = [];
        d.find("label")[0].childNodes.forEach(function (e) {
          e.nodeType === Node.TEXT_NODE &&
            f.push({ el: e, text: e.textContent });
        });
        var h = function (e) {
          f.forEach(function (n) {
            n.el.textContent = ye(t, n.text, e);
          });
        };
        for (
          r = e("<select/>", {
            name: o + "_length",
            "aria-controls": o,
            class: r.select,
          }),
            l = 0;
          l < a.length;
          l++
        )
          r[0][l] = new Option(
            "number" == typeof s[l] ? t.fnFormatNumber(s[l]) : s[l],
            a[l]
          );
        return (
          d.find("label").attr("for", "dt-length-" + Ft),
          r.attr("id", "dt-length-" + Ft),
          Ft++,
          d.find("span").replaceWith(r),
          e("select", d)
            .val(t._iDisplayLength)
            .on("change.DT", function () {
              z(t, e(this).val()), P(t);
            }),
          e(t.nTable).on("length.dt.DT", function (n, a, r) {
            t === a && (e("select", d).val(r), h(r));
          }),
          h(t._iDisplayLength),
          d
        );
      },
      "l"
    ),
    (e.fn.dataTable = Ce),
    (Ce.$ = e),
    (e.fn.dataTableSettings = Ce.settings),
    (e.fn.dataTableExt = Ce.ext),
    (e.fn.DataTable = function (t) {
      return e(this).dataTable(t).api();
    }),
    e.each(Ce, function (t, n) {
      e.fn.DataTable[t] = n;
    }),
    Ce
  );
}),
  (function (e) {
    if ("function" == typeof define && define.amd)
      define(["jquery", "datatables.net"], function (t) {
        return e(t, window, document);
      });
    else if ("object" == typeof exports) {
      var t = require("jquery"),
        n = function (e, t) {
          t.fn.dataTable || require("datatables.net")(e, t);
        };
      "undefined" == typeof window
        ? (module.exports = function (a, r) {
            return (
              a || (a = window), r || (r = t(a)), n(a, r), e(r, a, a.document)
            );
          })
        : (n(window, t), (module.exports = e(t, window, window.document)));
    } else e(jQuery, window, document);
  })(function (e, t, n) {
    return e.fn.dataTable;
  });

// dataTables.buttons.min.js
!(function (e) {
  var o, i;
  "function" == typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (t) {
        return e(t, window, document);
      })
    : "object" == typeof exports
      ? ((o = require("jquery")),
        (i = function (t, n) {
          n.fn.dataTable || require("datatables.net")(t, n);
        }),
        "undefined" == typeof window
          ? (module.exports = function (t, n) {
              return (
                (t = t || window), (n = n || o(t)), i(t, n), e(n, t, t.document)
              );
            })
          : (i(window, o), (module.exports = e(o, window, window.document))))
      : e(jQuery, window, document);
})(function (x, g, m) {
  "use strict";
  var e = x.fn.dataTable,
    o = 0,
    C = 0,
    w = e.ext.buttons,
    i = null;
  function v(t, n, e) {
    x.fn.animate
      ? t.stop().fadeIn(n, e)
      : (t.css("display", "block"), e && e.call(t));
  }
  function y(t, n, e) {
    x.fn.animate
      ? t.stop().fadeOut(n, e)
      : (t.css("display", "none"), e && e.call(t));
  }
  function _(n, t) {
    if (!e.versionCheck("2"))
      throw "Warning: Buttons requires DataTables 2 or newer";
    if (!(this instanceof _))
      return function (t) {
        return new _(t, n).container();
      };
    !0 === (t = void 0 === t ? {} : t) && (t = {}),
      Array.isArray(t) && (t = { buttons: t }),
      (this.c = x.extend(!0, {}, _.defaults, t)),
      t.buttons && (this.c.buttons = t.buttons),
      (this.s = {
        dt: new e.Api(n),
        buttons: [],
        listenKeys: "",
        namespace: "dtb" + o++,
      }),
      (this.dom = {
        container: x("<" + this.c.dom.container.tag + "/>").addClass(
          this.c.dom.container.className
        ),
      }),
      this._constructor();
  }
  x.extend(_.prototype, {
    action: function (t, n) {
      t = this._nodeToButton(t);
      return void 0 === n ? t.conf.action : ((t.conf.action = n), this);
    },
    active: function (t, n) {
      var t = this._nodeToButton(t),
        e = this.c.dom.button.active,
        o = x(t.node);
      return (
        t.inCollection &&
          this.c.dom.collection.button &&
          void 0 !== this.c.dom.collection.button.active &&
          (e = this.c.dom.collection.button.active),
        void 0 === n
          ? o.hasClass(e)
          : (o.toggleClass(e, void 0 === n || n), this)
      );
    },
    add: function (t, n, e) {
      var o = this.s.buttons;
      if ("string" == typeof n) {
        for (
          var i = n.split("-"), s = this.s, a = 0, r = i.length - 1;
          a < r;
          a++
        )
          s = s.buttons[+i[a]];
        (o = s.buttons), (n = +i[i.length - 1]);
      }
      return (
        this._expandButton(
          o,
          t,
          void 0 !== t ? t.split : void 0,
          (void 0 === t || void 0 === t.split || 0 === t.split.length) &&
            void 0 !== s,
          !1,
          n
        ),
        (void 0 !== e && !0 !== e) || this._draw(),
        this
      );
    },
    collectionRebuild: function (t, n) {
      var e = this._nodeToButton(t);
      if (void 0 !== n) {
        for (var o = e.buttons.length - 1; 0 <= o; o--)
          this.remove(e.buttons[o].node);
        for (
          e.conf.prefixButtons && n.unshift.apply(n, e.conf.prefixButtons),
            e.conf.postfixButtons && n.push.apply(n, e.conf.postfixButtons),
            o = 0;
          o < n.length;
          o++
        ) {
          var i = n[o];
          this._expandButton(
            e.buttons,
            i,
            void 0 !== i && void 0 !== i.config && void 0 !== i.config.split,
            !0,
            void 0 !== i.parentConf && void 0 !== i.parentConf.split,
            null,
            i.parentConf
          );
        }
      }
      this._draw(e.collection, e.buttons);
    },
    container: function () {
      return this.dom.container;
    },
    disable: function (t) {
      t = this._nodeToButton(t);
      return (
        x(t.node).addClass(this.c.dom.button.disabled).prop("disabled", !0),
        this
      );
    },
    destroy: function () {
      x("body").off("keyup." + this.s.namespace);
      for (var t = this.s.buttons.slice(), n = 0, e = t.length; n < e; n++)
        this.remove(t[n].node);
      this.dom.container.remove();
      var o = this.s.dt.settings()[0];
      for (n = 0, e = o.length; n < e; n++)
        if (o.inst === this) {
          o.splice(n, 1);
          break;
        }
      return this;
    },
    enable: function (t, n) {
      return !1 === n
        ? this.disable(t)
        : ((n = this._nodeToButton(t)),
          x(n.node)
            .removeClass(this.c.dom.button.disabled)
            .prop("disabled", !1),
          this);
    },
    index: function (t, n, e) {
      n || ((n = ""), (e = this.s.buttons));
      for (var o = 0, i = e.length; o < i; o++) {
        var s = e[o].buttons;
        if (e[o].node === t) return n + o;
        if (s && s.length) {
          s = this.index(t, o + "-", s);
          if (null !== s) return s;
        }
      }
      return null;
    },
    name: function () {
      return this.c.name;
    },
    node: function (t) {
      return t ? ((t = this._nodeToButton(t)), x(t.node)) : this.dom.container;
    },
    processing: function (t, n) {
      var e = this.s.dt,
        o = this._nodeToButton(t);
      return void 0 === n
        ? x(o.node).hasClass("processing")
        : (x(o.node).toggleClass("processing", n),
          x(e.table().node()).triggerHandler("buttons-processing.dt", [
            n,
            e.button(t),
            e,
            x(t),
            o.conf,
          ]),
          this);
    },
    remove: function (t) {
      var n = this._nodeToButton(t),
        e = this._nodeToHost(t),
        o = this.s.dt;
      if (n.buttons.length)
        for (var i = n.buttons.length - 1; 0 <= i; i--)
          this.remove(n.buttons[i].node);
      (n.conf.destroying = !0),
        n.conf.destroy && n.conf.destroy.call(o.button(t), o, x(t), n.conf),
        this._removeKey(n.conf),
        x(n.node).remove();
      o = x.inArray(n, e);
      return e.splice(o, 1), this;
    },
    text: function (t, n) {
      function e(t) {
        return "function" == typeof t ? t(i, s, o.conf) : t;
      }
      var o = this._nodeToButton(t),
        t = o.textNode,
        i = this.s.dt,
        s = x(o.node);
      return void 0 === n
        ? e(o.conf.text)
        : ((o.conf.text = n), t.html(e(n)), this);
    },
    _constructor: function () {
      var e = this,
        t = this.s.dt,
        o = t.settings()[0],
        n = this.c.buttons;
      o._buttons || (o._buttons = []),
        o._buttons.push({ inst: this, name: this.c.name });
      for (var i = 0, s = n.length; i < s; i++) this.add(n[i]);
      t.on("destroy", function (t, n) {
        n === o && e.destroy();
      }),
        x("body").on("keyup." + this.s.namespace, function (t) {
          var n;
          (m.activeElement && m.activeElement !== m.body) ||
            ((n = String.fromCharCode(t.keyCode).toLowerCase()),
            -1 !== e.s.listenKeys.toLowerCase().indexOf(n) &&
              e._keypress(n, t));
        });
    },
    _addKey: function (t) {
      t.key && (this.s.listenKeys += (x.isPlainObject(t.key) ? t.key : t).key);
    },
    _draw: function (t, n) {
      t || ((t = this.dom.container), (n = this.s.buttons)),
        t.children().detach();
      for (var e = 0, o = n.length; e < o; e++)
        t.append(n[e].inserter),
          t.append(" "),
          n[e].buttons &&
            n[e].buttons.length &&
            this._draw(n[e].collection, n[e].buttons);
    },
    _expandButton: function (t, n, e, o, i, s, a) {
      for (
        var r,
          l = this.s.dt,
          c = this.c.dom.collection,
          u = Array.isArray(n) ? n : [n],
          d = 0,
          f = (u = void 0 === n ? (Array.isArray(e) ? e : [e]) : u).length;
        d < f;
        d++
      ) {
        var p = this._resolveExtends(u[d]);
        if (p)
          if (((r = !(!p.config || !p.config.split)), Array.isArray(p)))
            this._expandButton(
              t,
              p,
              void 0 !== h && void 0 !== h.conf ? h.conf.split : void 0,
              o,
              void 0 !== a && void 0 !== a.split,
              s,
              a
            );
          else {
            var h = this._buildButton(
              p,
              o,
              void 0 !== p.split ||
                (void 0 !== p.config && void 0 !== p.config.split),
              i
            );
            if (h) {
              if (
                (null != s ? (t.splice(s, 0, h), s++) : t.push(h),
                h.conf.buttons &&
                  ((h.collection = x("<" + c.container.content.tag + "/>")),
                  (h.conf._collection = h.collection),
                  x(h.node).append(c.action.dropHtml),
                  this._expandButton(
                    h.buttons,
                    h.conf.buttons,
                    h.conf.split,
                    !r,
                    r,
                    s,
                    h.conf
                  )),
                h.conf.split)
              ) {
                (h.collection = x("<" + c.container.tag + "/>")),
                  (h.conf._collection = h.collection);
                for (var b = 0; b < h.conf.split.length; b++) {
                  var g = h.conf.split[b];
                  "object" == typeof g &&
                    ((g.parent = a),
                    void 0 === g.collectionLayout &&
                      (g.collectionLayout = h.conf.collectionLayout),
                    void 0 === g.dropup && (g.dropup = h.conf.dropup),
                    void 0 === g.fade) &&
                    (g.fade = h.conf.fade);
                }
                this._expandButton(
                  h.buttons,
                  h.conf.buttons,
                  h.conf.split,
                  !r,
                  r,
                  s,
                  h.conf
                );
              }
              (h.conf.parent = a),
                p.init && p.init.call(l.button(h.node), l, x(h.node), p);
            }
          }
      }
    },
    _buildButton: function (n, t, e, o) {
      function i(t) {
        return "function" == typeof t ? t(f, c, n) : t;
      }
      var s,
        a,
        r,
        l,
        c,
        u = this,
        d = this.c.dom,
        f = this.s.dt,
        p = x.extend(!0, {}, d.button);
      if (
        (t && e && d.collection.split
          ? x.extend(!0, p, d.collection.split.action)
          : o || t
            ? x.extend(!0, p, d.collection.button)
            : e && x.extend(!0, p, d.split.button),
        n.spacer)
      )
        return (
          (d = x("<" + p.spacer.tag + "/>")
            .addClass("dt-button-spacer " + n.style + " " + p.spacer.className)
            .html(i(n.text))),
          {
            conf: n,
            node: d,
            inserter: d,
            buttons: [],
            inCollection: t,
            isSplit: e,
            collection: null,
            textNode: d,
          }
        );
      if (n.available && !n.available(f, n) && !n.html) return !1;
      n.html
        ? (c = x(n.html))
        : ((a = function (t, n, e, o, i) {
            o.action.call(n.button(e), t, n, e, o, i),
              x(n.table().node()).triggerHandler("buttons-action.dt", [
                n.button(e),
                n,
                e,
                o,
              ]);
          }),
          (r = function (t, n, e, o) {
            o.async
              ? (u.processing(e[0], !0),
                setTimeout(function () {
                  a(t, n, e, o, function () {
                    u.processing(e[0], !1);
                  });
                }, o.async))
              : a(t, n, e, o, function () {});
          }),
          (d = n.tag || p.tag),
          (l = void 0 === n.clickBlurs || n.clickBlurs),
          (c = x("<" + d + "/>")
            .addClass(p.className)
            .attr("tabindex", this.s.dt.settings()[0].iTabIndex)
            .attr("aria-controls", this.s.dt.table().node().id)
            .on("click.dtb", function (t) {
              t.preventDefault(),
                !c.hasClass(p.disabled) && n.action && r(t, f, c, n),
                l && c.trigger("blur");
            })
            .on("keypress.dtb", function (t) {
              13 === t.keyCode &&
                (t.preventDefault(), !c.hasClass(p.disabled)) &&
                n.action &&
                r(t, f, c, n);
            })),
          "a" === d.toLowerCase() && c.attr("href", "#"),
          "button" === d.toLowerCase() && c.attr("type", "button"),
          (s = p.liner.tag
            ? ((d = x("<" + p.liner.tag + "/>")
                .html(i(n.text))
                .addClass(p.liner.className)),
              "a" === p.liner.tag.toLowerCase() && d.attr("href", "#"),
              c.append(d),
              d)
            : (c.html(i(n.text)), c)),
          !1 === n.enabled && c.addClass(p.disabled),
          n.className && c.addClass(n.className),
          n.titleAttr && c.attr("title", i(n.titleAttr)),
          n.attr && c.attr(n.attr),
          n.namespace || (n.namespace = ".dt-button-" + C++),
          void 0 !== n.config && n.config.split && (n.split = n.config.split));
      var h,
        b,
        g,
        m,
        v,
        y,
        d = this.c.dom.buttonContainer,
        d =
          d && d.tag
            ? x("<" + d.tag + "/>")
                .addClass(d.className)
                .append(c)
            : c;
      return (
        this._addKey(n),
        this.c.buttonCreated && (d = this.c.buttonCreated(n, d)),
        e &&
          ((b = (h = t
            ? x.extend(!0, this.c.dom.split, this.c.dom.collection.split)
            : this.c.dom.split).wrapper),
          (g = x("<" + b.tag + "/>")
            .addClass(b.className)
            .append(c)),
          (m = x.extend(n, {
            align: h.dropdown.align,
            attr: { "aria-haspopup": "dialog", "aria-expanded": !1 },
            className: h.dropdown.className,
            closeButton: !1,
            splitAlignClass: h.dropdown.splitAlignClass,
            text: h.dropdown.text,
          })),
          this._addKey(m),
          (v = function (t, n, e, o) {
            w.split.action.call(n.button(g), t, n, e, o),
              x(n.table().node()).triggerHandler("buttons-action.dt", [
                n.button(e),
                n,
                e,
                o,
              ]),
              e.attr("aria-expanded", !0);
          }),
          (y = x(
            '<button class="' + h.dropdown.className + ' dt-button"></button>'
          )
            .html(h.dropdown.dropHtml)
            .on("click.dtb", function (t) {
              t.preventDefault(),
                t.stopPropagation(),
                y.hasClass(p.disabled) || v(t, f, y, m),
                l && y.trigger("blur");
            })
            .on("keypress.dtb", function (t) {
              13 === t.keyCode &&
                (t.preventDefault(), y.hasClass(p.disabled) || v(t, f, y, m));
            })),
          0 === n.split.length && y.addClass("dtb-hide-drop"),
          g.append(y).attr(m.attr)),
        {
          conf: n,
          node: (e ? g : c).get(0),
          inserter: e ? g : d,
          buttons: [],
          inCollection: t,
          isSplit: e,
          inSplit: o,
          collection: null,
          textNode: s,
        }
      );
    },
    _nodeToButton: function (t, n) {
      for (var e = 0, o = (n = n || this.s.buttons).length; e < o; e++) {
        if (n[e].node === t) return n[e];
        if (n[e].buttons.length) {
          var i = this._nodeToButton(t, n[e].buttons);
          if (i) return i;
        }
      }
    },
    _nodeToHost: function (t, n) {
      for (var e = 0, o = (n = n || this.s.buttons).length; e < o; e++) {
        if (n[e].node === t) return n;
        if (n[e].buttons.length) {
          var i = this._nodeToHost(t, n[e].buttons);
          if (i) return i;
        }
      }
    },
    _keypress: function (s, a) {
      var r;
      a._buttonsHandled ||
        (r = function (t) {
          for (var n, e, o = 0, i = t.length; o < i; o++)
            (n = t[o].conf),
              (e = t[o].node),
              !n.key ||
                (n.key !== s &&
                  (!x.isPlainObject(n.key) ||
                    n.key.key !== s ||
                    (n.key.shiftKey && !a.shiftKey) ||
                    (n.key.altKey && !a.altKey) ||
                    (n.key.ctrlKey && !a.ctrlKey) ||
                    (n.key.metaKey && !a.metaKey))) ||
                ((a._buttonsHandled = !0), x(e).click()),
              t[o].buttons.length && r(t[o].buttons);
        })(this.s.buttons);
    },
    _removeKey: function (t) {
      var n;
      t.key &&
        ((t = (x.isPlainObject(t.key) ? t.key : t).key),
        (n = this.s.listenKeys.split("")),
        (t = x.inArray(t, n)),
        n.splice(t, 1),
        (this.s.listenKeys = n.join("")));
    },
    _resolveExtends: function (e) {
      function t(t) {
        for (var n = 0; !x.isPlainObject(t) && !Array.isArray(t); ) {
          if (void 0 === t) return;
          if ("function" == typeof t) {
            if (!(t = t.call(i, s, e))) return !1;
          } else if ("string" == typeof t) {
            if (!w[t]) return { html: t };
            t = w[t];
          }
          if (30 < ++n) throw "Buttons: Too many iterations";
        }
        return Array.isArray(t) ? t : x.extend({}, t);
      }
      var n,
        o,
        i = this,
        s = this.s.dt;
      for (e = t(e); e && e.extend; ) {
        if (!w[e.extend])
          throw "Cannot extend unknown button type: " + e.extend;
        var a = t(w[e.extend]);
        if (Array.isArray(a)) return a;
        if (!a) return !1;
        var r = a.className;
        void 0 !== e.config &&
          void 0 !== a.config &&
          (e.config = x.extend({}, a.config, e.config)),
          (e = x.extend({}, a, e)),
          r && e.className !== r && (e.className = r + " " + e.className),
          (e.extend = a.extend);
      }
      var l = e.postfixButtons;
      if (l)
        for (e.buttons || (e.buttons = []), n = 0, o = l.length; n < o; n++)
          e.buttons.push(l[n]);
      var c = e.prefixButtons;
      if (c)
        for (e.buttons || (e.buttons = []), n = 0, o = c.length; n < o; n++)
          e.buttons.splice(n, 0, c[n]);
      return e;
    },
    _popover: function (o, t, n) {
      function i() {
        (f = !0),
          y(x(h), p.fade, function () {
            x(this).detach();
          }),
          x(
            u.buttons('[aria-haspopup="dialog"][aria-expanded="true"]').nodes()
          ).attr("aria-expanded", "false"),
          x("div.dt-button-background").off("click.dtb-collection"),
          _.background(!1, p.backgroundClassName, p.fade, b),
          x(g).off("resize.resize.dtb-collection"),
          x("body").off(".dtb-collection"),
          u.off("buttons-action.b-internal"),
          u.off("destroy");
      }
      var e,
        s,
        a,
        r,
        l,
        c,
        u = t,
        d = this.c,
        f = !1,
        p = x.extend(
          {
            align: "button-left",
            autoClose: !1,
            background: !0,
            backgroundClassName: "dt-button-background",
            closeButton: !0,
            containerClassName: d.dom.collection.container.className,
            contentClassName: d.dom.collection.container.content.className,
            collectionLayout: "",
            collectionTitle: "",
            dropup: !1,
            fade: 400,
            popoverTitle: "",
            rightAlignClassName: "dt-button-right",
            tag: d.dom.collection.container.tag,
          },
          n
        ),
        h = p.tag + "." + p.containerClassName.replace(/ /g, "."),
        b = t.node();
      !1 === o
        ? i()
        : ((d = x(
            u.buttons('[aria-haspopup="dialog"][aria-expanded="true"]').nodes()
          )).length && (b.closest(h).length && (b = d.eq(0)), i()),
          (n = x(".dt-button", o).length),
          (d = ""),
          3 === n
            ? (d = "dtb-b3")
            : 2 === n
              ? (d = "dtb-b2")
              : 1 === n && (d = "dtb-b1"),
          (e = x("<" + p.tag + "/>")
            .addClass(p.containerClassName)
            .addClass(p.collectionLayout)
            .addClass(p.splitAlignClass)
            .addClass(d)
            .css("display", "none")
            .attr({ "aria-modal": !0, role: "dialog" })),
          (o = x(o)
            .addClass(p.contentClassName)
            .attr("role", "menu")
            .appendTo(e)),
          b.attr("aria-expanded", "true"),
          b.parents("body")[0] !== m.body && (b = m.body.lastChild),
          p.popoverTitle
            ? e.prepend(
                '<div class="dt-button-collection-title">' +
                  p.popoverTitle +
                  "</div>"
              )
            : p.collectionTitle &&
              e.prepend(
                '<div class="dt-button-collection-title">' +
                  p.collectionTitle +
                  "</div>"
              ),
          p.closeButton &&
            e
              .prepend('<div class="dtb-popover-close">&times;</div>')
              .addClass("dtb-collection-closeable"),
          v(e.insertAfter(b), p.fade),
          (n = x(t.table().container())),
          (d = e.css("position")),
          ("container" !== p.span && "dt-container" !== p.align) ||
            ((b = b.parent()), e.css("width", n.width())),
          "absolute" === d
            ? ((t = x(b[0].offsetParent)),
              (n = b.position()),
              (d = b.offset()),
              (r = t.offset()),
              (s = t.position()),
              (a = g.getComputedStyle(t[0])),
              (r.height = t.outerHeight()),
              (r.width = t.width() + parseFloat(a.paddingLeft)),
              (r.right = r.left + r.width),
              (r.bottom = r.top + r.height),
              (t = n.top + b.outerHeight()),
              (r = n.left),
              e.css({ top: t, left: r }),
              (a = g.getComputedStyle(e[0])),
              ((l = e.offset()).height = e.outerHeight()),
              (l.width = e.outerWidth()),
              (l.right = l.left + l.width),
              (l.bottom = l.top + l.height),
              (l.marginTop = parseFloat(a.marginTop)),
              (l.marginBottom = parseFloat(a.marginBottom)),
              p.dropup && (t = n.top - l.height - l.marginTop - l.marginBottom),
              ("button-right" !== p.align &&
                !e.hasClass(p.rightAlignClassName)) ||
                (r = n.left - l.width + b.outerWidth()),
              ("dt-container" !== p.align && "container" !== p.align) ||
                (r < n.left && (r = -n.left)),
              s.left + r + l.width > x(g).width() &&
                (r = x(g).width() - l.width - s.left),
              d.left + r < 0 && (r = -d.left),
              s.top + t + l.height > x(g).height() + x(g).scrollTop() &&
                (t = n.top - l.height - l.marginTop - l.marginBottom),
              s.top + t < x(g).scrollTop() && (t = n.top + b.outerHeight()),
              e.css({ top: t, left: r }))
            : ((c = function () {
                var t = x(g).height() / 2,
                  n = e.height() / 2;
                e.css("marginTop", -1 * (n = t < n ? t : n));
              })(),
              x(g).on("resize.dtb-collection", function () {
                c();
              })),
          p.background &&
            _.background(
              !0,
              p.backgroundClassName,
              p.fade,
              p.backgroundHost || b
            ),
          x("div.dt-button-background").on(
            "click.dtb-collection",
            function () {}
          ),
          p.autoClose &&
            setTimeout(function () {
              u.on("buttons-action.b-internal", function (t, n, e, o) {
                o[0] !== b[0] && i();
              });
            }, 0),
          x(e).trigger("buttons-popover.dt"),
          u.on("destroy", i),
          setTimeout(function () {
            (f = !1),
              x("body")
                .on("click.dtb-collection", function (t) {
                  var n, e;
                  !f &&
                    ((n = x.fn.addBack ? "addBack" : "andSelf"),
                    (e = x(t.target).parent()[0]),
                    (!x(t.target).parents()[n]().filter(o).length &&
                      !x(e).hasClass("dt-buttons")) ||
                      x(t.target).hasClass("dt-button-background")) &&
                    i();
                })
                .on("keyup.dtb-collection", function (t) {
                  27 === t.keyCode && i();
                })
                .on("keydown.dtb-collection", function (t) {
                  var n = x("a, button", o),
                    e = m.activeElement;
                  9 === t.keyCode &&
                    (-1 === n.index(e)
                      ? (n.first().focus(), t.preventDefault())
                      : t.shiftKey
                        ? e === n[0] && (n.last().focus(), t.preventDefault())
                        : e === n.last()[0] &&
                          (n.first().focus(), t.preventDefault()));
                });
          }, 0));
    },
  }),
    (_.background = function (t, n, e, o) {
      void 0 === e && (e = 400),
        (o = o || m.body),
        t
          ? v(x("<div/>").addClass(n).css("display", "none").insertAfter(o), e)
          : y(x("div." + n), e, function () {
              x(this).removeClass(n).remove();
            });
    }),
    (_.instanceSelector = function (t, i) {
      var s, a, r;
      return null == t
        ? x.map(i, function (t) {
            return t.inst;
          })
        : ((s = []),
          (a = x.map(i, function (t) {
            return t.name;
          })),
          (r = function (t) {
            var n;
            if (Array.isArray(t))
              for (var e = 0, o = t.length; e < o; e++) r(t[e]);
            else
              "string" == typeof t
                ? -1 !== t.indexOf(",")
                  ? r(t.split(","))
                  : -1 !== (n = x.inArray(t.trim(), a)) && s.push(i[n].inst)
                : "number" == typeof t
                  ? s.push(i[t].inst)
                  : "object" == typeof t && s.push(t);
          })(t),
          s);
    }),
    (_.buttonSelector = function (t, n) {
      for (
        var c = [],
          u = function (t, n, e) {
            for (var o, i, s = 0, a = n.length; s < a; s++)
              (o = n[s]) &&
                (t.push({
                  node: o.node,
                  name: o.conf.name,
                  idx: (i = void 0 !== e ? e + s : s + ""),
                }),
                o.buttons) &&
                u(t, o.buttons, i + "-");
          },
          d = function (t, n) {
            var e = [],
              o =
                (u(e, n.s.buttons),
                x.map(e, function (t) {
                  return t.node;
                }));
            if (Array.isArray(t) || t instanceof x)
              for (s = 0, a = t.length; s < a; s++) d(t[s], n);
            else if (null == t || "*" === t)
              for (s = 0, a = e.length; s < a; s++)
                c.push({ inst: n, node: e[s].node });
            else if ("number" == typeof t)
              n.s.buttons[t] && c.push({ inst: n, node: n.s.buttons[t].node });
            else if ("string" == typeof t)
              if (-1 !== t.indexOf(","))
                for (var i = t.split(","), s = 0, a = i.length; s < a; s++)
                  d(i[s].trim(), n);
              else if (t.match(/^\d+(\-\d+)*$/)) {
                var r = x.map(e, function (t) {
                  return t.idx;
                });
                c.push({ inst: n, node: e[x.inArray(t, r)].node });
              } else if (-1 !== t.indexOf(":name")) {
                var l = t.replace(":name", "");
                for (s = 0, a = e.length; s < a; s++)
                  e[s].name === l && c.push({ inst: n, node: e[s].node });
              } else
                x(o)
                  .filter(t)
                  .each(function () {
                    c.push({ inst: n, node: this });
                  });
            else
              "object" == typeof t &&
                t.nodeName &&
                -1 !== (r = x.inArray(t, o)) &&
                c.push({ inst: n, node: o[r] });
          },
          e = 0,
          o = t.length;
        e < o;
        e++
      ) {
        var i = t[e];
        d(n, i);
      }
      return c;
    }),
    (_.stripData = function (t, n) {
      return (t =
        "string" == typeof t &&
        ((t = (t = t.replace(
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          ""
        )).replace(/<!\-\-.*?\-\->/g, "")),
        (n && !n.stripHtml) || (t = t.replace(/<[^>]*>/g, "")),
        (n && !n.trim) || (t = t.replace(/^\s+|\s+$/g, "")),
        (n && !n.stripNewlines) || (t = t.replace(/\n/g, " ")),
        !n || n.decodeEntities)
          ? i
            ? i(t)
            : ((c.innerHTML = t), c.value)
          : t);
    }),
    (_.entityDecoder = function (t) {
      i = t;
    }),
    (_.defaults = {
      buttons: ["copy", "excel", "csv", "pdf", "print"],
      name: "main",
      tabIndex: 0,
      dom: {
        container: { tag: "div", className: "dt-buttons" },
        collection: {
          action: {
            dropHtml: '<span class="dt-button-down-arrow">&#x25BC;</span>',
          },
          container: {
            className: "dt-button-collection",
            content: { className: "", tag: "div" },
            tag: "div",
          },
        },
        button: {
          tag: "button",
          className: "dt-button",
          active: "dt-button-active",
          disabled: "disabled",
          spacer: { className: "dt-button-spacer", tag: "span" },
          liner: { tag: "span", className: "" },
        },
        split: {
          action: {
            className: "dt-button-split-drop-button dt-button",
            tag: "button",
          },
          dropdown: {
            align: "split-right",
            className: "dt-button-split-drop",
            dropHtml: '<span class="dt-button-down-arrow">&#x25BC;</span>',
            splitAlignClass: "dt-button-split-left",
            tag: "button",
          },
          wrapper: { className: "dt-button-split", tag: "div" },
        },
      },
    }),
    x.extend(w, {
      collection: {
        text: function (t) {
          return t.i18n("buttons.collection", "Collection");
        },
        className: "buttons-collection",
        closeButton: !(_.version = "3.0.0"),
        init: function (t, n) {
          n.attr("aria-expanded", !1);
        },
        action: function (t, n, e, o) {
          o._collection.parents("body").length
            ? this.popover(!1, o)
            : this.popover(o._collection, o),
            "keypress" === t.type &&
              x("a, button", o._collection).eq(0).focus();
        },
        attr: { "aria-haspopup": "dialog" },
      },
      split: {
        text: function (t) {
          return t.i18n("buttons.split", "Split");
        },
        className: "buttons-split",
        closeButton: !1,
        init: function (t, n) {
          return n.attr("aria-expanded", !1);
        },
        action: function (t, n, e, o) {
          this.popover(o._collection, o);
        },
        attr: { "aria-haspopup": "dialog" },
      },
      copy: function () {
        if (w.copyHtml5) return "copyHtml5";
      },
      csv: function (t, n) {
        if (w.csvHtml5 && w.csvHtml5.available(t, n)) return "csvHtml5";
      },
      excel: function (t, n) {
        if (w.excelHtml5 && w.excelHtml5.available(t, n)) return "excelHtml5";
      },
      pdf: function (t, n) {
        if (w.pdfHtml5 && w.pdfHtml5.available(t, n)) return "pdfHtml5";
      },
      pageLength: function (t) {
        var n = t.settings()[0].aLengthMenu,
          e = [],
          o = [];
        if (Array.isArray(n[0])) (e = n[0]), (o = n[1]);
        else
          for (var i = 0; i < n.length; i++) {
            var s = n[i];
            x.isPlainObject(s)
              ? (e.push(s.value), o.push(s.label))
              : (e.push(s), o.push(s));
          }
        return {
          extend: "collection",
          text: function (t) {
            return t.i18n(
              "buttons.pageLength",
              { "-1": "Show all rows", _: "Show %d rows" },
              t.page.len()
            );
          },
          className: "buttons-page-length",
          autoClose: !0,
          buttons: x.map(e, function (s, t) {
            return {
              text: o[t],
              className: "button-page-length",
              action: function (t, n) {
                n.page.len(s).draw();
              },
              init: function (t, n, e) {
                function o() {
                  i.active(t.page.len() === s);
                }
                var i = this;
                t.on("length.dt" + e.namespace, o), o();
              },
              destroy: function (t, n, e) {
                t.off("length.dt" + e.namespace);
              },
            };
          }),
          init: function (t, n, e) {
            var o = this;
            t.on("length.dt" + e.namespace, function () {
              o.text(e.text);
            });
          },
          destroy: function (t, n, e) {
            t.off("length.dt" + e.namespace);
          },
        };
      },
      spacer: {
        style: "empty",
        spacer: !0,
        text: function (t) {
          return t.i18n("buttons.spacer", "");
        },
      },
    }),
    e.Api.register("buttons()", function (n, e) {
      void 0 === e && ((e = n), (n = void 0)), (this.selector.buttonGroup = n);
      var t = this.iterator(
        !0,
        "table",
        function (t) {
          if (t._buttons)
            return _.buttonSelector(_.instanceSelector(n, t._buttons), e);
        },
        !0
      );
      return (t._groupSelector = n), t;
    }),
    e.Api.register("button()", function (t, n) {
      t = this.buttons(t, n);
      return 1 < t.length && t.splice(1, t.length), t;
    }),
    e.Api.registerPlural(
      "buttons().active()",
      "button().active()",
      function (n) {
        return void 0 === n
          ? this.map(function (t) {
              return t.inst.active(t.node);
            })
          : this.each(function (t) {
              t.inst.active(t.node, n);
            });
      }
    ),
    e.Api.registerPlural(
      "buttons().action()",
      "button().action()",
      function (n) {
        return void 0 === n
          ? this.map(function (t) {
              return t.inst.action(t.node);
            })
          : this.each(function (t) {
              t.inst.action(t.node, n);
            });
      }
    ),
    e.Api.registerPlural(
      "buttons().collectionRebuild()",
      "button().collectionRebuild()",
      function (e) {
        return this.each(function (t) {
          for (var n = 0; n < e.length; n++)
            "object" == typeof e[n] && (e[n].parentConf = t);
          t.inst.collectionRebuild(t.node, e);
        });
      }
    ),
    e.Api.register(["buttons().enable()", "button().enable()"], function (n) {
      return this.each(function (t) {
        t.inst.enable(t.node, n);
      });
    }),
    e.Api.register(["buttons().disable()", "button().disable()"], function () {
      return this.each(function (t) {
        t.inst.disable(t.node);
      });
    }),
    e.Api.register("button().index()", function () {
      var n = null;
      return (
        this.each(function (t) {
          t = t.inst.index(t.node);
          null !== t && (n = t);
        }),
        n
      );
    }),
    e.Api.registerPlural("buttons().nodes()", "button().node()", function () {
      var n = x();
      return (
        x(
          this.each(function (t) {
            n = n.add(t.inst.node(t.node));
          })
        ),
        n
      );
    }),
    e.Api.registerPlural(
      "buttons().processing()",
      "button().processing()",
      function (n) {
        return void 0 === n
          ? this.map(function (t) {
              return t.inst.processing(t.node);
            })
          : this.each(function (t) {
              t.inst.processing(t.node, n);
            });
      }
    ),
    e.Api.registerPlural("buttons().text()", "button().text()", function (n) {
      return void 0 === n
        ? this.map(function (t) {
            return t.inst.text(t.node);
          })
        : this.each(function (t) {
            t.inst.text(t.node, n);
          });
    }),
    e.Api.registerPlural(
      "buttons().trigger()",
      "button().trigger()",
      function () {
        return this.each(function (t) {
          t.inst.node(t.node).trigger("click");
        });
      }
    ),
    e.Api.register("button().popover()", function (n, e) {
      return this.map(function (t) {
        return t.inst._popover(n, this.button(this[0].node), e);
      });
    }),
    e.Api.register("buttons().containers()", function () {
      var i = x(),
        s = this._groupSelector;
      return (
        this.iterator(!0, "table", function (t) {
          if (t._buttons)
            for (
              var n = _.instanceSelector(s, t._buttons), e = 0, o = n.length;
              e < o;
              e++
            )
              i = i.add(n[e].container());
        }),
        i
      );
    }),
    e.Api.register("buttons().container()", function () {
      return this.containers().eq(0);
    }),
    e.Api.register("button().add()", function (t, n, e) {
      var o = this.context;
      return (
        o.length &&
          (o = _.instanceSelector(this._groupSelector, o[0]._buttons)).length &&
          o[0].add(n, t, e),
        this.button(this._groupSelector, t)
      );
    }),
    e.Api.register("buttons().destroy()", function () {
      return (
        this.pluck("inst")
          .unique()
          .each(function (t) {
            t.destroy();
          }),
        this
      );
    }),
    e.Api.registerPlural(
      "buttons().remove()",
      "buttons().remove()",
      function () {
        return (
          this.each(function (t) {
            t.inst.remove(t.node);
          }),
          this
        );
      }
    ),
    e.Api.register("buttons.info()", function (t, n, e) {
      var o = this;
      return (
        !1 === t
          ? (this.off("destroy.btn-info"),
            y(x("#datatables_buttons_info"), 400, function () {
              x(this).remove();
            }),
            clearTimeout(s),
            (s = null))
          : (s && clearTimeout(s),
            x("#datatables_buttons_info").length &&
              x("#datatables_buttons_info").remove(),
            (t = t ? "<h2>" + t + "</h2>" : ""),
            v(
              x('<div id="datatables_buttons_info" class="dt-button-info"/>')
                .html(t)
                .append(
                  x("<div/>")["string" == typeof n ? "html" : "append"](n)
                )
                .css("display", "none")
                .appendTo("body")
            ),
            void 0 !== e &&
              0 !== e &&
              (s = setTimeout(function () {
                o.buttons.info(!1);
              }, e)),
            this.on("destroy.btn-info", function () {
              o.buttons.info(!1);
            })),
        this
      );
    }),
    e.Api.register("buttons.exportData()", function (t) {
      if (this.context.length) return u(new e.Api(this.context[0]), t);
    }),
    e.Api.register("buttons.exportInfo()", function (t) {
      return {
        filename: n((t = t || {}), this),
        title: r(t, this),
        messageTop: l(this, t, t.message || t.messageTop, "top"),
        messageBottom: l(this, t, t.messageBottom, "bottom"),
      };
    });
  var s,
    n = function (t, n) {
      var e;
      return null ==
        (e =
          "function" ==
          typeof (e =
            "*" === t.filename &&
            "*" !== t.title &&
            void 0 !== t.title &&
            null !== t.title &&
            "" !== t.title
              ? t.title
              : t.filename)
            ? e(t, n)
            : e)
        ? null
        : (e = (e =
            -1 !== e.indexOf("*")
              ? e.replace("*", x("head > title").text()).trim()
              : e).replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, "")) +
            (a(t.extension, t, n) || "");
    },
    a = function (t, n, e) {
      return null == t ? null : "function" == typeof t ? t(n, e) : t;
    },
    r = function (t, n) {
      t = a(t.title, t, n);
      return null === t
        ? null
        : -1 !== t.indexOf("*")
          ? t.replace("*", x("head > title").text() || "Exported data")
          : t;
    },
    l = function (t, n, e, o) {
      e = a(e, n, t);
      return null === e
        ? null
        : ((n = x("caption", t.table().container()).eq(0)),
          "*" === e
            ? n.css("caption-side") !== o
              ? null
              : n.length
                ? n.text()
                : ""
            : e);
    },
    c = x("<textarea/>")[0],
    u = function (e, t) {
      for (
        var o = x.extend(
            !0,
            {},
            {
              rows: null,
              columns: "",
              modifier: { search: "applied", order: "applied" },
              orthogonal: "display",
              stripHtml: !0,
              stripNewlines: !0,
              decodeEntities: !0,
              trim: !0,
              format: {
                header: function (t) {
                  return _.stripData(t, o);
                },
                footer: function (t) {
                  return _.stripData(t, o);
                },
                body: function (t) {
                  return _.stripData(t, o);
                },
              },
              customizeData: null,
            },
            t
          ),
          t = e
            .columns(o.columns)
            .indexes()
            .map(function (t) {
              var n = e.column(t);
              return o.format.header(n.title(), t, n.header());
            })
            .toArray(),
          n = e.table().footer()
            ? e
                .columns(o.columns)
                .indexes()
                .map(function (t) {
                  var n = e.column(t).footer();
                  return o.format.footer(
                    n ? x(".dt-column-title", n).html() : "",
                    t,
                    n
                  );
                })
                .toArray()
            : null,
          i = x.extend({}, o.modifier),
          s =
            (e.select &&
              "function" == typeof e.select.info &&
              void 0 === i.selected &&
              e.rows(o.rows, x.extend({ selected: !0 }, i)).any() &&
              x.extend(i, { selected: !0 }),
            e.rows(o.rows, i).indexes().toArray()),
          s = e.cells(s, o.columns, { order: i.order }),
          a = s.render(o.orthogonal).toArray(),
          r = s.nodes().toArray(),
          l = s.indexes().toArray(),
          c = t.length,
          u = [],
          d = 0,
          f = 0,
          p = 0 < c ? a.length / c : 0;
        f < p;
        f++
      ) {
        for (var h = [c], b = 0; b < c; b++)
          (h[b] = o.format.body(a[d], l[f + b].row, l[f + b].column, r[d])),
            d++;
        u[f] = h;
      }
      i = {
        header: t,
        headerStructure: e.table().header.structure(o.columns),
        footer: n,
        footerStructure: e.table().footer.structure(o.columns),
        body: u,
      };
      return o.customizeData && o.customizeData(i), i;
    };
  function t(t, n) {
    (t = new e.Api(t)), (n = n || t.init().buttons || e.defaults.buttons);
    return new _(t, n).container();
  }
  return (
    (x.fn.dataTable.Buttons = _),
    (x.fn.DataTable.Buttons = _),
    x(m).on("init.dt plugin-init.dt", function (t, n) {
      "dt" === t.namespace &&
        (t = n.oInit.buttons || e.defaults.buttons) &&
        !n._buttons &&
        new _(n, t).container();
    }),
    e.ext.feature.push({ fnInit: t, cFeature: "B" }),
    e.feature && e.feature.register("buttons", t),
    e
  );
});

// buttons.colVis.min.js
!(function (e) {
  var o, i;
  "function" == typeof define && define.amd
    ? define(
        ["jquery", "datatables.net", "datatables.net-buttons"],
        function (n) {
          return e(n, window, document);
        }
      )
    : "object" == typeof exports
      ? ((o = require("jquery")),
        (i = function (n, t) {
          t.fn.dataTable || require("datatables.net")(n, t),
            t.fn.dataTable.Buttons || require("datatables.net-buttons")(n, t);
        }),
        "undefined" == typeof window
          ? (module.exports = function (n, t) {
              return (
                (n = n || window), (t = t || o(n)), i(n, t), e(t, 0, n.document)
              );
            })
          : (i(window, o), (module.exports = e(o, window, window.document))))
      : e(jQuery, window, document);
})(function (n, t, e) {
  "use strict";
  var o = n.fn.dataTable;
  return (
    n.extend(o.ext.buttons, {
      colvis: function (n, t) {
        var e = null,
          o = {
            extend: "collection",
            init: function (n, t) {
              e = t;
            },
            text: function (n) {
              return n.i18n("buttons.colvis", "Column visibility");
            },
            className: "buttons-colvis",
            closeButton: !1,
            buttons: [
              {
                extend: "columnsToggle",
                columns: t.columns,
                columnText: t.columnText,
              },
            ],
          };
        return (
          n.on("column-reorder.dt" + t.namespace, function () {
            n.button(null, n.button(null, e).node()).collectionRebuild([
              {
                extend: "columnsToggle",
                columns: t.columns,
                columnText: t.columnText,
              },
            ]);
          }),
          o
        );
      },
      columnsToggle: function (n, t) {
        return n
          .columns(t.columns)
          .indexes()
          .map(function (n) {
            return {
              extend: "columnToggle",
              columns: n,
              columnText: t.columnText,
            };
          })
          .toArray();
      },
      columnToggle: function (n, t) {
        return {
          extend: "columnVisibility",
          columns: t.columns,
          columnText: t.columnText,
        };
      },
      columnsVisibility: function (n, t) {
        return n
          .columns(t.columns)
          .indexes()
          .map(function (n) {
            return {
              extend: "columnVisibility",
              columns: n,
              visibility: t.visibility,
              columnText: t.columnText,
            };
          })
          .toArray();
      },
      columnVisibility: {
        columns: void 0,
        text: function (n, t, e) {
          return e._columnText(n, e);
        },
        className: "buttons-columnVisibility",
        action: function (n, t, e, o) {
          var t = t.columns(o.columns),
            i = t.visible();
          t.visible(
            void 0 !== o.visibility ? o.visibility : !(i.length && i[0])
          );
        },
        init: function (e, n, o) {
          var i = this;
          n.attr("data-cv-idx", o.columns),
            e
              .on("column-visibility.dt" + o.namespace, function (n, t) {
                t.bDestroying ||
                  t.nTable != e.settings()[0].nTable ||
                  i.active(e.column(o.columns).visible());
              })
              .on("column-reorder.dt" + o.namespace, function () {
                o.destroying ||
                  (1 === e.columns(o.columns).count() &&
                    (i.text(o._columnText(e, o)),
                    i.active(e.column(o.columns).visible())));
              }),
            this.active(e.column(o.columns).visible());
        },
        destroy: function (n, t, e) {
          n.off("column-visibility.dt" + e.namespace).off(
            "column-reorder.dt" + e.namespace
          );
        },
        _columnText: function (n, t) {
          var e, o;
          return "string" == typeof t.text
            ? t.text
            : ((e = n.column(t.columns).index()),
              (o = (o =
                (o = n.settings()[0].aoColumns[e].sTitle) ||
                n.column(e).header().innerHTML)
                .replace(/\n/g, " ")
                .replace(/<br\s*\/?>/gi, " ")
                .replace(/<select(.*?)<\/select>/g, "")
                .replace(/<!\-\-.*?\-\->/g, "")
                .replace(/<.*?>/g, "")
                .replace(/^\s+|\s+$/g, "")),
              t.columnText ? t.columnText(n, e, o) : o);
        },
      },
      colvisRestore: {
        className: "buttons-colvisRestore",
        text: function (n) {
          return n.i18n("buttons.colvisRestore", "Restore visibility");
        },
        init: function (n, t, e) {
          n.columns().every(function () {
            var n = this.init();
            void 0 === n.__visOriginal && (n.__visOriginal = this.visible());
          });
        },
        action: function (n, t, e, o) {
          t.columns().every(function (n) {
            var t = this.init();
            this.visible(t.__visOriginal);
          });
        },
      },
      colvisGroup: {
        className: "buttons-colvisGroup",
        action: function (n, t, e, o) {
          t.columns(o.show).visible(!0, !1),
            t.columns(o.hide).visible(!1, !1),
            t.columns.adjust();
        },
        show: [],
        hide: [],
      },
    }),
    o
  );
});

// buttons.html5.min.js
!(function (o) {
  var l, n;
  "function" == typeof define && define.amd
    ? define(
        ["jquery", "datatables.net", "datatables.net-buttons"],
        function (t) {
          return o(t, window, document);
        }
      )
    : "object" == typeof exports
      ? ((l = require("jquery")),
        (n = function (t, e) {
          e.fn.dataTable || require("datatables.net")(t, e),
            e.fn.dataTable.Buttons || require("datatables.net-buttons")(t, e);
        }),
        "undefined" == typeof window
          ? (module.exports = function (t, e) {
              return (
                (t = t || window), (e = e || l(t)), n(t, e), o(e, t, t.document)
              );
            })
          : (n(window, l), (module.exports = o(l, window, window.document))))
      : o(jQuery, window, document);
})(function (S, C, u) {
  "use strict";
  var e,
    o,
    t = S.fn.dataTable;
  function T() {
    return e || C.JSZip;
  }
  function m() {
    return o || C.pdfMake;
  }
  (t.Buttons.pdfMake = function (t) {
    if (!t) return m();
    o = t;
  }),
    (t.Buttons.jszip = function (t) {
      if (!t) return T();
      e = t;
    });
  function k(t) {
    var e = "Sheet1";
    return (e = t.sheetName ? t.sheetName.replace(/[\[\]\*\/\\\?\:]/g, "") : e);
  }
  function c(t, e) {
    function o(t) {
      for (var e = "", o = 0, l = t.length; o < l; o++)
        0 < o && (e += a),
          (e += r ? r + ("" + t[o]).replace(d, p + r) + r : t[o]);
      return e;
    }
    var l = y(e),
      n = t.buttons.exportData(e.exportOptions),
      r = e.fieldBoundary,
      a = e.fieldSeparator,
      d = new RegExp(r, "g"),
      p = void 0 !== e.escapeChar ? e.escapeChar : "\\",
      t = "",
      i = "",
      f = [];
    e.header &&
      (t =
        n.headerStructure
          .map(function (t) {
            return o(
              t.map(function (t) {
                return t ? t.title : "";
              })
            );
          })
          .join(l) + l),
      e.footer &&
        n.footer &&
        (i =
          n.footerStructure
            .map(function (t) {
              return o(
                t.map(function (t) {
                  return t ? t.title : "";
                })
              );
            })
            .join(l) + l);
    for (var m = 0, s = n.body.length; m < s; m++) f.push(o(n.body[m]));
    return { str: t + f.join(l) + i, rows: f.length };
  }
  function s() {
    var t;
    return (
      -1 !== navigator.userAgent.indexOf("Safari") &&
      -1 === navigator.userAgent.indexOf("Chrome") &&
      -1 === navigator.userAgent.indexOf("Opera") &&
      !!(
        (t = navigator.userAgent.match(/AppleWebKit\/(\d+\.\d+)/)) &&
        1 < t.length &&
        +t[1] < 603.1
      )
    );
  }
  var N = (function (d) {
      var p, i, f, m, s, u, e, c, y, l, t;
      if (
        !(
          void 0 === d ||
          ("undefined" != typeof navigator &&
            /MSIE [1-9]\./.test(navigator.userAgent))
        )
      )
        return (
          (t = d.document),
          (p = function () {
            return d.URL || d.webkitURL || d;
          }),
          (i = t.createElementNS("http://www.w3.org/1999/xhtml", "a")),
          (f = "download" in i),
          (m = /constructor/i.test(d.HTMLElement) || d.safari),
          (s = /CriOS\/[\d]+/.test(navigator.userAgent)),
          (u = function (t) {
            (d.setImmediate || d.setTimeout)(function () {
              throw t;
            }, 0);
          }),
          (e = 4e4),
          (c = function (t) {
            setTimeout(function () {
              "string" == typeof t ? p().revokeObjectURL(t) : t.remove();
            }, e);
          }),
          (y = function (t) {
            return /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(
              t.type
            )
              ? new Blob([String.fromCharCode(65279), t], { type: t.type })
              : t;
          }),
          (t = (l = function (t, o, e) {
            e || (t = y(t));
            var l,
              n,
              r = this,
              e = "application/octet-stream" === t.type,
              a = function () {
                for (
                  var t = r,
                    e = "writestart progress write writeend".split(" "),
                    o = void 0,
                    l = (e = [].concat(e)).length;
                  l--;

                ) {
                  var n = t["on" + e[l]];
                  if ("function" == typeof n)
                    try {
                      n.call(t, o || t);
                    } catch (t) {
                      u(t);
                    }
                }
              };
            (r.readyState = r.INIT),
              f
                ? ((l = p().createObjectURL(t)),
                  setTimeout(function () {
                    var t, e;
                    (i.href = l),
                      (i.download = o),
                      (t = i),
                      (e = new MouseEvent("click")),
                      t.dispatchEvent(e),
                      a(),
                      c(l),
                      (r.readyState = r.DONE);
                  }))
                : (s || (e && m)) && d.FileReader
                  ? (((n = new FileReader()).onloadend = function () {
                      var t = s
                        ? n.result
                        : n.result.replace(
                            /^data:[^;]*;/,
                            "data:attachment/file;"
                          );
                      d.open(t, "_blank") || (d.location.href = t),
                        (r.readyState = r.DONE),
                        a();
                    }),
                    n.readAsDataURL(t),
                    (r.readyState = r.INIT))
                  : ((l = l || p().createObjectURL(t)),
                    (!e && d.open(l, "_blank")) || (d.location.href = l),
                    (r.readyState = r.DONE),
                    a(),
                    c(l));
          }).prototype),
          "undefined" != typeof navigator && navigator.msSaveOrOpenBlob
            ? function (t, e, o) {
                return (
                  (e = e || t.name || "download"),
                  o || (t = y(t)),
                  navigator.msSaveOrOpenBlob(t, e)
                );
              }
            : ((t.abort = function () {}),
              (t.readyState = t.INIT = 0),
              (t.WRITING = 1),
              (t.DONE = 2),
              (t.error =
                t.onwritestart =
                t.onprogress =
                t.onwrite =
                t.onabort =
                t.onerror =
                t.onwriteend =
                  null),
              function (t, e, o) {
                return new l(t, e || t.name || "download", o);
              })
        );
    })(
      ("undefined" != typeof self && self) ||
        (void 0 !== C && C) ||
        this.content
    ),
    y =
      ((t.fileSave = N),
      function (t) {
        return (
          t.newline || (navigator.userAgent.match(/Windows/) ? "\r\n" : "\n")
        );
      });
  function O(t) {
    for (
      var e = "A".charCodeAt(0), o = "Z".charCodeAt(0) - e + 1, l = "";
      0 <= t;

    )
      (l = String.fromCharCode((t % o) + e) + l), (t = Math.floor(t / o) - 1);
    return l;
  }
  try {
    var z,
      D = new XMLSerializer();
  } catch (t) {}
  function E(t, e, o) {
    var l = t.createElement(e);
    return (
      o &&
        (o.attr && S(l).attr(o.attr),
        o.children &&
          S.each(o.children, function (t, e) {
            l.appendChild(e);
          }),
        null !== o.text) &&
        void 0 !== o.text &&
        l.appendChild(t.createTextNode(o.text)),
      l
    );
  }
  function A(t, e, o, l, n) {
    var r = S("mergeCells", t);
    r[0].appendChild(
      E(t, "mergeCell", {
        attr: { ref: O(o) + e + ":" + O(o + n - 1) + (e + l - 1) },
      })
    ),
      r.attr("count", parseFloat(r.attr("count")) + 1);
  }
  var R = {
      "_rels/.rels":
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      "xl/_rels/workbook.xml.rels":
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      "[Content_Types].xml":
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml" /><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" /><Default Extension="jpeg" ContentType="image/jpeg" /><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" /><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" /><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" /></Types>',
      "xl/workbook.xml":
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/><workbookPr showInkAnnotation="0" autoCompressPictures="0"/><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets><definedNames/></workbook>',
      "xl/worksheets/sheet1.xml":
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><sheetData/><mergeCells count="0"/></worksheet>',
      "xl/styles.xml":
        '<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><numFmts count="6"><numFmt numFmtId="164" formatCode="[$$-409]#,##0.00;-[$$-409]#,##0.00"/><numFmt numFmtId="165" formatCode="&quot;£&quot;#,##0.00"/><numFmt numFmtId="166" formatCode="[$€-2] #,##0.00"/><numFmt numFmtId="167" formatCode="0.0%"/><numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/><numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/></numFmts><fonts count="5" x14ac:knownFonts="1"><font><sz val="11" /><name val="Calibri" /></font><font><sz val="11" /><name val="Calibri" /><color rgb="FFFFFFFF" /></font><font><sz val="11" /><name val="Calibri" /><b /></font><font><sz val="11" /><name val="Calibri" /><i /></font><font><sz val="11" /><name val="Calibri" /><u /></font></fonts><fills count="6"><fill><patternFill patternType="none" /></fill><fill><patternFill patternType="none" /></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9D9D9" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD99795" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="ffc6efce" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="ffc6cfef" /><bgColor indexed="64" /></patternFill></fill></fills><borders count="2"><border><left /><right /><top /><bottom /><diagonal /></border><border diagonalUp="false" diagonalDown="false"><left style="thin"><color auto="1" /></left><right style="thin"><color auto="1" /></right><top style="thin"><color auto="1" /></top><bottom style="thin"><color auto="1" /></bottom><diagonal /></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" /></cellStyleXfs><cellXfs count="68"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="left"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="right"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="fill"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment textRotation="90"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment wrapText="1"/></xf><xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="1" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="2" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="14" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0" /></cellStyles><dxfs count="0" /><tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" /></styleSheet>',
    },
    _ = [
      {
        match: /^\-?\d+\.\d%$/,
        style: 60,
        fmt: function (t) {
          return t / 100;
        },
      },
      {
        match: /^\-?\d+\.?\d*%$/,
        style: 56,
        fmt: function (t) {
          return t / 100;
        },
      },
      { match: /^\-?\$[\d,]+.?\d*$/, style: 57 },
      { match: /^\-?£[\d,]+.?\d*$/, style: 58 },
      { match: /^\-?€[\d,]+.?\d*$/, style: 59 },
      { match: /^\-?\d+$/, style: 65 },
      { match: /^\-?\d+\.\d{2}$/, style: 66 },
      {
        match: /^\([\d,]+\)$/,
        style: 61,
        fmt: function (t) {
          return -1 * t.replace(/[\(\)]/g, "");
        },
      },
      {
        match: /^\([\d,]+\.\d{2}\)$/,
        style: 62,
        fmt: function (t) {
          return -1 * t.replace(/[\(\)]/g, "");
        },
      },
      { match: /^\-?[\d,]+$/, style: 63 },
      { match: /^\-?[\d,]+\.\d{2}$/, style: 64 },
      {
        match: /^[\d]{4}\-[01][\d]\-[0123][\d]$/,
        style: 67,
        fmt: function (t) {
          return Math.round(25569 + Date.parse(t) / 864e5);
        },
      },
    ];
  return (
    (t.ext.buttons.copyHtml5 = {
      className: "buttons-copy buttons-html5",
      text: function (t) {
        return t.i18n("buttons.copy", "Copy");
      },
      action: function (t, e, o, l, n) {
        var r = c(e, l),
          a = e.buttons.exportInfo(l),
          d = y(l),
          p = r.str,
          i = S("<div/>").css({
            height: 1,
            width: 1,
            overflow: "hidden",
            position: "fixed",
            top: 0,
            left: 0,
          }),
          d =
            (a.title && (p = a.title + d + d + p),
            a.messageTop && (p = a.messageTop + d + d + p),
            a.messageBottom && (p = p + d + d + a.messageBottom),
            l.customize && (p = l.customize(p, l, e)),
            S("<textarea readonly/>").val(p).appendTo(i));
        if (u.queryCommandSupported("copy")) {
          i.appendTo(e.table().container()), d[0].focus(), d[0].select();
          try {
            var f = u.execCommand("copy");
            if ((i.remove(), f))
              return (
                e.buttons.info(
                  e.i18n("buttons.copyTitle", "Copy to clipboard"),
                  e.i18n(
                    "buttons.copySuccess",
                    {
                      1: "Copied one row to clipboard",
                      _: "Copied %d rows to clipboard",
                    },
                    r.rows
                  ),
                  2e3
                ),
                void n()
              );
          } catch (t) {}
        }
        function m() {
          s.off("click.buttons-copy"),
            S(u).off(".buttons-copy"),
            e.buttons.info(!1);
        }
        var a = S(
            "<span>" +
              e.i18n(
                "buttons.copyKeys",
                "Press <i>ctrl</i> or <i>⌘</i> + <i>C</i> to copy the table data<br>to your system clipboard.<br><br>To cancel, click this message or press escape."
              ) +
              "</span>"
          ).append(i),
          s =
            (e.buttons.info(
              e.i18n("buttons.copyTitle", "Copy to clipboard"),
              a,
              0
            ),
            d[0].focus(),
            d[0].select(),
            S(a).closest(".dt-button-info"));
        s.on("click.buttons-copy", m),
          S(u)
            .on("keydown.buttons-copy", function (t) {
              27 === t.keyCode && (m(), n());
            })
            .on("copy.buttons-copy cut.buttons-copy", function () {
              m(), n();
            });
      },
      async: 100,
      exportOptions: {},
      fieldSeparator: "\t",
      fieldBoundary: "",
      header: !0,
      footer: !1,
      title: "*",
      messageTop: "*",
      messageBottom: "*",
    }),
    (t.ext.buttons.csvHtml5 = {
      bom: !1,
      className: "buttons-csv buttons-html5",
      available: function () {
        return void 0 !== C.FileReader && C.Blob;
      },
      text: function (t) {
        return t.i18n("buttons.csv", "CSV");
      },
      action: function (t, e, o, l, n) {
        var r = c(e, l).str,
          a = e.buttons.exportInfo(l),
          d = l.charset;
        l.customize && (r = l.customize(r, l, e)),
          (d =
            !1 !== d
              ? (d = d || u.characterSet || u.charset) && ";charset=" + d
              : ""),
          l.bom && (r = String.fromCharCode(65279) + r),
          N(new Blob([r], { type: "text/csv" + d }), a.filename, !0),
          n();
      },
      async: 100,
      filename: "*",
      extension: ".csv",
      exportOptions: {},
      fieldSeparator: ",",
      fieldBoundary: '"',
      escapeChar: '"',
      charset: null,
      header: !0,
      footer: !1,
    }),
    (t.ext.buttons.excelHtml5 = {
      className: "buttons-excel buttons-html5",
      available: function () {
        return void 0 !== C.FileReader && void 0 !== T() && !s() && D;
      },
      text: function (t) {
        return t.i18n("buttons.excel", "Excel");
      },
      action: function (t, e, o, f, l) {
        function n(t) {
          return (t = R[t]), S.parseXML(t);
        }
        function r(t) {
          s = E(c, "row", { attr: { r: (m = u + 1) } });
          for (var e = 0, o = t.length; e < o; e++) {
            var l = O(e) + "" + m,
              n = null;
            if (null === t[e] || void 0 === t[e] || "" === t[e]) {
              if (!0 !== f.createEmptyCells) continue;
              t[e] = "";
            }
            var r = t[e];
            t[e] = "function" == typeof t[e].trim ? t[e].trim() : t[e];
            for (var a = 0, d = _.length; a < d; a++) {
              var p = _[a];
              if (t[e].match && !t[e].match(/^0\d+/) && t[e].match(p.match)) {
                var i = t[e].replace(/[^\d\.\-]/g, "");
                p.fmt && (i = p.fmt(i)),
                  (n = E(c, "c", {
                    attr: { r: l, s: p.style },
                    children: [E(c, "v", { text: i })],
                  }));
                break;
              }
            }
            (n =
              n ||
              ("number" == typeof t[e] ||
              (t[e].match &&
                t[e].match(/^-?\d+(\.\d+)?([eE]\-?\d+)?$/) &&
                !t[e].match(/^0\d+/))
                ? E(c, "c", {
                    attr: { t: "n", r: l },
                    children: [E(c, "v", { text: t[e] })],
                  })
                : ((r = r.replace
                    ? r.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
                    : r),
                  E(c, "c", {
                    attr: { t: "inlineStr", r: l },
                    children: {
                      row: E(c, "is", {
                        children: {
                          row: E(c, "t", {
                            text: r,
                            attr: { "xml:space": "preserve" },
                          }),
                        },
                      }),
                    },
                  })))),
              s.appendChild(n);
          }
          y.appendChild(s), u++;
        }
        function a(t) {
          t.forEach(function (t) {
            r(
              t.map(function (t) {
                return t ? t.title : "";
              })
            ),
              S("row:last c", c).attr("s", "2"),
              t.forEach(function (t, e) {
                t &&
                  (1 < t.colSpan || 1 < t.rowSpan) &&
                  A(c, u, e, t.rowSpan, t.colSpan);
              });
          });
        }
        var d,
          m,
          s,
          u = 0,
          c = n("xl/worksheets/sheet1.xml"),
          y = c.getElementsByTagName("sheetData")[0],
          p = {
            _rels: { ".rels": n("_rels/.rels") },
            xl: {
              _rels: { "workbook.xml.rels": n("xl/_rels/workbook.xml.rels") },
              "workbook.xml": n("xl/workbook.xml"),
              "styles.xml": n("xl/styles.xml"),
              worksheets: { "sheet1.xml": c },
            },
            "[Content_Types].xml": n("[Content_Types].xml"),
          },
          i = e.buttons.exportData(f.exportOptions),
          I = (f.customizeData && f.customizeData(i), e.buttons.exportInfo(f));
        I.title &&
          (r([I.title]),
          A(c, u, 0, 1, i.header.length),
          S("row:last c", c).attr("s", "51")),
          I.messageTop && (r([I.messageTop]), A(c, u, 0, 1, i.header.length)),
          f.header && a(i.headerStructure);
        for (var F = u, x = 0, h = i.body.length; x < h; x++) r(i.body[x]);
        (d = u),
          f.footer && i.footer && a(i.footerStructure),
          I.messageBottom &&
            (r([I.messageBottom]), A(c, u, 0, 1, i.header.length));
        var b = E(c, "cols");
        S("worksheet", c).prepend(b);
        for (var g = 0, v = i.header.length; g < v; g++)
          b.appendChild(
            E(c, "col", {
              attr: {
                min: g + 1,
                max: g + 1,
                width: (function (t, e) {
                  var o = t.header[e].length;
                  t.footer &&
                    t.footer[e].length > o &&
                    (o = t.footer[e].length);
                  for (var l = 0, n = t.body.length; l < n; l++) {
                    var r,
                      a = t.body[l][e];
                    if (
                      40 <
                      (o =
                        o <
                        (r = (
                          -1 !==
                          (a = null != a ? a.toString() : "").indexOf("\n")
                            ? ((r = a.split("\n")).sort(function (t, e) {
                                return e.length - t.length;
                              }),
                              r[0])
                            : a
                        ).length)
                          ? r
                          : o)
                    )
                      return 54;
                  }
                  return 6 < (o *= 1.35) ? o : 6;
                })(i, g),
                customWidth: 1,
              },
            })
          );
        var w = p.xl["workbook.xml"];
        S("sheets sheet", w).attr("name", k(f)),
          f.autoFilter &&
            (S("mergeCells", c).before(
              E(c, "autoFilter", {
                attr: { ref: "A" + F + ":" + O(i.header.length - 1) + d },
              })
            ),
            S("definedNames", w).append(
              E(w, "definedName", {
                attr: {
                  name: "_xlnm._FilterDatabase",
                  localSheetId: "0",
                  hidden: 1,
                },
                text: k(f) + "!$A$" + F + ":" + O(i.header.length - 1) + d,
              })
            )),
          f.customize && f.customize(p, f, e),
          0 === S("mergeCells", c).children().length &&
            S("mergeCells", c).remove();
        var w = new (T())(),
          F = {
            compression: "DEFLATE",
            type: "blob",
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          B =
            (!(function f(m, t) {
              void 0 === z &&
                (z =
                  -1 ===
                  D.serializeToString(
                    new C.DOMParser().parseFromString(
                      R["xl/worksheets/sheet1.xml"],
                      "text/xml"
                    )
                  ).indexOf("xmlns:r")),
                S.each(t, function (t, e) {
                  if (S.isPlainObject(e)) f(m.folder(t), e);
                  else {
                    if (z) {
                      for (
                        var o,
                          l = e.childNodes[0],
                          n = [],
                          r = l.attributes.length - 1;
                        0 <= r;
                        r--
                      ) {
                        var a = l.attributes[r].nodeName,
                          d = l.attributes[r].nodeValue;
                        -1 !== a.indexOf(":") &&
                          (n.push({ name: a, value: d }), l.removeAttribute(a));
                      }
                      for (r = 0, o = n.length; r < o; r++) {
                        var p = e.createAttribute(
                          n[r].name.replace(":", "_dt_b_namespace_token_")
                        );
                        (p.value = n[r].value), l.setAttributeNode(p);
                      }
                    }
                    var i = D.serializeToString(e),
                      i = (i = z
                        ? (i = (i =
                            -1 === i.indexOf("<?xml")
                              ? '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                                i
                              : i).replace(
                            /_dt_b_namespace_token_/g,
                            ":"
                          )).replace(/xmlns:NS[\d]+="" NS[\d]+:/g, "")
                        : i).replace(
                        /<([^<>]*?) xmlns=""([^<>]*?)>/g,
                        "<$1 $2>"
                      );
                    m.file(t, i);
                  }
                });
            })(w, p),
            I.filename);
        175 < B && (B = B.substr(0, 175)),
          w.generateAsync
            ? w.generateAsync(F).then(function (t) {
                N(t, B), l();
              })
            : (N(w.generate(F), B), l());
      },
      async: 100,
      filename: "*",
      extension: ".xlsx",
      exportOptions: {},
      header: !0,
      footer: !0,
      title: "*",
      messageTop: "*",
      messageBottom: "*",
      createEmptyCells: !1,
      autoFilter: !1,
      sheetName: "",
    }),
    (t.ext.buttons.pdfHtml5 = {
      className: "buttons-pdf buttons-html5",
      available: function () {
        return void 0 !== C.FileReader && m();
      },
      text: function (t) {
        return t.i18n("buttons.pdf", "PDF");
      },
      action: function (t, e, o, l, n) {
        var r = e.buttons.exportData(l.exportOptions),
          a = e.buttons.exportInfo(l),
          d = [];
        l.header &&
          r.headerStructure.forEach(function (t) {
            d.push(
              t.map(function (t) {
                return t
                  ? {
                      text: t.title,
                      colSpan: t.colspan,
                      rowSpan: t.rowspan,
                      style: "tableHeader",
                    }
                  : {};
              })
            );
          });
        for (var p = 0, i = r.body.length; p < i; p++)
          d.push(
            r.body[p].map(function (t) {
              return {
                text: null == t ? "" : "string" == typeof t ? t : t.toString(),
              };
            })
          );
        l.footer &&
          r.footerStructure.forEach(function (t) {
            d.push(
              t.map(function (t) {
                return t
                  ? {
                      text: t.title,
                      colSpan: t.colspan,
                      rowSpan: t.rowspan,
                      style: "tableHeader",
                    }
                  : {};
              })
            );
          });
        var f = {
            pageSize: l.pageSize,
            pageOrientation: l.orientation,
            content: [
              {
                style: "table",
                table: {
                  headerRows: r.headerStructure.length,
                  footerRows: r.footerStructure.length,
                  body: d,
                },
                layout: {
                  hLineWidth: function (t, e) {
                    return 0 === t || t === e.table.body.length ? 0 : 0.5;
                  },
                  vLineWidth: function () {
                    return 0;
                  },
                  hLineColor: function (t, e) {
                    return t === e.table.headerRows ||
                      t === e.table.body.length - e.table.footerRows
                      ? "#333"
                      : "#ddd";
                  },
                  fillColor: function (t) {
                    return t < r.headerStructure.length
                      ? "#fff"
                      : t % 2 == 0
                        ? "#f3f3f3"
                        : null;
                  },
                  paddingTop: function () {
                    return 5;
                  },
                  paddingBottom: function () {
                    return 5;
                  },
                },
              },
            ],
            styles: {
              tableHeader: { bold: !0, fontSize: 11, alignment: "center" },
              tableFooter: { bold: !0, fontSize: 11 },
              table: { margin: [0, 5, 0, 5] },
              title: { alignment: "center", fontSize: 13 },
              message: {},
            },
            defaultStyle: { fontSize: 10 },
          },
          e =
            (a.messageTop &&
              f.content.unshift({
                text: a.messageTop,
                style: "message",
                margin: [0, 0, 0, 12],
              }),
            a.messageBottom &&
              f.content.push({
                text: a.messageBottom,
                style: "message",
                margin: [0, 0, 0, 12],
              }),
            a.title &&
              f.content.unshift({
                text: a.title,
                style: "title",
                margin: [0, 0, 0, 12],
              }),
            l.customize && l.customize(f, l, e),
            m().createPdf(f));
        "open" !== l.download || s() ? e.download(a.filename) : e.open(), n();
      },
      async: 100,
      title: "*",
      filename: "*",
      extension: ".pdf",
      exportOptions: {},
      orientation: "portrait",
      pageSize:
        "en-US" === navigator.language || "en-CA" === navigator.language
          ? "LETTER"
          : "A4",
      header: !0,
      footer: !0,
      messageTop: "*",
      messageBottom: "*",
      customize: null,
      download: "download",
    }),
    t
  );
});

// dataTables.keyTable.min.js
!(function (n) {
  var i, s;
  "function" == typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (e) {
        return n(e, window, document);
      })
    : "object" == typeof exports
      ? ((i = require("jquery")),
        (s = function (e, t) {
          t.fn.dataTable || require("datatables.net")(e, t);
        }),
        "undefined" == typeof window
          ? (module.exports = function (e, t) {
              return (
                (e = e || window), (t = t || i(e)), s(e, t), n(t, e, e.document)
              );
            })
          : (s(window, i), (module.exports = n(i, window, window.document))))
      : n(jQuery, window, document);
})(function (c, u, d) {
  "use strict";
  function o(e, t) {
    if (!l.versionCheck || !l.versionCheck("1.10.8"))
      throw "KeyTable requires DataTables 1.10.8 or newer";
    if (
      ((this.c = c.extend(!0, {}, l.defaults.keyTable, o.defaults, t)),
      (this.s = {
        dt: new l.Api(e),
        dtDrawing: !1,
        enable: !0,
        focusDraw: !1,
        waitingForDraw: !1,
        lastFocus: null,
        namespace: ".keyTable-" + n++,
        tabInput: null,
      }),
      (this.dom = {}),
      (t = this.s.dt.settings()[0]),
      (e = t.keytable))
    )
      return e;
    (t.keytable = this)._constructor();
  }
  var l = c.fn.dataTable,
    n = 0,
    f = 0;
  return (
    c.extend(o.prototype, {
      blur: function () {
        this._blur();
      },
      enable: function (e) {
        this.s.enable = e;
      },
      enabled: function () {
        return this.s.enable;
      },
      focus: function (e, t) {
        this._focus(this.s.dt.cell(e, t));
      },
      focused: function (e) {
        var t;
        return (
          !!this.s.lastFocus &&
          ((t = this.s.lastFocus.cell.index()), e.row === t.row) &&
          e.column === t.column
        );
      },
      _constructor: function () {
        this._tabInput();
        var i,
          o = this,
          s = this.s.dt,
          e = c(s.table().node()),
          l = this.s.namespace,
          t = !1,
          n =
            ("static" === e.css("position") && e.css("position", "relative"),
            c(s.table().body()).on("click" + l, "th, td", function (e) {
              var t;
              !1 !== o.s.enable &&
                (t = s.cell(this)).any() &&
                o._focus(t, null, !1, e);
            }),
            c(d).on("keydown" + l, function (e) {
              t || o.s.dtDrawing ? e.preventDefault() : o._key(e);
            }),
            this.c.blurable &&
              c(d).on("mousedown" + l, function (e) {
                c(e.target).parents(".dataTables_filter, .dt-search").length &&
                  o._blur(),
                  c(e.target).parents().filter(s.table().container()).length ||
                    c(e.target).parents("div.DTE").length ||
                    c(e.target).parents("div.editor-datetime").length ||
                    c(e.target).parents("div.dt-datetime").length ||
                    c(e.target).parents().filter(".DTFC_Cloned").length ||
                    o._blur();
              }),
            this.c.editor &&
              ((i = this.c.editor).on("open.keyTableMain", function (e, t, n) {
                "inline" !== t &&
                  o.s.enable &&
                  (o.enable(!1),
                  i.one("close" + l, function () {
                    o.enable(!0);
                  }));
              }),
              this.c.editOnFocus &&
                s.on(
                  "key-focus" + l + " key-refocus" + l,
                  function (e, t, n, i) {
                    o._editor(null, i, !0);
                  }
                ),
              s.on("key" + l, function (e, t, n, i, s) {
                o._editor(n, s, !1);
              }),
              c(s.table().body()).on("dblclick" + l, "th, td", function (e) {
                !1 === o.s.enable ||
                  !s.cell(this).any() ||
                  (o.s.lastFocus && this !== o.s.lastFocus.cell.node()) ||
                  o._editor(null, e, !0);
              }),
              i
                .on("preSubmit", function () {
                  t = !0;
                })
                .on("preSubmitCancelled", function () {
                  t = !1;
                })
                .on("submitComplete", function () {
                  t = !1;
                })),
            s.on("stateSaveParams" + l, function (e, t, n) {
              n.keyTable = o.s.lastFocus ? o.s.lastFocus.cell.index() : null;
            }),
            s.on("column-visibility" + l, function (e) {
              o._tabInput();
            }),
            s.on("column-reorder" + l, function (e, t, n) {
              var i,
                s = o.s.lastFocus;
              s &&
                s.cell &&
                ((i = s.relative.column),
                (s.cell[0][0].column = n.mapping.indexOf(i)),
                (s.relative.column = n.mapping.indexOf(i)));
            }),
            s.on("preDraw" + l + " scroller-will-draw" + l, function (e) {
              o.s.dtDrawing = !0;
            }),
            s.on("draw" + l, function (e) {
              var t, n, i;
              (o.s.dtDrawing = !1),
                o._tabInput(),
                o.s.focusDraw ||
                  (o.s.lastFocus &&
                    ((t = o.s.lastFocus.relative),
                    (n = s.page.info()),
                    (i = t.row),
                    0 === n.recordsDisplay ||
                      i < n.start ||
                      i > n.start + n.length ||
                      (i >= n.recordsDisplay && (i = n.recordsDisplay - 1),
                      o._focus(i, t.column, !0, e))));
            }),
            this.c.clipboard && this._clipboard(),
            s.on("destroy" + l, function () {
              o._blur(!0),
                s.off(l),
                c(s.table().body())
                  .off("click" + l, "th, td")
                  .off("dblclick" + l, "th, td"),
                c(d)
                  .off("mousedown" + l)
                  .off("keydown" + l)
                  .off("copy" + l)
                  .off("paste" + l);
            }),
            s.state.loaded());
        n && n.keyTable
          ? s.one("init", function () {
              var e = s.cell(n.keyTable);
              e.any() && e.focus();
            })
          : this.c.focus && s.cell(this.c.focus).focus();
      },
      _blur: function (e) {
        var t;
        this.s.enable &&
          this.s.lastFocus &&
          ((t = this.s.lastFocus.cell),
          c(t.node()).removeClass(this.c.className),
          (this.s.lastFocus = null),
          e ||
            (this._updateFixedColumns(t.index().column),
            this._emitEvent("key-blur", [this.s.dt, t])));
      },
      _clipboard: function () {
        var o = this.s.dt,
          l = this,
          e = this.s.namespace,
          t = this.c.clipboard;
        u.getSelection &&
          ((!0 !== t && !t.copy) ||
            c(d).on("copy" + e, function (e) {
              var e = e.originalEvent,
                t = u.getSelection().toString(),
                n = l.s.lastFocus;
              !t &&
                n &&
                (e.clipboardData.setData(
                  "text/plain",
                  n.cell.render(l.c.clipboardOrthogonal)
                ),
                e.preventDefault());
            }),
          (!0 !== t && !t.paste) ||
            c(d).on("paste" + e, function (e) {
              var t,
                e = e.originalEvent,
                n = l.s.lastFocus,
                i = d.activeElement,
                s = l.c.editor;
              !n ||
                (i && "body" !== i.nodeName.toLowerCase()) ||
                (e.preventDefault(),
                u.clipboardData && u.clipboardData.getData
                  ? (t = u.clipboardData.getData("Text"))
                  : e.clipboardData &&
                    e.clipboardData.getData &&
                    (t = e.clipboardData.getData("text/plain")),
                s
                  ? ((i = l._inlineOptions(n.cell.index())),
                    s
                      .inline(i.cell, i.field, i.options)
                      .set(s.displayed()[0], t)
                      .submit())
                  : (n.cell.data(t), o.draw(!1)));
            }));
      },
      _columns: function () {
        var e = this.s.dt,
          t = e.columns(this.c.columns).indexes(),
          n = [];
        return (
          e.columns(":visible").every(function (e) {
            -1 !== t.indexOf(e) && n.push(e);
          }),
          n
        );
      },
      _editor: function (e, t, n) {
        var i, s, o, l, a, r;
        !this.s.lastFocus ||
          (t && "draw" === t.type) ||
          ((s = (i = this).s.dt),
          (o = this.c.editor),
          (l = this.s.lastFocus.cell),
          (a = this.s.namespace + "e" + f++),
          c("div.DTE", l.node()).length) ||
          (null !== e &&
            ((0 <= e && e <= 9) ||
              11 === e ||
              12 === e ||
              (14 <= e && e <= 31) ||
              (112 <= e && e <= 123) ||
              (127 <= e && e <= 159))) ||
          (t && (t.stopPropagation(), 13 === e) && t.preventDefault(),
          (r = function () {
            var e = i._inlineOptions(l.index());
            o.one("open" + a, function () {
              o.off("cancelOpen" + a),
                n ||
                  c(
                    "div.DTE_Field_InputControl input, div.DTE_Field_InputControl textarea"
                  ).select(),
                s.keys.enable(n ? "tab-only" : "navigation-only"),
                s.on("key-blur.editor", function (e, t, n) {
                  "submit" !== o.s.editOpts.onBlur &&
                    o.displayed() &&
                    n.node() === l.node() &&
                    o.submit();
                }),
                n && c(s.table().container()).addClass("dtk-focus-alt"),
                o.on("preSubmitCancelled" + a, function () {
                  setTimeout(function () {
                    i._focus(l, null, !1);
                  }, 50);
                }),
                o.on("submitUnsuccessful" + a, function () {
                  i._focus(l, null, !1);
                }),
                o.one("close" + a, function () {
                  s.keys.enable(!0),
                    s.off("key-blur.editor"),
                    o.off(a),
                    c(s.table().container()).removeClass("dtk-focus-alt"),
                    i.s.returnSubmit &&
                      ((i.s.returnSubmit = !1),
                      i._emitEvent("key-return-submit", [s, l]));
                });
            })
              .one("cancelOpen" + a, function () {
                o.off(a);
              })
              .inline(e.cell, e.field, e.options);
          }),
          13 === e
            ? ((n = !0),
              c(d).one("keyup", function () {
                r();
              }))
            : r());
      },
      _inlineOptions: function (e) {
        return this.c.editorOptions
          ? this.c.editorOptions(e)
          : { cell: e, field: void 0, options: void 0 };
      },
      _emitEvent: function (n, i) {
        return this.s.dt.iterator("table", function (e, t) {
          return c(e.nTable).triggerHandler(n, i);
        });
      },
      _focus: function (e, t, n, i) {
        var s = this,
          o = this.s.dt,
          l = o.page.info(),
          a = this.s.lastFocus;
        if (((i = i || null), this.s.enable)) {
          if ("number" != typeof e) {
            if (!e.any()) return;
            var r = e.index();
            if (
              ((t = r.column),
              (e = o
                .rows({ filter: "applied", order: "applied" })
                .indexes()
                .indexOf(r.row)) < 0)
            )
              return;
            l.serverSide && (e += l.start);
          }
          if (-1 !== l.length && (e < l.start || e >= l.start + l.length))
            (this.s.focusDraw = !0),
              (this.s.waitingForDraw = !0),
              o
                .one("draw", function () {
                  (s.s.focusDraw = !1),
                    (s.s.waitingForDraw = !1),
                    s._focus(e, t, void 0, i);
                })
                .page(Math.floor(e / l.length))
                .draw(!1);
          else if (-1 !== c.inArray(t, this._columns())) {
            l.serverSide && (e -= l.start);
            (r = o
              .cells(null, t, { search: "applied", order: "applied" })
              .flatten()),
              (l = o.cell(r[e])),
              (r = this._emitEvent("key-prefocus", [this.s.dt, l, i || null]));
            if (-1 === r.indexOf(!1)) {
              if (a) {
                if (a.node === l.node())
                  return void this._emitEvent("key-refocus", [
                    this.s.dt,
                    l,
                    i || null,
                  ]);
                this._blur();
              }
              this._removeOtherFocus();
              (r = c(l.node())),
                (a =
                  (r.addClass(this.c.className),
                  this._updateFixedColumns(t),
                  (void 0 !== n && !0 !== n) ||
                    (this._scroll(c(u), c(d.body), r, "offset"),
                    (a = o.table().body().parentNode) !==
                      o.table().header().parentNode &&
                      ((n = c(a.parentNode)),
                      this._scroll(n, n, r, "position"))),
                  o.page.info()));
              (this.s.lastFocus = {
                cell: l,
                node: l.node(),
                relative: {
                  row:
                    a.start +
                    o
                      .rows({ page: "current" })
                      .indexes()
                      .indexOf(l.index().row),
                  column: l.index().column,
                },
              }),
                this._emitEvent("key-focus", [this.s.dt, l, i || null]),
                o.state.save();
            }
          }
        }
      },
      _key: function (n) {
        if (this.s.waitingForDraw) n.preventDefault();
        else if (!c(n.target).closest(".dte-inlineAdd").length) {
          var e = this.s.enable,
            t =
              ((this.s.returnSubmit =
                ("navigation-only" === e || "tab-only" === e) &&
                13 === n.keyCode),
              !0 === e || "navigation-only" === e);
          if (
            e &&
            (!(0 === n.keyCode || n.ctrlKey || n.metaKey || n.altKey) ||
              (n.ctrlKey && n.altKey))
          ) {
            var i = this.s.lastFocus;
            if (i)
              if (this.s.dt.cell(i.node).any()) {
                var s = this,
                  o = this.s.dt,
                  l = !!this.s.dt.settings()[0].oScroll.sY;
                if (!this.c.keys || -1 !== c.inArray(n.keyCode, this.c.keys))
                  switch (n.keyCode) {
                    case 9:
                      n.preventDefault(),
                        this._keyAction(function () {
                          s._shift(n, n.shiftKey ? "left" : "right", !0);
                        });
                      break;
                    case 27:
                      c(i.node).find("div.DTE").length ||
                        (this.c.blurable && !0 === e && this._blur());
                      break;
                    case 33:
                    case 34:
                      t &&
                        !l &&
                        (n.preventDefault(),
                        this._keyAction(function () {
                          o.page(33 === n.keyCode ? "previous" : "next").draw(
                            !1
                          );
                        }));
                      break;
                    case 35:
                    case 36:
                      t &&
                        (n.preventDefault(),
                        this._keyAction(function () {
                          var e = o.cells({ page: "current" }).indexes(),
                            t = s._columns();
                          s._focus(
                            o.cell(e[35 === n.keyCode ? e.length - 1 : t[0]]),
                            null,
                            !0,
                            n
                          );
                        }));
                      break;
                    case 37:
                      t &&
                        this._keyAction(function () {
                          s._shift(n, "left");
                        });
                      break;
                    case 38:
                      t &&
                        this._keyAction(function () {
                          s._shift(n, "up");
                        });
                      break;
                    case 39:
                      t &&
                        this._keyAction(function () {
                          s._shift(n, "right");
                        });
                      break;
                    case 40:
                      t &&
                        this._keyAction(function () {
                          s._shift(n, "down");
                        });
                      break;
                    case 113:
                      if (this.c.editor) {
                        this._editor(null, n, !0);
                        break;
                      }
                    default:
                      !0 === e &&
                        this._emitEvent("key", [
                          o,
                          n.keyCode,
                          this.s.lastFocus.cell,
                          n,
                        ]);
                  }
              } else this.s.lastFocus = null;
          }
        }
      },
      _keyAction: function (e) {
        var t = this.c.editor;
        t && t.mode() ? t.submit(e) : e();
      },
      _removeOtherFocus: function () {
        var t = this.s.dt.table().node();
        c.fn.dataTable.tables({ api: !0 }).iterator("table", function (e) {
          this.table().node() !== t && this.cell.blur();
        });
      },
      _scroll: function (e, t, n, i) {
        var s = n[i](),
          o = n.outerHeight(),
          l = n.outerWidth(),
          a = t.scrollTop(),
          r = t.scrollLeft(),
          c = e.height(),
          e = e.width();
        "position" === i &&
          (s.top += parseInt(n.closest("table").css("top"), 10)),
          s.top < a && s.top + o > a - 5 && t.scrollTop(s.top),
          s.left < r && t.scrollLeft(s.left),
          s.top + o > a + c &&
            s.top < a + c + 5 &&
            o < c &&
            t.scrollTop(s.top + o - c),
          s.left + l > r + e && l < e && t.scrollLeft(s.left + l - e);
      },
      _shift: function (e, t, n) {
        var i,
          s = this.s.dt,
          o = s.page.info(),
          l = o.recordsDisplay,
          a = this._columns(),
          r = this.s.lastFocus;
        r &&
          (r = r.cell) &&
          ((i = s
            .rows({ filter: "applied", order: "applied" })
            .indexes()
            .indexOf(r.index().row)),
          o.serverSide && (i += o.start),
          (o = i),
          (r = a[(i = s.columns(a).indexes().indexOf(r.index().column))]),
          "rtl" === c(s.table().node()).css("direction") &&
            ("right" === t ? (t = "left") : "left" === t && (t = "right")),
          "right" === t
            ? (r = i >= a.length - 1 ? (o++, a[0]) : a[i + 1])
            : "left" === t
              ? (r = 0 === i ? (o--, a[a.length - 1]) : a[i - 1])
              : "up" === t
                ? o--
                : "down" === t && o++,
          0 <= o && o < l && -1 !== c.inArray(r, a)
            ? (e && e.preventDefault(), this._focus(o, r, !0, e))
            : n && this.c.blurable
              ? this._blur()
              : e && e.preventDefault());
      },
      _tabInput: function () {
        var n = this,
          i = this.s.dt,
          e =
            null !== this.c.tabIndex
              ? this.c.tabIndex
              : i.settings()[0].iTabIndex;
        -1 != e &&
          (this.s.tabInput ||
            ((e = c('<div><input type="text" tabindex="' + e + '"/></div>').css(
              { position: "absolute", height: 1, width: 0, overflow: "hidden" }
            ))
              .children()
              .on("focus", function (e) {
                var t = i.cell(":eq(0)", n._columns(), { page: "current" });
                t.any() && n._focus(t, null, !0, e);
              }),
            (this.s.tabInput = e)),
          (e = this.s.dt
            .cell(":eq(0)", "0:visible", { page: "current", order: "current" })
            .node())) &&
          c(e).prepend(this.s.tabInput);
      },
      _updateFixedColumns: function (e) {
        var t,
          n = this.s.dt,
          i = n.settings()[0];
        i._oFixedColumns &&
          ((t = i._oFixedColumns.s.iLeftColumns),
          (i = i.aoColumns.length - i._oFixedColumns.s.iRightColumns),
          e < t || i <= e) &&
          n.fixedColumns().update();
      },
    }),
    (o.defaults = {
      blurable: !0,
      className: "focus",
      clipboard: !0,
      clipboardOrthogonal: "display",
      columns: "",
      editor: null,
      editOnFocus: !1,
      editorOptions: null,
      focus: null,
      keys: null,
      tabIndex: null,
    }),
    (o.version = "2.12.0"),
    (c.fn.dataTable.KeyTable = o),
    (c.fn.DataTable.KeyTable = o),
    l.Api.register("cell.blur()", function () {
      return this.iterator("table", function (e) {
        e.keytable && e.keytable.blur();
      });
    }),
    l.Api.register("cell().focus()", function () {
      return this.iterator("cell", function (e, t, n) {
        e.keytable && e.keytable.focus(t, n);
      });
    }),
    l.Api.register("keys.disable()", function () {
      return this.iterator("table", function (e) {
        e.keytable && e.keytable.enable(!1);
      });
    }),
    l.Api.register("keys.enable()", function (t) {
      return this.iterator("table", function (e) {
        e.keytable && e.keytable.enable(void 0 === t || t);
      });
    }),
    l.Api.register("keys.enabled()", function (e) {
      var t = this.context;
      return !!t.length && !!t[0].keytable && t[0].keytable.enabled();
    }),
    l.Api.register("keys.move()", function (t) {
      return this.iterator("table", function (e) {
        e.keytable && e.keytable._shift(null, t, !1);
      });
    }),
    l.ext.selector.cell.push(function (e, t, n) {
      var i = t.focused,
        s = e.keytable,
        o = [];
      if (!s || void 0 === i) return n;
      for (var l = 0, a = n.length; l < a; l++)
        ((!0 === i && s.focused(n[l])) || (!1 === i && !s.focused(n[l]))) &&
          o.push(n[l]);
      return o;
    }),
    c(d).on("preInit.dt.dtk", function (e, t, n) {
      var i, s;
      "dt" === e.namespace &&
        ((e = t.oInit.keys), (i = l.defaults.keys), e || i) &&
        ((s = c.extend({}, i, e)), !1 !== e) &&
        new o(t, s);
    }),
    l
  );
});

// dataTables.searchPanes.min.js
!(function (e) {
  var a, i;
  "function" == typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (t) {
        return e(t, window, document);
      })
    : "object" == typeof exports
      ? ((a = require("jquery")),
        (i = function (t, s) {
          s.fn.dataTable || require("datatables.net")(t, s);
        }),
        "undefined" == typeof window
          ? (module.exports = function (t, s) {
              return (
                (t = t || window), (s = s || a(t)), i(t, s), e(s, t, t.document)
              );
            })
          : (i(window, a), (module.exports = e(a, window, window.document))))
      : e(jQuery, window, document);
})(function (n, r, o) {
  "use strict";
  var _,
    l,
    h,
    a,
    d,
    i,
    c,
    t,
    p,
    u,
    f,
    g,
    v,
    m,
    w,
    P,
    y,
    b,
    S,
    C,
    O,
    x,
    j,
    A,
    D,
    T = n.fn.dataTable;
  function B(t, s, e, a, i) {
    var o,
      n = this;
    if (
      (void 0 === i && (i = null),
      !l || !l.versionCheck || !l.versionCheck("1.10.0"))
    )
      throw new Error("SearchPane requires DataTables 1.10 or newer");
    if (l.select)
      return (
        (t = new l.Api(t)),
        (this.classes = _.extend(!0, {}, B.classes)),
        (this.c = _.extend(!0, {}, B.defaults, s, i)),
        s &&
          s.hideCount &&
          void 0 === s.viewCount &&
          (this.c.viewCount = !this.c.hideCount),
        (s = t.columns().eq(0).toArray().length),
        (this.s = {
          colExists: e < s,
          colOpts: void 0,
          customPaneSettings: i,
          displayed: !1,
          dt: t,
          dtPane: void 0,
          firstSet: !0,
          index: e,
          indexes: [],
          listSet: !1,
          name: void 0,
          rowData: {
            arrayFilter: [],
            arrayOriginal: [],
            bins: {},
            binsOriginal: {},
            filterMap: new Map(),
            totalOptions: 0,
          },
          scrollTop: 0,
          searchFunction: void 0,
          selections: [],
          serverSelect: [],
          serverSelecting: !1,
          tableLength: null,
          updating: !1,
        }),
        (this.s.colOpts = this.s.colExists
          ? this._getOptions()
          : this._getBonusOptions()),
        (this.dom = {
          buttonGroup: _("<div/>").addClass(this.classes.buttonGroup),
          clear: _('<button type="button">&#215;</button>')
            .attr("disabled", "true")
            .addClass(this.classes.disabledButton)
            .addClass(this.classes.paneButton)
            .addClass(this.classes.clearButton)
            .html(
              this.s.dt.i18n("searchPanes.clearPane", this.c.i18n.clearPane)
            ),
          collapseButton: _(
            '<button type="button"><span class="' +
              this.classes.caret +
              '">&#x5e;</span></button>'
          )
            .addClass(this.classes.paneButton)
            .addClass(this.classes.collapseButton),
          container: _("<div/>")
            .addClass(this.classes.container)
            .addClass(this.s.colOpts.className)
            .addClass(
              this.classes.layout +
                (parseInt(this.c.layout.split("-")[1], 10) < 10
                  ? this.c.layout
                  : this.c.layout.split("-")[0] + "-9")
            )
            .addClass(
              this.s.customPaneSettings && this.s.customPaneSettings.className
                ? this.s.customPaneSettings.className
                : ""
            ),
          countButton: _('<button type="button"><span></span></button>')
            .addClass(this.classes.paneButton)
            .addClass(this.classes.countButton),
          dtP: _(
            '<table width="100%"><thead><tr><th>' +
              (this.s.colExists
                ? _(this.s.dt.column(this.s.index).header()).text()
                : this.s.customPaneSettings.header || "Custom Pane") +
              "</th><th/></tr></thead></table>"
          ),
          lower: _("<div/>")
            .addClass(this.classes.subRow2)
            .addClass(this.classes.narrowButton),
          nameButton: _('<button type="button"><span></span></button>')
            .addClass(this.classes.paneButton)
            .addClass(this.classes.nameButton),
          panesContainer: _(a),
          searchBox: _("<input/>")
            .addClass(this.classes.paneInputButton)
            .addClass(this.classes.search),
          searchButton: _('<button type="button"><span></span></button>')
            .addClass(this.classes.searchIcon)
            .addClass(this.classes.paneButton),
          searchCont: _("<div/>").addClass(this.classes.searchCont),
          searchLabelCont: _("<div/>").addClass(this.classes.searchLabelCont),
          topRow: _("<div/>").addClass(this.classes.topRow),
          upper: _("<div/>")
            .addClass(this.classes.subRow1)
            .addClass(this.classes.narrowSearch),
        }),
        this.s.colOpts.name
          ? (this.s.name = this.s.colOpts.name)
          : this.s.customPaneSettings && this.s.customPaneSettings.name
            ? (this.s.name = this.s.customPaneSettings.name)
            : (this.s.name = this.s.colExists
                ? _(this.s.dt.column(this.s.index).header()).text()
                : this.s.customPaneSettings.header || "Custom Pane"),
        (o = this.s.dt.table(0).node()),
        (this.s.searchFunction = function (t, s, e) {
          return (
            0 === n.s.selections.length ||
            t.nTable !== o ||
            ((t = null),
            n.s.colExists &&
              ((t = s[n.s.index]),
              "filter" !== n.s.colOpts.orthogonal.filter) &&
              (t = n.s.rowData.filterMap.get(e)) instanceof
                _.fn.dataTable.Api &&
              (t = t.toArray()),
            n._search(t, e))
          );
        }),
        _.fn.dataTable.ext.search.push(this.s.searchFunction),
        this.c.clear &&
          this.dom.clear.on("click.dtsp", function () {
            n.dom.container
              .find("." + n.classes.search.replace(/\s+/g, "."))
              .each(function () {
                _(this).val("").trigger("input");
              }),
              n.clearPane();
          }),
        this.s.dt.on("draw.dtsp", function () {
          return n.adjustTopRow();
        }),
        this.s.dt.on("buttons-action.dtsp", function () {
          return n.adjustTopRow();
        }),
        this.s.dt.on("column-reorder.dtsp", function (t, s, e) {
          n.s.index = e.mapping[n.s.index];
        }),
        this
      );
    throw new Error("SearchPane requires Select");
  }
  function s(t, s, e, a, i) {
    return d.call(this, t, s, e, a, i) || this;
  }
  function e(t, s, e, a, i) {
    return (
      p.call(
        this,
        t,
        c.extend({ i18n: { countFiltered: "{shown} ({total})" } }, s),
        e,
        a,
        i
      ) || this
    );
  }
  function L(t, s, e, a, i) {
    return (
      v.call(this, t, f.extend({ i18n: { count: "{shown}" } }, s), e, a, i) ||
      this
    );
  }
  function R(t, s, e, a, i) {
    return (
      y.call(
        this,
        t,
        w.extend(
          { i18n: { count: "{total}", countFiltered: "{shown} ({total})" } },
          s
        ),
        e,
        a,
        i
      ) || this
    );
  }
  function M(t, s, e, a) {
    var l = this;
    if (
      (void 0 === e && (e = !1),
      void 0 === a && (a = h),
      !S || !S.versionCheck || !S.versionCheck("1.10.0"))
    )
      throw new Error("SearchPane requires DataTables 1.10 or newer");
    if (!S.select) throw new Error("SearchPane requires Select");
    var d,
      i = new S.Api(t);
    if (
      ((this.classes = b.extend(!0, {}, M.classes)),
      (this.c = b.extend(!0, {}, M.defaults, s)),
      (this.dom = {
        clearAll: b('<button type="button"/>')
          .addClass(this.classes.clearAll)
          .html(i.i18n("searchPanes.clearMessage", this.c.i18n.clearMessage)),
        collapseAll: b('<button type="button"/>')
          .addClass(this.classes.collapseAll)
          .html(
            i.i18n("searchPanes.collapseMessage", this.c.i18n.collapseMessage)
          ),
        container: b("<div/>")
          .addClass(this.classes.panes)
          .html(i.i18n("searchPanes.loadMessage", this.c.i18n.loadMessage)),
        emptyMessage: b("<div/>").addClass(this.classes.emptyMessage),
        panes: b("<div/>").addClass(this.classes.container),
        showAll: b('<button type="button"/>')
          .addClass(this.classes.showAll)
          .addClass(this.classes.disabledButton)
          .attr("disabled", "true")
          .html(i.i18n("searchPanes.showMessage", this.c.i18n.showMessage)),
        title: b("<div/>").addClass(this.classes.title),
        titleRow: b("<div/>").addClass(this.classes.titleRow),
      }),
      (this.s = {
        colOpts: [],
        dt: i,
        filterCount: 0,
        minPaneWidth: 260,
        page: 0,
        paging: !1,
        pagingST: !1,
        paneClass: a,
        panes: [],
        selectionList: [],
        serverData: {},
        stateRead: !1,
        updating: !1,
      }),
      !i.settings()[0]._searchPanes)
    )
      return (
        b(o).on("draw.dt", function (t) {
          l.dom.container.find(t.target).length && l._updateFilterCount();
        }),
        this._getState(),
        this.s.dt.page.info().serverSide &&
          ((d = this.s.dt.settings()[0]),
          this.s.dt.on("preXhr.dtsps", function (t, s, e) {
            if (d === s) {
              void 0 === e.searchPanes && (e.searchPanes = {}),
                void 0 === e.searchPanes_null && (e.searchPanes_null = {});
              for (var a = 0, i = l.s.selectionList; a < i.length; a++) {
                var o = i[a],
                  n = l.s.dt.column(o.column).dataSrc();
                void 0 === e.searchPanes[n] && (e.searchPanes[n] = {}),
                  void 0 === e.searchPanes_null[n] &&
                    (e.searchPanes_null[n] = {});
                for (var r = 0; r < o.rows.length; r++)
                  (e.searchPanes[n][r] = o.rows[r]),
                    null === e.searchPanes[n][r]
                      ? (e.searchPanes_null[n][r] = !0)
                      : (e.searchPanes_null[n][r] = !1);
              }
              0 < l.s.selectionList.length && (e.searchPanesLast = n),
                (e.searchPanes_options = {
                  cascade: l.c.cascadePanes,
                  viewCount: l.c.viewCount,
                  viewTotal: l.c.viewTotal,
                });
            }
          })),
        this._setXHR(),
        (i.settings()[0]._searchPanes = this).s.dt.settings()[0]
          ._bInitComplete || e
          ? this._paneDeclare(i, t, s)
          : i.one("preInit.dtsps", function () {
              l._paneDeclare(i, t, s);
            }),
        this
      );
  }
  function k(t, s, e) {
    function a() {
      return o._initSelectionListeners(
        !0,
        n && n.searchPanes && n.searchPanes.selectionList
          ? n.searchPanes.selectionList
          : o.c.preSelect
      );
    }
    var i,
      o = this,
      t =
        (s.cascadePanes && s.viewTotal
          ? (i = C)
          : s.cascadePanes
            ? (i = P)
            : s.viewTotal && (i = g),
        (o = j.call(this, t, s, (e = void 0 === e ? !1 : e), i) || this).s.dt),
      n = t.state.loaded();
    return (
      t.settings()[0]._bInitComplete
        ? a()
        : t.off("init.dtsps").on("init.dtsps", a),
      o
    );
  }
  function N(s, e, t) {
    var a = n.extend(
        {
          filterChanged: function (t) {
            s.button(e).text(
              s.i18n(
                "searchPanes.collapse",
                (void 0 !== s.context[0].oLanguage.searchPanes
                  ? s.context[0].oLanguage.searchPanes
                  : s.context[0]._searchPanes.c.i18n
                ).collapse,
                t
              )
            );
          },
        },
        t.config
      ),
      a = new (
        a && (a.cascadePanes || a.viewTotal) ? T.SearchPanesST : T.SearchPanes
      )(s, a);
    s
      .button(e)
      .text(t.text || s.i18n("searchPanes.collapse", a.c.i18n.collapse, 0)),
      (t._panes = a);
  }
  function F(t, s, e) {
    void 0 === s && (s = null), void 0 === e && (e = !1);
    (t = new D.Api(t)),
      (s = s || t.init().searchPanes || D.defaults.searchPanes);
    return new (s && (s.cascadePanes || s.viewTotal) ? A : O)(
      t,
      s,
      e
    ).getNode();
  }
  return (
    (B.prototype.addRow = function (t, s, e, a, i, o, n) {
      var r;
      (o = o || this.s.rowData.bins[s] || 0), (n = n || this._getShown(s));
      for (var l = 0, d = this.s.indexes; l < d.length; l++) {
        var h = d[l];
        h.filter === s && (r = h.index);
      }
      return (
        void 0 === r &&
          ((r = this.s.indexes.length),
          this.s.indexes.push({ filter: s, index: r })),
        this.s.dtPane.row.add({
          className: i,
          display: "" !== t ? t : this.emptyMessage(),
          filter: s,
          index: r,
          shown: n,
          sort: e,
          total: o,
          type: a,
        })
      );
    }),
    (B.prototype.adjustTopRow = function () {
      var t = this.dom.container.find(
          "." + this.classes.subRowsContainer.replace(/\s+/g, ".")
        ),
        s = this.dom.container.find(
          "." + this.classes.subRow1.replace(/\s+/g, ".")
        ),
        e = this.dom.container.find(
          "." + this.classes.subRow2.replace(/\s+/g, ".")
        ),
        a = this.dom.container.find(
          "." + this.classes.topRow.replace(/\s+/g, ".")
        );
      (_(t[0]).width() < 252 || _(a[0]).width() < 252) && 0 !== _(t[0]).width()
        ? (_(t[0]).addClass(this.classes.narrow),
          _(s[0])
            .addClass(this.classes.narrowSub)
            .removeClass(this.classes.narrowSearch),
          _(e[0])
            .addClass(this.classes.narrowSub)
            .removeClass(this.classes.narrowButton))
        : (_(t[0]).removeClass(this.classes.narrow),
          _(s[0])
            .removeClass(this.classes.narrowSub)
            .addClass(this.classes.narrowSearch),
          _(e[0])
            .removeClass(this.classes.narrowSub)
            .addClass(this.classes.narrowButton));
    }),
    (B.prototype.clearData = function () {
      this.s.rowData = {
        arrayFilter: [],
        arrayOriginal: [],
        bins: {},
        binsOriginal: {},
        filterMap: new Map(),
        totalOptions: 0,
      };
    }),
    (B.prototype.clearPane = function () {
      return (
        this.s.dtPane.rows({ selected: !0 }).deselect(),
        this.updateTable(),
        this
      );
    }),
    (B.prototype.collapse = function () {
      var t = this;
      this.s.displayed &&
        (this.c.collapse || !0 === this.s.colOpts.collapse) &&
        !1 !== this.s.colOpts.collapse &&
        (_(this.s.dtPane.table().container()).addClass(this.classes.hidden),
        this.dom.topRow.addClass(this.classes.bordered),
        this.dom.nameButton.addClass(this.classes.disabledButton),
        this.dom.countButton.addClass(this.classes.disabledButton),
        this.dom.searchButton.addClass(this.classes.disabledButton),
        this.dom.collapseButton.addClass(this.classes.rotated),
        this.dom.topRow.one("click.dtsp", function () {
          return t.show();
        }),
        this.dom.topRow.trigger("collapse.dtsps"));
    }),
    (B.prototype.destroy = function () {
      this.s.dtPane && this.s.dtPane.off(".dtsp"),
        this.s.dt.off(".dtsp"),
        this.dom.clear.off(".dtsp"),
        this.dom.nameButton.off(".dtsp"),
        this.dom.countButton.off(".dtsp"),
        this.dom.searchButton.off(".dtsp"),
        this.dom.collapseButton.off(".dtsp"),
        _(this.s.dt.table().node()).off(".dtsp"),
        this.dom.container.detach();
      for (
        var t = _.fn.dataTable.ext.search.indexOf(this.s.searchFunction);
        -1 !== t;

      )
        _.fn.dataTable.ext.search.splice(t, 1),
          (t = _.fn.dataTable.ext.search.indexOf(this.s.searchFunction));
      this.s.dtPane && this.s.dtPane.destroy(), (this.s.listSet = !1);
    }),
    (B.prototype.emptyMessage = function () {
      var t = this.c.i18n.emptyMessage;
      return (
        this.c.emptyMessage && (t = this.c.emptyMessage),
        !1 !== this.s.colOpts.emptyMessage &&
          null !== this.s.colOpts.emptyMessage &&
          (t = this.s.colOpts.emptyMessage),
        this.s.dt.i18n("searchPanes.emptyMessage", t)
      );
    }),
    (B.prototype.getPaneCount = function () {
      return this.s.dtPane
        ? this.s.dtPane.rows({ selected: !0 }).data().toArray().length
        : 0;
    }),
    (B.prototype.rebuildPane = function (t, s) {
      void 0 === t && (t = null), void 0 === s && (s = !1), this.clearData();
      var e = [],
        a = ((this.s.serverSelect = []), null);
      return (
        this.s.dtPane &&
          (s &&
            (this.s.dt.page.info().serverSide
              ? (this.s.serverSelect = this.s.dtPane
                  .rows({ selected: !0 })
                  .data()
                  .toArray())
              : (e = this.s.dtPane.rows({ selected: !0 }).data().toArray())),
          this.s.dtPane.clear().destroy(),
          (a = this.dom.container.prev()),
          this.destroy(),
          (this.s.dtPane = void 0),
          _.fn.dataTable.ext.search.push(this.s.searchFunction)),
        this.dom.container.removeClass(this.classes.hidden),
        (this.s.displayed = !1),
        this._buildPane(
          this.s.dt.page.info().serverSide ? this.s.serverSelect : e,
          t,
          a
        ),
        this
      );
    }),
    (B.prototype.resize = function (t) {
      (this.c.layout = t),
        this.dom.container
          .removeClass()
          .addClass(this.classes.show)
          .addClass(this.classes.container)
          .addClass(this.s.colOpts.className)
          .addClass(
            this.classes.layout +
              (parseInt(t.split("-")[1], 10) < 10 ? t : t.split("-")[0] + "-9")
          )
          .addClass(
            null !== this.s.customPaneSettings &&
              this.s.customPaneSettings.className
              ? this.s.customPaneSettings.className
              : ""
          ),
        this.adjustTopRow();
    }),
    (B.prototype.setListeners = function () {
      var h = this;
      this.s.dtPane &&
        (this.s.dtPane.off("select.dtsp").on("select.dtsp", function () {
          clearTimeout(h.s.deselectTimeout),
            h._updateSelection(!h.s.updating),
            h.dom.clear
              .removeClass(h.classes.disabledButton)
              .removeAttr("disabled");
        }),
        this.s.dtPane.off("deselect.dtsp").on("deselect.dtsp", function () {
          h.s.deselectTimeout = setTimeout(function () {
            h._updateSelection(!0),
              0 === h.s.dtPane.rows({ selected: !0 }).data().toArray().length &&
                h.dom.clear
                  .addClass(h.classes.disabledButton)
                  .attr("disabled", "true");
          }, 50);
        }),
        this.s.firstSet &&
          ((this.s.firstSet = !1),
          this.s.dt.on("stateSaveParams.dtsp", function (t, s, e) {
            if (_.isEmptyObject(e)) h.s.dtPane.state.clear();
            else {
              var a,
                i,
                o,
                n,
                r,
                l = [];
              h.s.dtPane &&
                ((l = h.s.dtPane
                  .rows({ selected: !0 })
                  .data()
                  .map(function (t) {
                    return null !== t.filter ? t.filter.toString() : null;
                  })
                  .toArray()),
                (n = h.dom.searchBox.val()),
                (i = h.s.dtPane.order()),
                (a = h.s.rowData.binsOriginal),
                (r = h.s.rowData.arrayOriginal),
                (o = h.dom.collapseButton.hasClass(h.classes.rotated))),
                void 0 === e.searchPanes && (e.searchPanes = {}),
                void 0 === e.searchPanes.panes && (e.searchPanes.panes = []);
              for (var d = 0; d < e.searchPanes.panes.length; d++)
                e.searchPanes.panes[d].id === h.s.index &&
                  (e.searchPanes.panes.splice(d, 1), d--);
              e.searchPanes.panes.push({
                arrayFilter: r,
                bins: a,
                collapsed: o,
                id: h.s.index,
                order: i,
                searchTerm: n,
                selected: l,
              });
            }
          })),
        this.s.dtPane
          .off("user-select.dtsp")
          .on("user-select.dtsp", function (t, s, e, a, i) {
            i.stopPropagation();
          }),
        this.s.dtPane.off("draw.dtsp").on("draw.dtsp", function () {
          return h.adjustTopRow();
        }),
        this.dom.nameButton.off("click.dtsp").on("click.dtsp", function () {
          var t = h.s.dtPane.order()[0][1];
          h.s.dtPane.order([0, "asc" === t ? "desc" : "asc"]).draw(),
            h.s.dt.state.save();
        }),
        this.dom.countButton.off("click.dtsp").on("click.dtsp", function () {
          var t = h.s.dtPane.order()[0][1];
          h.s.dtPane.order([1, "asc" === t ? "desc" : "asc"]).draw(),
            h.s.dt.state.save();
        }),
        this.dom.collapseButton
          .off("click.dtsp")
          .on("click.dtsp", function (t) {
            t.stopPropagation();
            t = _(h.s.dtPane.table().container());
            t.toggleClass(h.classes.hidden),
              h.dom.topRow.toggleClass(h.classes.bordered),
              h.dom.nameButton.toggleClass(h.classes.disabledButton),
              h.dom.countButton.toggleClass(h.classes.disabledButton),
              h.dom.searchButton.toggleClass(h.classes.disabledButton),
              h.dom.collapseButton.toggleClass(h.classes.rotated),
              t.hasClass(h.classes.hidden)
                ? h.dom.topRow.on("click.dtsp", function () {
                    return h.dom.collapseButton.click();
                  })
                : h.dom.topRow.off("click.dtsp"),
              h.s.dt.state.save(),
              h.dom.topRow.trigger("collapse.dtsps");
          }),
        this.dom.clear.off("click.dtsp").on("click.dtsp", function () {
          h.dom.container
            .find("." + h.classes.search.replace(/ /g, "."))
            .each(function () {
              _(this).val("").trigger("input");
            }),
            h.clearPane();
        }),
        this.dom.searchButton.off("click.dtsp").on("click.dtsp", function () {
          return h.dom.searchBox.focus();
        }),
        this.dom.searchBox.off("click.dtsp").on("input.dtsp", function () {
          var t = h.dom.searchBox.val();
          h.s.dtPane.search(t).draw(),
            "string" == typeof t &&
            (0 < t.length ||
              (0 === t.length &&
                0 < h.s.dtPane.rows({ selected: !0 }).data().toArray().length))
              ? h.dom.clear
                  .removeClass(h.classes.disabledButton)
                  .removeAttr("disabled")
              : h.dom.clear
                  .addClass(h.classes.disabledButton)
                  .attr("disabled", "true"),
            h.s.dt.state.save();
        }),
        this.s.dtPane.select.style(
          this.s.colOpts.dtOpts &&
            this.s.colOpts.dtOpts.select &&
            this.s.colOpts.dtOpts.select.style
            ? this.s.colOpts.dtOpts.select.style
            : this.c.dtOpts &&
                this.c.dtOpts.select &&
                this.c.dtOpts.select.style
              ? this.c.dtOpts.select.style
              : "os"
        ));
    }),
    (B.prototype._serverPopulate = function (t) {
      t.tableLength
        ? ((this.s.tableLength = t.tableLength),
          (this.s.rowData.totalOptions = this.s.tableLength))
        : (null === this.s.tableLength ||
            this.s.dt.rows()[0].length > this.s.tableLength) &&
          ((this.s.tableLength = this.s.dt.rows()[0].length),
          (this.s.rowData.totalOptions = this.s.tableLength));
      var s = this.s.dt.column(this.s.index).dataSrc();
      if (t.searchPanes.options[s])
        for (var e = 0, a = t.searchPanes.options[s]; e < a.length; e++) {
          var i = a[e];
          this.s.rowData.arrayFilter.push({
            display: i.label,
            filter: i.value,
            sort: i.label,
            type: i.label,
          }),
            (this.s.rowData.bins[i.value] = i.total);
        }
      (t = Object.keys(this.s.rowData.bins).length),
        (s = this._uniqueRatio(t, this.s.tableLength));
      !1 === this.s.displayed &&
      ((void 0 === this.s.colOpts.show && null === this.s.colOpts.threshold
        ? s > this.c.threshold
        : s > this.s.colOpts.threshold) ||
        (!0 !== this.s.colOpts.show && t <= 1))
        ? (this.dom.container.addClass(this.classes.hidden),
          (this.s.displayed = !1))
        : ((this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter),
          (this.s.rowData.binsOriginal = this.s.rowData.bins),
          (this.s.displayed = !0));
    }),
    (B.prototype.show = function () {
      this.s.displayed &&
        (this.dom.topRow.removeClass(this.classes.bordered),
        this.dom.nameButton.removeClass(this.classes.disabledButton),
        this.dom.countButton.removeClass(this.classes.disabledButton),
        this.dom.searchButton.removeClass(this.classes.disabledButton),
        this.dom.collapseButton.removeClass(this.classes.rotated),
        _(this.s.dtPane.table().container()).removeClass(this.classes.hidden),
        this.dom.topRow.trigger("collapse.dtsps"));
    }),
    (B.prototype._uniqueRatio = function (t, s) {
      return 0 < s &&
        ((0 < this.s.rowData.totalOptions &&
          !this.s.dt.page.info().serverSide) ||
          (this.s.dt.page.info().serverSide && 0 < this.s.tableLength))
        ? t / this.s.rowData.totalOptions
        : 1;
    }),
    (B.prototype.updateTable = function () {
      var t = this.s.dtPane
        .rows({ selected: !0 })
        .data()
        .toArray()
        .map(function (t) {
          return t.filter;
        });
      (this.s.selections = t), this._searchExtras();
    }),
    (B.prototype._getComparisonRows = function () {
      var t =
        this.s.colOpts.options ||
        (this.s.customPaneSettings && this.s.customPaneSettings.options
          ? this.s.customPaneSettings.options
          : void 0);
      if (void 0 !== t) {
        var s = this.s.dt.rows(),
          e = s.data().toArray(),
          a = [];
        this.s.dtPane.clear(), (this.s.indexes = []);
        for (var i = 0, o = t; i < o.length; i++) {
          var n = o[i],
            r = "" !== n.label ? n.label : this.emptyMessage(),
            l = {
              className: n.className,
              display: r,
              filter: "function" == typeof n.value ? n.value : [],
              sort: void 0 !== n.order ? n.order : r,
              total: 0,
              type: r,
            };
          if ("function" == typeof n.value) {
            for (var d = 0; d < e.length; d++)
              n.value.call(this.s.dt, e[d], s[0][d]) && l.total++;
            "function" != typeof l.filter && l.filter.push(n.filter);
          }
          a.push(
            this.addRow(
              l.display,
              l.filter,
              l.sort,
              l.type,
              l.className,
              l.total
            )
          );
        }
        return a;
      }
    }),
    (B.prototype._getMessage = function (t) {
      return this.s.dt
        .i18n("searchPanes.count", this.c.i18n.count)
        .replace(/{total}/g, t.total);
    }),
    (B.prototype._getShown = function (t) {}),
    (B.prototype._getPaneConfig = function () {
      var a = this,
        t = l.Scroller,
        s = this.s.dt.settings()[0].oLanguage;
      return (
        (s.url = void 0),
        (s.sUrl = void 0),
        {
          columnDefs: [
            {
              className: "dtsp-nameColumn",
              data: "display",
              render: function (t, s, e) {
                return "sort" === s
                  ? e.sort
                  : "type" === s
                    ? e.type
                    : ((e = a._getMessage(e)),
                      (e =
                        '<span class="' +
                        a.classes.pill +
                        '">' +
                        e +
                        "</span>"),
                      (a.c.viewCount && a.s.colOpts.viewCount) || (e = ""),
                      "filter" === s
                        ? "string" == typeof t && null !== t.match(/<[^>]*>/)
                          ? t.replace(/<[^>]*>/g, "")
                          : t
                        : '<div class="' +
                          a.classes.nameCont +
                          '"><span title="' +
                          ("string" == typeof t && null !== t.match(/<[^>]*>/)
                            ? t.replace(/<[^>]*>/g, "")
                            : t) +
                          '" class="' +
                          a.classes.name +
                          '">' +
                          t +
                          "</span>" +
                          e +
                          "</div>");
              },
              targets: 0,
              type: this.s.dt.settings()[0].aoColumns[this.s.index]
                ? this.s.dt.settings()[0].aoColumns[this.s.index]._sManualType
                : null,
            },
            {
              className: "dtsp-countColumn " + this.classes.badgePill,
              data: "total",
              searchable: !1,
              targets: 1,
              visible: !1,
            },
          ],
          deferRender: !0,
          info: !1,
          language: s,
          paging: !!t,
          scrollX: !1,
          scrollY: "200px",
          scroller: !!t,
          select: !0,
          stateSave: !!this.s.dt.settings()[0].oFeatures.bStateSave,
        }
      );
    }),
    (B.prototype._makeSelection = function () {
      this.updateTable(),
        (this.s.updating = !0),
        this.s.dt.draw(),
        (this.s.updating = !1);
    }),
    (B.prototype._populatePaneArray = function (t, s, e, a) {
      void 0 === a && (a = this.s.rowData.bins);
      var i,
        e = e.fastData;
      "string" == typeof this.s.colOpts.orthogonal
        ? ((i = e(t, this.s.index, this.s.colOpts.orthogonal)),
          this.s.rowData.filterMap.set(t, i),
          this._addOption(i, i, i, i, s, a))
        : ("string" ==
            typeof (i =
              null ===
              (i = e(t, this.s.index, this.s.colOpts.orthogonal.search))
                ? ""
                : i) && (i = i.replace(/<[^>]*>/g, "")),
          this.s.rowData.filterMap.set(t, i),
          a[i]
            ? a[i]++
            : ((a[i] = 1),
              this._addOption(
                i,
                e(t, this.s.index, this.s.colOpts.orthogonal.display),
                e(t, this.s.index, this.s.colOpts.orthogonal.sort),
                e(t, this.s.index, this.s.colOpts.orthogonal.type),
                s,
                a
              ))),
        this.s.rowData.totalOptions++;
    }),
    (B.prototype._reloadSelect = function (t) {
      if (void 0 !== t) {
        for (var s, e = 0; e < t.searchPanes.panes.length; e++)
          if (t.searchPanes.panes[e].id === this.s.index) {
            s = e;
            break;
          }
        if (s)
          for (
            var a = this.s.dtPane,
              i = a
                .rows({ order: "index" })
                .data()
                .map(function (t) {
                  return null !== t.filter ? t.filter.toString() : null;
                })
                .toArray(),
              o = 0,
              n = t.searchPanes.panes[s].selected;
            o < n.length;
            o++
          ) {
            var r = n[o],
              l = -1;
            -1 < (l = null !== r ? i.indexOf(r.toString()) : l) &&
              ((this.s.serverSelecting = !0),
              a.row(l).select(),
              (this.s.serverSelecting = !1));
          }
      }
    }),
    (B.prototype._updateSelection = function (t) {
      function s(t) {
        T.versionCheck("2")
          ? e.s.dt.processing(t)
          : (t = e.s.dt.settings()[0]).oApi._fnProcessingDisplay(t, !1);
      }
      var e = this;
      s(!0),
        setTimeout(function () {
          (e.s.scrollTop = _(e.s.dtPane.table().node()).parent()[0].scrollTop),
            e.s.dt.page.info().serverSide && !e.s.updating
              ? e.s.serverSelecting ||
                ((e.s.serverSelect = e.s.dtPane
                  .rows({ selected: !0 })
                  .data()
                  .toArray()),
                e.s.dt.draw(!1))
              : t && e._makeSelection(),
            s(!1);
        }, 1);
    }),
    (B.prototype._addOption = function (t, s, e, a, i, o) {
      if (Array.isArray(t) || t instanceof l.Api) {
        if (
          (t instanceof l.Api && ((t = t.toArray()), (s = s.toArray())),
          t.length !== s.length)
        )
          throw new Error("display and filter not the same length");
        for (var n = 0; n < t.length; n++)
          o[t[n]]
            ? o[t[n]]++
            : ((o[t[n]] = 1),
              i.push({ display: s[n], filter: t[n], sort: e[n], type: a[n] })),
            this.s.rowData.totalOptions++;
      } else
        "string" == typeof this.s.colOpts.orthogonal
          ? (o[t]
              ? o[t]++
              : ((o[t] = 1),
                i.push({ display: s, filter: t, sort: e, type: a })),
            this.s.rowData.totalOptions++)
          : i.push({ display: s, filter: t, sort: e, type: a });
    }),
    (B.prototype._buildPane = function (t, s, e) {
      var i = this,
        a =
          (void 0 === t && (t = []),
          void 0 === s && (s = null),
          void 0 === e && (e = null),
          (this.s.selections = []),
          this.s.dt.state.loaded());
      if ((this.s.listSet && (a = this.s.dt.state()), this.s.colExists)) {
        var o = -1;
        if (a && a.searchPanes && a.searchPanes.panes)
          for (var n = 0; n < a.searchPanes.panes.length; n++)
            if (a.searchPanes.panes[n].id === this.s.index) {
              o = n;
              break;
            }
        if (
          (!1 === this.s.colOpts.show ||
            (void 0 !== this.s.colOpts.show && !0 !== this.s.colOpts.show)) &&
          -1 === o
        )
          return (
            this.dom.container.addClass(this.classes.hidden),
            (this.s.displayed = !1)
          );
        if (
          ((!0 !== this.s.colOpts.show && -1 === o) || (this.s.displayed = !0),
          this.s.dt.page.info().serverSide ||
            (s && s.searchPanes && s.searchPanes.options))
        )
          s &&
            s.searchPanes &&
            s.searchPanes.options &&
            this._serverPopulate(s);
        else {
          0 === this.s.rowData.arrayFilter.length &&
            ((this.s.rowData.totalOptions = 0),
            this._populatePane(),
            (this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter),
            (this.s.rowData.binsOriginal = this.s.rowData.bins));
          var r = Object.keys(this.s.rowData.binsOriginal).length,
            l = this._uniqueRatio(r, this.s.dt.rows()[0].length);
          if (
            !1 === this.s.displayed &&
            ((void 0 === this.s.colOpts.show &&
            null === this.s.colOpts.threshold
              ? l > this.c.threshold
              : l > this.s.colOpts.threshold) ||
              (!0 !== this.s.colOpts.show && r <= 1))
          )
            return (
              this.dom.container.addClass(this.classes.hidden),
              void (this.s.displayed = !1)
            );
          this.dom.container.addClass(this.classes.show),
            (this.s.displayed = !0);
        }
      } else this.s.displayed = !0;
      this._displayPane(),
        this.s.listSet ||
          this.dom.dtP.on("stateLoadParams.dtsp", function (t, s, e) {
            _.isEmptyObject(i.s.dt.state.loaded()) &&
              _.each(e, function (t) {
                delete e[t];
              });
          }),
        null !== e && 0 < this.dom.panesContainer.has(e).length
          ? this.dom.container.insertAfter(e)
          : this.dom.panesContainer.prepend(this.dom.container);
      (l = _.fn.dataTable.ext.errMode),
        (_.fn.dataTable.ext.errMode = "none"),
        this.dom.dtP.on("init.dt", function (t, s) {
          var e = i.dom.dtP.DataTable(),
            a = e.select.style();
          e.select.style(a);
        }),
        (this.s.dtPane = this.dom.dtP.DataTable(
          _.extend(
            !0,
            this._getPaneConfig(),
            this.c.dtOpts,
            this.s.colOpts ? this.s.colOpts.dtOpts : {},
            this.s.colOpts.options || !this.s.colExists
              ? {
                  createdRow: function (t, s) {
                    _(t).addClass(s.className);
                  },
                }
              : void 0,
            null !== this.s.customPaneSettings &&
              this.s.customPaneSettings.dtOpts
              ? this.s.customPaneSettings.dtOpts
              : {},
            _.fn.dataTable.versionCheck("2")
              ? {
                  layout: {
                    bottomStart: null,
                    bottomEnd: null,
                    topStart: null,
                    topEnd: null,
                  },
                }
              : { dom: "t" }
          )
        )),
        this.dom.dtP.addClass(this.classes.table),
        (r = "Custom Pane");
      if (
        (this.s.customPaneSettings && this.s.customPaneSettings.header
          ? (r = this.s.customPaneSettings.header)
          : this.s.colOpts.header
            ? (r = this.s.colOpts.header)
            : this.s.colExists &&
              (r = _.fn.dataTable.versionCheck("2")
                ? this.s.dt.column(this.s.index).title()
                : this.s.dt.settings()[0].aoColumns[this.s.index].sTitle),
        (r = this._escapeHTML(r)),
        this.dom.searchBox.attr("placeholder", r),
        (_.fn.dataTable.ext.errMode = l),
        this.s.colExists)
      )
        for (var d = 0, h = this.s.rowData.arrayFilter.length; d < h; d++)
          if (this.s.dt.page.info().serverSide)
            for (
              var c = this.addRow(
                  this.s.rowData.arrayFilter[d].display,
                  this.s.rowData.arrayFilter[d].filter,
                  this.s.rowData.arrayFilter[d].sort,
                  this.s.rowData.arrayFilter[d].type
                ),
                p = 0,
                u = this.s.serverSelect;
              p < u.length;
              p++
            )
              u[p].filter === this.s.rowData.arrayFilter[d].filter &&
                ((this.s.serverSelecting = !0),
                c.select(),
                (this.s.serverSelecting = !1));
          else
            !this.s.dt.page.info().serverSide && this.s.rowData.arrayFilter[d]
              ? this.addRow(
                  this.s.rowData.arrayFilter[d].display,
                  this.s.rowData.arrayFilter[d].filter,
                  this.s.rowData.arrayFilter[d].sort,
                  this.s.rowData.arrayFilter[d].type
                )
              : this.s.dt.page.info().serverSide || this.addRow("", "", "", "");
      (this.s.colOpts.options ||
        (this.s.customPaneSettings && this.s.customPaneSettings.options)) &&
        this._getComparisonRows(),
        this.s.dtPane.draw(),
        (this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop),
        this.adjustTopRow(),
        this.setListeners(),
        (this.s.listSet = !0);
      for (var f = 0, g = t; f < g.length; f++) {
        var v = g[f];
        if (v)
          for (
            var m = 0, w = this.s.dtPane.rows().indexes().toArray();
            m < w.length;
            m++
          )
            (c = w[m]),
              this.s.dtPane.row(c).data() &&
                v.filter === this.s.dtPane.row(c).data().filter &&
                (this.s.dt.page.info().serverSide
                  ? ((this.s.serverSelecting = !0),
                    this.s.dtPane.row(c).select(),
                    (this.s.serverSelecting = !1))
                  : this.s.dtPane.row(c).select());
      }
      if (
        (this.s.dt.page.info().serverSide &&
          this.s.dtPane.search(this.dom.searchBox.val()).draw(),
        ((this.c.initCollapsed && !1 !== this.s.colOpts.initCollapsed) ||
          this.s.colOpts.initCollapsed) &&
          ((this.c.collapse && !1 !== this.s.colOpts.collapse) ||
            this.s.colOpts.collapse) &&
          (this.s.dtPane.settings()[0]._bInitComplete
            ? this.collapse()
            : this.s.dtPane.one("init", function () {
                return i.collapse();
              })),
        a && a.searchPanes && a.searchPanes.panes && (!s || 1 === s.draw))
      ) {
        this._reloadSelect(a);
        for (var P = 0, y = a.searchPanes.panes; P < y.length; P++) {
          var b = y[P];
          b.id === this.s.index &&
            (b.searchTerm &&
              0 < b.searchTerm.length &&
              this.dom.searchBox.val(b.searchTerm).trigger("input"),
            b.order && this.s.dtPane.order(b.order).draw(),
            b.collapsed ? this.collapse() : this.show());
        }
      }
      return !0;
    }),
    (B.prototype._displayPane = function () {
      this.dom.dtP.empty(),
        this.dom.topRow.empty().addClass(this.classes.topRow),
        3 < parseInt(this.c.layout.split("-")[1], 10) &&
          this.dom.container.addClass(this.classes.smallGap),
        this.dom.topRow
          .addClass(this.classes.subRowsContainer)
          .append(this.dom.upper.append(this.dom.searchCont))
          .append(this.dom.lower.append(this.dom.buttonGroup)),
        (!1 === this.c.dtOpts.searching ||
          (this.s.colOpts.dtOpts && !1 === this.s.colOpts.dtOpts.searching) ||
          !this.c.controls ||
          !this.s.colOpts.controls ||
          (this.s.customPaneSettings &&
            this.s.customPaneSettings.dtOpts &&
            void 0 !== this.s.customPaneSettings.dtOpts.searching &&
            !this.s.customPaneSettings.dtOpts.searching)) &&
          this.dom.searchBox
            .removeClass(this.classes.paneInputButton)
            .addClass(this.classes.disabledButton)
            .attr("disabled", "true"),
        this.dom.searchBox.appendTo(this.dom.searchCont),
        this._searchContSetup(),
        this.c.clear &&
          this.c.controls &&
          this.s.colOpts.controls &&
          this.dom.clear.appendTo(this.dom.buttonGroup),
        this.c.orderable &&
          this.s.colOpts.orderable &&
          this.c.controls &&
          this.s.colOpts.controls &&
          this.dom.nameButton.appendTo(this.dom.buttonGroup),
        this.c.viewCount &&
          this.s.colOpts.viewCount &&
          this.c.orderable &&
          this.s.colOpts.orderable &&
          this.c.controls &&
          this.s.colOpts.controls &&
          this.dom.countButton.appendTo(this.dom.buttonGroup),
        ((this.c.collapse && !1 !== this.s.colOpts.collapse) ||
          this.s.colOpts.collapse) &&
          this.c.controls &&
          this.s.colOpts.controls &&
          this.dom.collapseButton.appendTo(this.dom.buttonGroup),
        this.dom.container.prepend(this.dom.topRow).append(this.dom.dtP).show();
    }),
    (B.prototype._escapeHTML = function (t) {
      return t
        .toString()
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');
    }),
    (B.prototype._getBonusOptions = function () {
      return _.extend(!0, {}, B.defaults, { threshold: null }, this.c || {});
    }),
    (B.prototype._getOptions = function () {
      var t = this.s.dt.settings()[0].aoColumns[this.s.index].searchPanes,
        s = _.extend(
          !0,
          {},
          B.defaults,
          {
            collapse: null,
            emptyMessage: !1,
            initCollapsed: null,
            threshold: null,
          },
          t
        );
      return (
        t &&
          t.hideCount &&
          void 0 === t.viewCount &&
          (s.viewCount = !t.hideCount),
        s
      );
    }),
    (B.prototype._populatePane = function () {
      (this.s.rowData.arrayFilter = []), (this.s.rowData.bins = {});
      var t = this.s.dt.context[0];
      if (!this.s.dt.page.info().serverSide)
        for (
          var s = 0, e = this.s.dt.rows().indexes().toArray();
          s < e.length;
          s++
        ) {
          var a = e[s];
          this._populatePaneArray(a, this.s.rowData.arrayFilter, t);
        }
    }),
    (B.prototype._search = function (t, s) {
      for (
        var e = this.s.colOpts, a = this.s.dt, i = 0, o = this.s.selections;
        i < o.length;
        i++
      ) {
        var n = o[i];
        if (
          ("string" == typeof n &&
            "string" == typeof t &&
            (n = this._escapeHTML(n)),
          Array.isArray(t))
        ) {
          if ("and" === e.combiner) {
            if (!t.includes(n)) return !1;
          } else if (t.includes(n)) return !0;
        } else if ("function" == typeof n) {
          if (n.call(a, a.row(s).data(), s)) {
            if ("or" === e.combiner) return !0;
          } else if ("and" === e.combiner) return !1;
        } else if (
          t === n ||
          (("string" != typeof t || 0 !== t.length) && t == n) ||
          (null === n && "string" == typeof t && "" === t)
        )
          return !0;
      }
      return "and" === e.combiner;
    }),
    (B.prototype._searchContSetup = function () {
      this.c.controls &&
        this.s.colOpts.controls &&
        this.dom.searchButton.appendTo(this.dom.searchLabelCont),
        !1 === this.c.dtOpts.searching ||
          !1 === this.s.colOpts.dtOpts.searching ||
          (this.s.customPaneSettings &&
            this.s.customPaneSettings.dtOpts &&
            void 0 !== this.s.customPaneSettings.dtOpts.searching &&
            !this.s.customPaneSettings.dtOpts.searching) ||
          this.dom.searchLabelCont.appendTo(this.dom.searchCont);
    }),
    (B.prototype._searchExtras = function () {
      var t = this.s.updating,
        s =
          ((this.s.updating = !0),
          this.s.dtPane
            .rows({ selected: !0 })
            .data()
            .pluck("filter")
            .toArray()),
        e = s.indexOf(this.emptyMessage()),
        a = _(this.s.dtPane.table().container());
      -1 < e && (s[e] = ""),
        0 < s.length
          ? a.addClass(this.classes.selected)
          : 0 === s.length && a.removeClass(this.classes.selected),
        (this.s.updating = t);
    }),
    (B.version = "2.1.2"),
    (B.classes = {
      bordered: "dtsp-bordered",
      buttonGroup: "dtsp-buttonGroup",
      buttonSub: "dtsp-buttonSub",
      caret: "dtsp-caret",
      clear: "dtsp-clear",
      clearAll: "dtsp-clearAll",
      clearButton: "clearButton",
      collapseAll: "dtsp-collapseAll",
      collapseButton: "dtsp-collapseButton",
      container: "dtsp-searchPane",
      countButton: "dtsp-countButton",
      disabledButton: "dtsp-disabledButton",
      hidden: "dtsp-hidden",
      hide: "dtsp-hide",
      layout: "dtsp-",
      name: "dtsp-name",
      nameButton: "dtsp-nameButton",
      nameCont: "dtsp-nameCont",
      narrow: "dtsp-narrow",
      paneButton: "dtsp-paneButton",
      paneInputButton: "dtsp-paneInputButton",
      pill: "dtsp-pill",
      rotated: "dtsp-rotated",
      search: "dtsp-search",
      searchCont: "dtsp-searchCont",
      searchIcon: "dtsp-searchIcon",
      searchLabelCont: "dtsp-searchButtonCont",
      selected: "dtsp-selected",
      smallGap: "dtsp-smallGap",
      subRow1: "dtsp-subRow1",
      subRow2: "dtsp-subRow2",
      subRowsContainer: "dtsp-subRowsContainer",
      title: "dtsp-title",
      topRow: "dtsp-topRow",
    }),
    (B.defaults = {
      clear: !0,
      collapse: !0,
      combiner: "or",
      container: function (t) {
        return t.table().container();
      },
      controls: !0,
      dtOpts: {},
      emptyMessage: null,
      hideCount: !1,
      i18n: {
        clearPane: "&times;",
        count: "{total}",
        emptyMessage: "<em>No data</em>",
      },
      initCollapsed: !1,
      layout: "auto",
      name: void 0,
      orderable: !0,
      orthogonal: {
        display: "display",
        filter: "filter",
        hideCount: !1,
        search: "filter",
        show: void 0,
        sort: "sort",
        threshold: 0.6,
        type: "type",
        viewCount: !0,
      },
      preSelect: [],
      threshold: 0.6,
      viewCount: !0,
    }),
    (h = B),
    (
      (r && r.__extends) ||
      ((a = function (t, s) {
        return (a =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array
            ? function (t, s) {
                t.__proto__ = s;
              }
            : function (t, s) {
                for (var e in s) s.hasOwnProperty(e) && (t[e] = s[e]);
              }))(t, s);
      }),
      function (t, s) {
        function e() {
          this.constructor = t;
        }
        a(t, s),
          (t.prototype =
            null === s
              ? Object.create(s)
              : ((e.prototype = s.prototype), new e()));
      })
    )(s, (d = h)),
    (s.prototype._emptyPane = function () {
      var t,
        e,
        s = this.s.dtPane;
      return T.versionCheck("2")
        ? ((t = s.select.last()) &&
            s.row(t.row).any() &&
            (e = s.row(t.row).data().index),
          s.rows().remove(),
          function () {
            var t;
            void 0 !== e &&
              ((t = s
                .row(function (t, s) {
                  return s.index === e;
                })
                .index()),
              s.select.last({ row: t, column: 0 }));
          })
        : (s.rows().remove(), function () {});
    }),
    (s.prototype._serverPopulate = function (t) {
      (this.s.rowData.binsShown = {}),
        (this.s.rowData.arrayFilter = []),
        void 0 !== t.tableLength
          ? ((this.s.tableLength = t.tableLength),
            (this.s.rowData.totalOptions = this.s.tableLength))
          : (null === this.s.tableLength ||
              this.s.dt.rows()[0].length > this.s.tableLength) &&
            ((this.s.tableLength = this.s.dt.rows()[0].length),
            (this.s.rowData.totalOptions = this.s.tableLength));
      var s,
        e = this.s.dt.column(this.s.index).dataSrc();
      if (void 0 !== t.searchPanes.options[e])
        for (var a = 0, i = t.searchPanes.options[e]; a < i.length; a++) {
          var o = i[a];
          this.s.rowData.arrayFilter.push({
            display: o.label,
            filter: o.value,
            shown: +o.count,
            sort: o.label,
            total: +o.total,
            type: o.label,
          }),
            (this.s.rowData.binsShown[o.value] = +o.count),
            (this.s.rowData.bins[o.value] = +o.total);
        }
      (t = Object.keys(this.s.rowData.bins).length),
        (e = this._uniqueRatio(t, this.s.tableLength));
      if (
        !this.s.colOpts.show &&
        !1 === this.s.displayed &&
        ((void 0 === this.s.colOpts.show && null === this.s.colOpts.threshold
          ? e > this.c.threshold
          : e > this.s.colOpts.threshold) ||
          (!0 !== this.s.colOpts.show && t <= 1))
      )
        this.dom.container.addClass(this.classes.hidden),
          (this.s.displayed = !1);
      else if (
        ((this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter),
        (this.s.rowData.binsOriginal = this.s.rowData.bins),
        (this.s.displayed = !0),
        this.s.dtPane)
      ) {
        for (
          var n = this.s.serverSelect,
            e = this._emptyPane(),
            r = 0,
            l = this.s.rowData.arrayFilter;
          r < l.length;
          r++
        )
          if (((s = l[r]), this._shouldAddRow(s)))
            for (
              var d = this.addRow(s.display, s.filter, s.sort, s.type), h = 0;
              h < n.length;
              h++
            )
              if ((u = n[h]).filter === s.filter) {
                (this.s.serverSelecting = !0),
                  d.select(),
                  (this.s.serverSelecting = !1),
                  n.splice(h, 1),
                  this.s.selections.push(s.filter);
                break;
              }
        for (var c = 0, p = n; c < p.length; c++)
          for (
            var u = p[c], f = 0, g = this.s.rowData.arrayOriginal;
            f < g.length;
            f++
          )
            (s = g[f]).filter === u.filter &&
              ((d = this.addRow(s.display, s.filter, s.sort, s.type)),
              (this.s.serverSelecting = !0),
              d.select(),
              (this.s.serverSelecting = !1),
              this.s.selections.push(s.filter));
        (this.s.serverSelect = this.s.dtPane
          .rows({ selected: !0 })
          .data()
          .toArray()),
          this.s.dtPane.draw(),
          e();
      }
    }),
    (s.prototype.updateRows = function () {
      if (!this.s.dt.page.info().serverSide) {
        this.s.rowData.binsShown = {};
        for (
          var t = 0,
            s = this.s.dt.rows({ search: "applied" }).indexes().toArray();
          t < s.length;
          t++
        ) {
          var e = s[t];
          this._updateShown(
            e,
            this.s.dt.settings()[0],
            this.s.rowData.binsShown
          );
        }
      }
      for (
        var a = this, i = 0, o = this.s.dtPane.rows().data().toArray();
        i < o.length;
        i++
      )
        !(function (e) {
          (e.shown =
            "number" == typeof a.s.rowData.binsShown[e.filter]
              ? a.s.rowData.binsShown[e.filter]
              : 0),
            a.s.dtPane
              .row(function (t, s) {
                return s && s.index === e.index;
              })
              .data(e);
        })(o[i]);
      this.s.dtPane.draw(),
        (this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop);
    }),
    (s.prototype._makeSelection = function () {}),
    (s.prototype._reloadSelect = function () {}),
    (s.prototype._shouldAddRow = function (t) {
      return !0;
    }),
    (s.prototype._updateSelection = function () {
      !this.s.dt.page.info().serverSide ||
        this.s.updating ||
        this.s.serverSelecting ||
        (this.s.serverSelect = this.s.dtPane
          .rows({ selected: !0 })
          .data()
          .toArray());
    }),
    (s.prototype._updateShown = function (t, s, e) {
      void 0 === e && (e = this.s.rowData.binsShown);
      function a(t) {
        e[t] ? e[t]++ : (e[t] = 1);
      }
      var i =
          "string" == typeof this.s.colOpts.orthogonal
            ? this.s.colOpts.orthogonal
            : this.s.colOpts.orthogonal.search,
        t = (0, this.s.dt.settings()[0].fastData)(t, this.s.index, i);
      if (Array.isArray(t)) for (var o = 0, n = t; o < n.length; o++) a(n[o]);
      else a(t);
    }),
    (t = s),
    (
      (r && r.__extends) ||
      ((i = function (t, s) {
        return (i =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array
            ? function (t, s) {
                t.__proto__ = s;
              }
            : function (t, s) {
                for (var e in s) s.hasOwnProperty(e) && (t[e] = s[e]);
              }))(t, s);
      }),
      function (t, s) {
        function e() {
          this.constructor = t;
        }
        i(t, s),
          (t.prototype =
            null === s
              ? Object.create(s)
              : ((e.prototype = s.prototype), new e()));
      })
    )(e, (p = t)),
    (e.prototype._getMessage = function (t) {
      var s = this.s.dt.i18n("searchPanes.count", this.c.i18n.count),
        e = this.s.dt.i18n(
          "searchPanes.countFiltered",
          this.c.i18n.countFiltered
        );
      return (this.s.filteringActive ? e : s)
        .replace(/{total}/g, t.total)
        .replace(/{shown}/g, t.shown);
    }),
    (e.prototype._getShown = function (t) {
      return this.s.rowData.binsShown && this.s.rowData.binsShown[t]
        ? this.s.rowData.binsShown[t]
        : 0;
    }),
    (g = e),
    (
      (r && r.__extends) ||
      ((u = function (t, s) {
        return (u =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array
            ? function (t, s) {
                t.__proto__ = s;
              }
            : function (t, s) {
                for (var e in s) s.hasOwnProperty(e) && (t[e] = s[e]);
              }))(t, s);
      }),
      function (t, s) {
        function e() {
          this.constructor = t;
        }
        u(t, s),
          (t.prototype =
            null === s
              ? Object.create(s)
              : ((e.prototype = s.prototype), new e()));
      })
    )(L, (v = t)),
    (L.prototype.updateRows = function () {
      var t = this.s.dtPane.rows({ selected: !0 }).data().toArray();
      if (
        this.s.colOpts.options ||
        (this.s.customPaneSettings && this.s.customPaneSettings.options)
      ) {
        this._getComparisonRows();
        for (
          var s = this.s.dtPane.rows().toArray()[0], e = 0;
          e < s.length;
          e++
        ) {
          var a = this.s.dtPane.row(s[e]),
            i = a.data();
          if (void 0 !== i)
            if (0 === i.shown)
              a.remove(), (s = this.s.dtPane.rows().toArray()[0]), e--;
            else
              for (var o = 0, n = t; o < n.length; o++)
                if (((m = n[o]), i.filter === m.filter)) {
                  a.select(), t.splice(e, 1), this.s.selections.push(i.filter);
                  break;
                }
        }
      } else {
        if (!this.s.dt.page.info().serverSide) {
          this._activePopulatePane(), (this.s.rowData.binsShown = {});
          for (
            var r = 0,
              l = this.s.dt.rows({ search: "applied" }).indexes().toArray();
            r < l.length;
            r++
          ) {
            var d = l[r];
            this._updateShown(
              d,
              this.s.dt.settings()[0],
              this.s.rowData.binsShown
            );
          }
        }
        this.s.dtPane.rows().remove();
        for (var h = 0, c = this.s.rowData.arrayFilter; h < c.length; h++) {
          var p = c[h];
          if (0 !== p.shown)
            for (
              var u = this.addRow(p.display, p.filter, p.sort, p.type, void 0),
                f = 0;
              f < t.length;
              f++
            )
              if (t[f].filter === p.filter) {
                u.select(), t.splice(f, 1), this.s.selections.push(p.filter);
                break;
              }
        }
        for (var g = 0, v = t; g < v.length; g++)
          for (
            var m = v[g], w = 0, P = this.s.rowData.arrayOriginal;
            w < P.length;
            w++
          ) {
            var y = P[w];
            y.filter === m.filter &&
              (this.addRow(
                y.display,
                y.filter,
                y.sort,
                y.type,
                void 0
              ).select(),
              this.s.selections.push(y.filter));
          }
      }
      this.s.dtPane.draw(),
        (this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop),
        this.s.dt.page.info().serverSide || this.s.dt.draw(!1);
    }),
    (L.prototype._activePopulatePane = function () {
      (this.s.rowData.arrayFilter = []), (this.s.rowData.bins = {});
      var t = this.s.dt.settings()[0];
      if (!this.s.dt.page.info().serverSide)
        for (
          var s = 0,
            e = this.s.dt.rows({ search: "applied" }).indexes().toArray();
          s < e.length;
          s++
        ) {
          var a = e[s];
          this._populatePaneArray(a, this.s.rowData.arrayFilter, t);
        }
    }),
    (L.prototype._getComparisonRows = function () {
      var t =
        this.s.colOpts.options ||
        (this.s.customPaneSettings && this.s.customPaneSettings.options
          ? this.s.customPaneSettings.options
          : void 0);
      if (void 0 !== t) {
        var s = this.s.dt.rows(),
          e = this.s.dt.rows({ search: "applied" }),
          a = s.data().toArray(),
          i = e.data().toArray(),
          o = [];
        this.s.dtPane.clear(), (this.s.indexes = []);
        for (var n = 0, r = t; n < r.length; n++) {
          var l = r[n],
            d = "" !== l.label ? l.label : this.emptyMessage(),
            h = {
              className: l.className,
              display: d,
              filter: "function" == typeof l.value ? l.value : [],
              shown: 0,
              sort: d,
              total: 0,
              type: d,
            };
          if ("function" == typeof l.value) {
            for (var c = 0; c < a.length; c++)
              l.value.call(this.s.dt, a[c], s[0][c]) && h.total++;
            for (var p = 0; p < i.length; p++)
              l.value.call(this.s.dt, i[p], e[0][p]) && h.shown++;
            "function" != typeof h.filter && h.filter.push(l.filter);
          }
          o.push(
            this.addRow(
              h.display,
              h.filter,
              h.sort,
              h.type,
              h.className,
              h.total,
              h.shown
            )
          );
        }
        return o;
      }
    }),
    (L.prototype._getMessage = function (t) {
      return this.s.dt
        .i18n("searchPanes.count", this.c.i18n.count)
        .replace(/{total}/g, t.total)
        .replace(/{shown}/g, t.shown);
    }),
    (L.prototype._getShown = function (t) {
      return this.s.rowData.binsShown && this.s.rowData.binsShown[t]
        ? this.s.rowData.binsShown[t]
        : 0;
    }),
    (L.prototype._shouldAddRow = function (t) {
      return 0 < t.shown;
    }),
    (P = L),
    (
      (r && r.__extends) ||
      ((m = function (t, s) {
        return (m =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array
            ? function (t, s) {
                t.__proto__ = s;
              }
            : function (t, s) {
                for (var e in s) s.hasOwnProperty(e) && (t[e] = s[e]);
              }))(t, s);
      }),
      function (t, s) {
        function e() {
          this.constructor = t;
        }
        m(t, s),
          (t.prototype =
            null === s
              ? Object.create(s)
              : ((e.prototype = s.prototype), new e()));
      })
    )(R, (y = P)),
    (R.prototype._activePopulatePane = function () {
      (this.s.rowData.arrayFilter = []), (this.s.rowData.binsShown = {});
      var t = this.s.dt.settings()[0];
      if (!this.s.dt.page.info().serverSide)
        for (
          var s = 0,
            e = this.s.dt.rows({ search: "applied" }).indexes().toArray();
          s < e.length;
          s++
        ) {
          var a = e[s];
          this._populatePaneArray(
            a,
            this.s.rowData.arrayFilter,
            t,
            this.s.rowData.binsShown
          );
        }
    }),
    (R.prototype._getMessage = function (t) {
      var s = this.s.dt.i18n("searchPanes.count", this.c.i18n.count),
        e = this.s.dt.i18n(
          "searchPanes.countFiltered",
          this.c.i18n.countFiltered
        );
      return (this.s.filteringActive ? e : s)
        .replace(/{total}/g, t.total)
        .replace(/{shown}/g, t.shown);
    }),
    (C = R),
    (M.prototype.clearSelections = function () {
      for (var t, s = 0, e = this.s.panes; s < e.length; s++)
        (t = e[s]).s.dtPane &&
          (t.s.scrollTop = t.s.dtPane.table().node().parentNode.scrollTop);
      this.dom.container
        .find("." + this.classes.search.replace(/\s+/g, "."))
        .each(function () {
          b(this).val("").trigger("input");
        }),
        (this.s.selectionList = []);
      for (var a = [], i = 0, o = this.s.panes; i < o.length; i++)
        (t = o[i]).s.dtPane && a.push(t.clearPane());
      return a;
    }),
    (M.prototype.getNode = function () {
      return this.dom.container;
    }),
    (M.prototype.rebuild = function (t, s) {
      void 0 === t && (t = !1),
        void 0 === s && (s = !1),
        this.dom.emptyMessage.detach(),
        !1 === t && this.dom.panes.empty();
      for (var e = [], a = 0, i = this.s.panes; a < i.length; a++) {
        var o = i[a];
        (!1 !== t && o.s.index !== t) ||
          (o.clearData(),
          o.rebuildPane(
            this.s.dt.page.info().serverSide ? this.s.serverData : void 0,
            s
          ),
          this.dom.panes.append(o.dom.container),
          e.push(o));
      }
      return (
        this._updateSelection(),
        this._updateFilterCount(),
        this._attachPaneContainer(),
        this._initSelectionListeners(!1),
        this.s.dt.draw(!s),
        this.resizePanes(),
        1 === e.length ? e[0] : e
      );
    }),
    (M.prototype.resizePanes = function () {
      var t;
      if ("auto" === this.c.layout) {
        for (
          var s = b(this.s.dt.searchPanes.container()).width(),
            s = Math.floor(s / this.s.minPaneWidth),
            e = 1,
            a = 0,
            i = [],
            o = 0,
            n = this.s.panes;
          o < n.length;
          o++
        )
          (t = n[o]).s.displayed && i.push(t.s.index);
        var r = i.length;
        if (s === r) e = s;
        else
          for (var l = s; 1 < l; l--) {
            var d = r % l;
            if (0 == d) {
              (e = l), (a = 0);
              break;
            }
            a < d && ((e = l), (a = d));
          }
        var h = 0 !== a ? i.slice(i.length - a, i.length) : [];
        this.s.panes.forEach(function (t) {
          t.s.displayed &&
            t.resize("columns-" + (h.includes(t.s.index) ? a : e));
        });
      } else
        for (var c = 0, p = this.s.panes; c < p.length; c++)
          (t = p[c]).adjustTopRow();
      return this;
    }),
    (M.prototype._initSelectionListeners = function (t) {}),
    (M.prototype._serverTotals = function () {}),
    (M.prototype._setXHR = function () {
      function a(t) {
        t &&
          t.searchPanes &&
          t.searchPanes.options &&
          ((s.s.serverData = t),
          (s.s.serverData.tableLength = t.recordsTotal),
          s._serverTotals());
      }
      var s = this,
        i = this.s.dt.settings()[0];
      this.s.dt.on("xhr.dtsps", function (t, s, e) {
        i === s && a(e);
      }),
        a(this.s.dt.ajax.json());
    }),
    (M.prototype._stateLoadListener = function () {
      var d = this,
        h = this.s.dt.settings()[0];
      this.s.dt.on("stateLoadParams.dtsps", function (t, s, e) {
        if (void 0 !== e.searchPanes && s === h) {
          if (
            (d.clearSelections(),
            (d.s.selectionList = e.searchPanes.selectionList || []),
            e.searchPanes.panes)
          )
            for (var a = 0, i = e.searchPanes.panes; a < i.length; a++)
              for (var o = i[a], n = 0, r = d.s.panes; n < r.length; n++) {
                var l = r[n];
                o.id === l.s.index &&
                  l.s.dtPane &&
                  (l.dom.searchBox.val(o.searchTerm),
                  l.s.dtPane.order(o.order));
              }
          d._makeSelections(d.s.selectionList);
        }
      });
    }),
    (M.prototype._updateSelection = function () {
      this.s.selectionList = [];
      for (var t = 0, s = this.s.panes; t < s.length; t++) {
        var e,
          a = s[t];
        a.s.dtPane &&
          (e = a.s.dtPane
            .rows({ selected: !0 })
            .data()
            .toArray()
            .map(function (t) {
              return t.filter;
            })).length &&
          this.s.selectionList.push({ column: a.s.index, rows: e });
      }
    }),
    (M.prototype._attach = function () {
      var t = this;
      this.dom.titleRow
        .removeClass(this.classes.hide)
        .detach()
        .append(this.dom.title),
        this.c.clear &&
          this.dom.clearAll
            .appendTo(this.dom.titleRow)
            .off("click.dtsps")
            .on("click.dtsps", function () {
              return t.clearSelections();
            }),
        this.c.collapse &&
          (this.dom.showAll.appendTo(this.dom.titleRow),
          this.dom.collapseAll.appendTo(this.dom.titleRow),
          this._setCollapseListener());
      for (var s = 0, e = this.s.panes; s < e.length; s++) {
        var a = e[s];
        this.dom.panes.append(a.dom.container);
      }
      this.dom.container
        .text("")
        .removeClass(this.classes.hide)
        .append(this.dom.titleRow)
        .append(this.dom.panes),
        this.s.panes.forEach(function (t) {
          return t.setListeners();
        }),
        0 === b("div." + this.classes.container).length &&
          this.dom.container.prependTo(this.s.dt);
    }),
    (M.prototype._attachMessage = function () {
      var s;
      try {
        s = this.s.dt.i18n("searchPanes.emptyPanes", this.c.i18n.emptyPanes);
      } catch (t) {
        s = null;
      }
      null === s
        ? (this.dom.container.addClass(this.classes.hide),
          this.dom.titleRow.removeClass(this.classes.hide))
        : (this.dom.container.removeClass(this.classes.hide),
          this.dom.titleRow.addClass(this.classes.hide),
          this.dom.emptyMessage.html(s).appendTo(this.dom.container));
    }),
    (M.prototype._attachPaneContainer = function () {
      for (var t = 0, s = this.s.panes; t < s.length; t++)
        if (!0 === s[t].s.displayed) return void this._attach();
      this._attachMessage();
    }),
    (M.prototype._checkCollapse = function () {
      for (var t = !0, s = !0, e = 0, a = this.s.panes; e < a.length; e++) {
        var i = a[e];
        i.s.displayed &&
          (i.dom.collapseButton.hasClass(i.classes.rotated)
            ? (this.dom.showAll
                .removeClass(this.classes.disabledButton)
                .removeAttr("disabled"),
              (s = !1))
            : (this.dom.collapseAll
                .removeClass(this.classes.disabledButton)
                .removeAttr("disabled"),
              (t = !1)));
      }
      t &&
        this.dom.collapseAll
          .addClass(this.classes.disabledButton)
          .attr("disabled", "true"),
        s &&
          this.dom.showAll
            .addClass(this.classes.disabledButton)
            .attr("disabled", "true");
    }),
    (M.prototype._checkMessage = function () {
      for (var t = 0, s = this.s.panes; t < s.length; t++)
        if (!0 === s[t].s.displayed)
          return (
            this.dom.emptyMessage.detach(),
            void this.dom.titleRow.removeClass(this.classes.hide)
          );
      this._attachMessage();
    }),
    (M.prototype._collapseAll = function () {
      for (var t = 0, s = this.s.panes; t < s.length; t++) s[t].collapse();
    }),
    (M.prototype._findPane = function (t) {
      for (var s = 0, e = this.s.panes; s < e.length; s++) {
        var a = e[s];
        if (t === a.s.name) return a;
      }
    }),
    (M.prototype._getState = function () {
      var t = this.s.dt.state.loaded();
      t &&
        t.searchPanes &&
        t.searchPanes.selectionList &&
        (this.s.selectionList = t.searchPanes.selectionList);
    }),
    (M.prototype._makeSelections = function (t) {
      for (var s = 0, e = t; s < e.length; s++) {
        for (
          var a = e[s], i = void 0, o = 0, n = this.s.panes;
          o < n.length;
          o++
        ) {
          var r = n[o];
          if (r.s.index === a.column) {
            i = r;
            break;
          }
        }
        if (i && i.s.dtPane) {
          for (var l = 0; l < i.s.dtPane.rows().data().toArray().length; l++)
            a.rows.includes(
              "function" == typeof i.s.dtPane.row(l).data().filter
                ? i.s.dtPane.cell(l, 0).data()
                : i.s.dtPane.row(l).data().filter
            ) && i.s.dtPane.row(l).select();
          i.updateTable();
        }
      }
    }),
    (M.prototype._paneDeclare = function (t, s, e) {
      for (
        var a = this,
          i =
            (t
              .columns(0 < this.c.columns.length ? this.c.columns : void 0)
              .eq(0)
              .each(function (t) {
                a.s.panes.push(new a.s.paneClass(s, e, t, a.dom.panes));
              }),
            t.columns().eq(0).toArray().length),
          o = 0;
        o < this.c.panes.length;
        o++
      )
        this.s.panes.push(
          new this.s.paneClass(s, e, i + o, this.dom.panes, this.c.panes[o])
        );
      0 < this.c.order.length &&
        (this.s.panes = this.c.order.map(function (t) {
          return a._findPane(t);
        })),
        this.s.dt.settings()[0]._bInitComplete
          ? this._startup(t)
          : this.s.dt.settings()[0].aoInitComplete.push(function () {
              return a._startup(t);
            });
    }),
    (M.prototype._setCollapseListener = function () {
      var t = this;
      this.dom.collapseAll.off("click.dtsps").on("click.dtsps", function () {
        t._collapseAll(),
          t.dom.collapseAll
            .addClass(t.classes.disabledButton)
            .attr("disabled", "true"),
          t.dom.showAll
            .removeClass(t.classes.disabledButton)
            .removeAttr("disabled"),
          t.s.dt.state.save();
      }),
        this.dom.showAll.off("click.dtsps").on("click.dtsps", function () {
          t._showAll(),
            t.dom.showAll
              .addClass(t.classes.disabledButton)
              .attr("disabled", "true"),
            t.dom.collapseAll
              .removeClass(t.classes.disabledButton)
              .removeAttr("disabled"),
            t.s.dt.state.save();
        });
      for (var s = 0, e = this.s.panes; s < e.length; s++)
        e[s].dom.topRow.off("collapse.dtsps").on("collapse.dtsps", function () {
          return t._checkCollapse();
        });
      this._checkCollapse();
    }),
    (M.prototype._showAll = function () {
      for (var t = 0, s = this.s.panes; t < s.length; t++) s[t].show();
    }),
    (M.prototype._startup = function (i) {
      for (
        var h = this,
          c = (this._attach(), this.dom.panes.empty(), this.s.dt.settings()[0]),
          t = 0,
          s = this.s.panes;
        t < s.length;
        t++
      ) {
        var e = s[t];
        e.rebuildPane(
          0 < Object.keys(this.s.serverData).length ? this.s.serverData : void 0
        ),
          this.dom.panes.append(e.dom.container);
      }
      "auto" === this.c.layout && this.resizePanes();
      var a = this.s.dt.state.loaded(),
        o =
          (!this.s.stateRead &&
            a &&
            this.s.dt.page(a.start / this.s.dt.page.len()).draw("page"),
          (this.s.stateRead = !0),
          this._checkMessage(),
          i.on("preDraw.dtsps", function () {
            h.s.updating ||
              h.s.paging ||
              (h._updateFilterCount(), h._updateSelection()),
              (h.s.paging = !1);
          }),
          b(r).on(
            "resize.dtsps",
            S.util.throttle(function () {
              return h.resizePanes();
            })
          ),
          this.s.dt.on("stateSaveParams.dtsps", function (t, s, e) {
            s === c &&
              (void 0 === e.searchPanes && (e.searchPanes = {}),
              (e.searchPanes.selectionList = h.s.selectionList));
          }),
          this._stateLoadListener(),
          i
            .off("page.dtsps page-nc.dtsps")
            .on("page.dtsps page-nc.dtsps", function (t, s) {
              (h.s.paging = !0),
                (h.s.pagingST = !0),
                (h.s.page = h.s.dt.page());
            }),
          this.s.dt.page.info().serverSide
            ? i.off("preXhr.dtsps").on("preXhr.dtsps", function (t, s, e) {
                if (s === c) {
                  e.searchPanes || (e.searchPanes = {}),
                    e.searchPanes_null || (e.searchPanes_null = {});
                  for (var a = 0, i = 0, o = h.s.panes; i < o.length; i++) {
                    var n = o[i],
                      r = h.s.dt.column(n.s.index).dataSrc();
                    if (
                      (e.searchPanes[r] || (e.searchPanes[r] = {}),
                      e.searchPanes_null[r] || (e.searchPanes_null[r] = {}),
                      n.s.dtPane)
                    )
                      for (
                        var l = n.s.dtPane
                            .rows({ selected: !0 })
                            .data()
                            .toArray(),
                          d = 0;
                        d < l.length;
                        d++
                      )
                        (e.searchPanes[r][d] = l[d].filter),
                          e.searchPanes[r][d]
                            ? (e.searchPanes_null[r][d] = !1)
                            : (e.searchPanes_null[r][d] = !0),
                          a++;
                  }
                  0 < a &&
                    (a !== h.s.filterCount
                      ? ((e.start = 0), (h.s.page = 0))
                      : (e.start = h.s.page * h.s.dt.page.len()),
                    h.s.dt.page(h.s.page),
                    (h.s.filterCount = a)),
                    0 < h.s.selectionList.length &&
                      (e.searchPanesLast = h.s.dt
                        .column(
                          h.s.selectionList[h.s.selectionList.length - 1].column
                        )
                        .dataSrc()),
                    (e.searchPanes_options = {
                      cascade: h.c.cascadePanes,
                      viewCount: h.c.viewCount,
                      viewTotal: h.c.viewTotal,
                    });
                }
              })
            : i.on("preXhr.dtsps", function () {
                return h.s.panes.forEach(function (t) {
                  return t.clearData();
                });
              }),
          this.s.dt.on("xhr.dtsps", function (t, s) {
            var i;
            s.nTable !== h.s.dt.table().node() ||
              h.s.dt.page.info().serverSide ||
              ((i = !1),
              h.s.dt.one("preDraw.dtsps", function () {
                if (!i) {
                  var t = h.s.dt.page();
                  (i = !0), (h.s.updating = !0), h.dom.panes.empty();
                  for (var s = 0, e = h.s.panes; s < e.length; s++) {
                    var a = e[s];
                    a.clearData(),
                      a.rebuildPane(void 0, !0),
                      h.dom.panes.append(a.dom.container);
                  }
                  h.s.dt.page.info().serverSide || h.s.dt.draw(),
                    (h.s.updating = !1),
                    h._updateSelection(),
                    h._checkMessage(),
                    h.s.dt.one("draw.dtsps", function () {
                      (h.s.updating = !0),
                        h.s.dt.page(t).draw(!1),
                        (h.s.updating = !1);
                    });
                }
              }));
          }),
          this.c.preSelect);
      a &&
        a.searchPanes &&
        a.searchPanes.selectionList &&
        (o = a.searchPanes.selectionList),
        this._makeSelections(o),
        this._updateFilterCount(),
        i.on("destroy.dtsps", function (t, s) {
          if (s === c) {
            for (var e = 0, a = h.s.panes; e < a.length; e++) a[e].destroy();
            i.off(".dtsps"),
              h.dom.showAll.off(".dtsps"),
              h.dom.clearAll.off(".dtsps"),
              h.dom.collapseAll.off(".dtsps"),
              b(i.table().node()).off(".dtsps"),
              h.dom.container.detach(),
              h.clearSelections();
          }
        }),
        this.c.collapse && this._setCollapseListener(),
        this.c.clear &&
          this.dom.clearAll.off("click.dtsps").on("click.dtsps", function () {
            return h.clearSelections();
          }),
        (c._searchPanes = this).s.dt.state.save();
    }),
    (M.prototype._updateFilterCount = function () {
      for (var t = 0, s = 0, e = 0, a = this.s.panes; e < a.length; e++) {
        var i = a[e];
        i.s.dtPane && ((t += i.getPaneCount()), i.s.dtPane.search()) && s++;
      }
      this.dom.title.html(
        this.s.dt.i18n("searchPanes.title", this.c.i18n.title, t)
      ),
        this.c.filterChanged &&
          "function" == typeof this.c.filterChanged &&
          this.c.filterChanged.call(this.s.dt, t),
        0 === t && 0 === s
          ? this.dom.clearAll
              .addClass(this.classes.disabledButton)
              .attr("disabled", "true")
          : this.dom.clearAll
              .removeClass(this.classes.disabledButton)
              .removeAttr("disabled");
    }),
    (M.version = "2.3.0"),
    (M.classes = {
      clear: "dtsp-clear",
      clearAll: "dtsp-clearAll",
      collapseAll: "dtsp-collapseAll",
      container: "dtsp-searchPanes",
      disabledButton: "dtsp-disabledButton",
      emptyMessage: "dtsp-emptyMessage",
      hide: "dtsp-hidden",
      panes: "dtsp-panesContainer",
      search: "dtsp-search",
      showAll: "dtsp-showAll",
      title: "dtsp-title",
      titleRow: "dtsp-titleRow",
    }),
    (M.defaults = {
      cascadePanes: !1,
      clear: !0,
      collapse: !0,
      columns: [],
      container: function (t) {
        return t.table().container();
      },
      filterChanged: void 0,
      i18n: {
        clearMessage: "Clear All",
        clearPane: "&times;",
        collapse: { 0: "SearchPanes", _: "SearchPanes (%d)" },
        collapseMessage: "Collapse All",
        count: "{total}",
        emptyMessage: "<em>No data</em>",
        emptyPanes: "No SearchPanes",
        loadMessage: "Loading Search Panes...",
        showMessage: "Show All",
        title: "Filters Active - %d",
      },
      layout: "auto",
      order: [],
      panes: [],
      preSelect: [],
      viewCount: !0,
      viewTotal: !1,
    }),
    (O = M),
    (
      (r && r.__extends) ||
      ((x = function (t, s) {
        return (x =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array
            ? function (t, s) {
                t.__proto__ = s;
              }
            : function (t, s) {
                for (var e in s) s.hasOwnProperty(e) && (t[e] = s[e]);
              }))(t, s);
      }),
      function (t, s) {
        function e() {
          this.constructor = t;
        }
        x(t, s),
          (t.prototype =
            null === s
              ? Object.create(s)
              : ((e.prototype = s.prototype), new e()));
      })
    )(k, (j = O)),
    (k.prototype._initSelectionListeners = function (t, s) {
      void 0 === s && (s = []),
        (t = void 0 === t ? !0 : t) && (this.s.selectionList = s);
      for (var e = 0, a = this.s.panes; e < a.length; e++) {
        var i = a[e];
        i.s.displayed &&
          i.s.dtPane
            .off("select.dtsp")
            .on("select.dtsp", this._update(i))
            .off("deselect.dtsp")
            .on("deselect.dtsp", this._updateTimeout(i));
      }
      this.s.dt.off("draw.dtsps").on("draw.dtsps", this._update()),
        this._updateSelectionList();
    }),
    (k.prototype._serverTotals = function () {
      for (var t = 0, s = this.s.panes; t < s.length; t++) {
        var e = s[t];
        if (e.s.colOpts.show) {
          var a = this.s.dt.column(e.s.index).dataSrc(),
            i = !0;
          if (this.s.serverData.searchPanes.options[a])
            for (
              var o = 0, n = this.s.serverData.searchPanes.options[a];
              o < n.length;
              o++
            ) {
              var r = n[o];
              if (r.total !== r.count) {
                i = !1;
                break;
              }
            }
          (e.s.filteringActive = !i), e._serverPopulate(this.s.serverData);
        }
      }
    }),
    (k.prototype._stateLoadListener = function () {
      function t(t, s, e) {
        if (void 0 !== e.searchPanes) {
          if (
            ((d.s.selectionList = e.searchPanes.selectionList || []),
            e.searchPanes.panes)
          )
            for (var a = 0, i = e.searchPanes.panes; a < i.length; a++)
              for (var o = i[a], n = 0, r = d.s.panes; n < r.length; n++) {
                var l = r[n];
                o.id === l.s.index &&
                  l.s.dtPane &&
                  (l.dom.searchBox.val(o.searchTerm),
                  l.s.dtPane.order(o.order));
              }
          d._updateSelectionList();
        }
      }
      var d = this;
      this.s.dt.off("stateLoadParams.dtsps", t).on("stateLoadParams.dtsps", t);
    }),
    (k.prototype._updateSelection = function () {}),
    (k.prototype._update = function (t) {
      var s = this;
      return (
        void 0 === t && (t = void 0),
        function () {
          t && clearTimeout(t.s.deselectTimeout), s._updateSelectionList(t);
        }
      );
    }),
    (k.prototype._updateTimeout = function (t) {
      var s = this;
      return (
        void 0 === t && (t = void 0),
        function () {
          return t
            ? (t.s.deselectTimeout = setTimeout(function () {
                return s._updateSelectionList(t);
              }, 50))
            : s._updateSelectionList();
        }
      );
    }),
    (k.prototype._updateSelectionList = function (s) {
      var t;
      void 0 === s && (s = void 0),
        this.s.pagingST
          ? (this.s.pagingST = !1)
          : this.s.updating ||
            (s && s.s.serverSelecting) ||
            (void 0 !== s &&
              (this.s.dt.page.info().serverSide && s._updateSelection(),
              (t = s.s.dtPane
                .rows({ selected: !0 })
                .data()
                .toArray()
                .map(function (t) {
                  return t.filter;
                })),
              (this.s.selectionList = this.s.selectionList.filter(function (t) {
                return t.column !== s.s.index;
              })),
              0 < t.length
                ? (this.s.selectionList.push({ column: s.s.index, rows: t }),
                  s.dom.clear
                    .removeClass(this.classes.disabledButton)
                    .removeAttr("disabled"))
                : s.dom.clear
                    .addClass(this.classes.disabledButton)
                    .attr("disabled", "true"),
              this.s.dt.page.info().serverSide) &&
              this.s.dt.draw(!1),
            this._remakeSelections(),
            this._updateFilterCount());
    }),
    (k.prototype._remakeSelections = function () {
      var t;
      if (((this.s.updating = !0), this.s.dt.page.info().serverSide)) {
        0 < this.s.selectionList.length &&
          (h =
            this.s.panes[
              this.s.selectionList[this.s.selectionList.length - 1].column
            ]);
        for (var s = 0, e = this.s.panes; s < e.length; s++)
          !(t = e[s]).s.displayed ||
            (h && t.s.index === h.s.index) ||
            t.updateRows();
      } else {
        var a = this.s.selectionList,
          i = !1;
        this.clearSelections(),
          this.s.dt.draw(!1),
          this.s.dt.rows().toArray()[0].length >
            this.s.dt.rows({ search: "applied" }).toArray()[0].length &&
            (i = !0),
          (this.s.selectionList = a);
        for (var o = 0, n = this.s.panes; o < n.length; o++)
          (h = n[o]).s.displayed && ((h.s.filteringActive = i), h.updateRows());
        for (var r = 0, l = this.s.selectionList; r < l.length; r++) {
          for (
            var d = l[r], h = null, c = 0, p = this.s.panes;
            c < p.length;
            c++
          ) {
            var u = p[c];
            if (u.s.index === d.column) {
              h = u;
              break;
            }
          }
          if (h.s.dtPane) {
            for (
              var f = h.s.dtPane.rows().indexes().toArray(), g = 0;
              g < d.rows.length;
              g++
            ) {
              for (var v = !1, m = 0, w = f; m < w.length; m++) {
                var P = w[m],
                  P = h.s.dtPane.row(P),
                  y = P.data();
                d.rows[g] === y.filter && (P.select(), (v = !0));
              }
              v || (d.rows.splice(g, 1), g--);
            }
            if (((h.s.selections = d.rows), 0 !== d.rows.length)) {
              this.s.dt.draw();
              for (
                var b = 0, _ = 0, S = 0, C = 0, O = this.s.panes;
                C < O.length;
                C++
              )
                (t = O[C]).s.dtPane &&
                  _ < (b += t.getPaneCount()) &&
                  (S++, (_ = b));
              for (var x = 0 < b, A = 0, D = this.s.panes; A < D.length; A++)
                (t = D[A]).s.displayed &&
                  (i || h.s.index !== t.s.index || !x
                    ? (t.s.filteringActive = x || i)
                    : 1 === S && (t.s.filteringActive = !1),
                  t.s.index !== h.s.index) &&
                  t.updateRows();
            }
          }
        }
        this.s.dt.draw(!1);
      }
      this.s.updating = !1;
    }),
    (A = k),
    (l = (_ = n).fn.dataTable),
    (S = (b = n).fn.dataTable),
    ((D = (w = f = c = n).fn.dataTable).SearchPanes = O),
    (T.SearchPanes = O),
    (D.SearchPanesST = A),
    (T.SearchPanesST = A),
    (D.SearchPane = h),
    (T.SearchPane = h),
    (D.SearchPaneViewTotal = g),
    (T.SearchPaneViewTotal = g),
    (D.SearchPaneCascade = P),
    (T.SearchPaneCascade = P),
    (D.SearchPaneCascadeViewTotal = C),
    (T.SearchPaneCascadeViewTotal = C),
    (t = n.fn.dataTable.Api.register)("searchPanes()", function () {
      return this;
    }),
    t("searchPanes.clearSelections()", function () {
      return this.iterator("table", function (t) {
        t._searchPanes && t._searchPanes.clearSelections();
      });
    }),
    t("searchPanes.rebuildPane()", function (s, e) {
      return this.iterator("table", function (t) {
        t._searchPanes && t._searchPanes.rebuild(s, e);
      });
    }),
    t("searchPanes.resizePanes()", function () {
      var t = this.context[0];
      return t._searchPanes ? t._searchPanes.resizePanes() : null;
    }),
    t("searchPanes.container()", function () {
      var t = this.context[0];
      return t._searchPanes ? t._searchPanes.getNode() : null;
    }),
    (T.ext.buttons.searchPanesClear = {
      action: function (t, s) {
        s.searchPanes.clearSelections();
      },
      text: "Clear Panes",
    }),
    (T.ext.buttons.searchPanes = {
      action: function (t, s, e, a) {
        var i = this,
          o = this;
        a._panes
          ? (this.popover(a._panes.getNode(), {
              align: "container",
              span: "container",
            }),
            a._panes.rebuild(void 0, !0))
          : (this.processing(!0),
            setTimeout(function () {
              N(s, e, a),
                i.popover(a._panes.getNode(), {
                  align: "container",
                  span: "container",
                }),
                a._panes.rebuild(void 0, !0),
                n("table.dataTable", a._panes.getNode())
                  .DataTable()
                  .columns.adjust(),
                o.processing(!1);
            }, 10));
      },
      init: function (t, s, e) {
        t
          .button(s)
          .text(e.text || t.i18n("searchPanes.collapse", "SearchPanes", 0)),
          (!t.init().stateSave && !1 !== e.delayInit) || N(t, s, e);
      },
      config: {},
      text: "",
      delayInit: !0,
    }),
    n(o).on("preInit.dt.dtsp", function (t, s) {
      "dt" !== t.namespace ||
        (!s.oInit.searchPanes && !T.defaults.searchPanes) ||
        s._searchPanes ||
        F(s, null, !0);
    }),
    T.ext.feature.push({ cFeature: "P", fnInit: F }),
    T.feature && T.feature.register("searchPanes", F),
    T
  );
});

// dataTables.select.min.js
!(function (l) {
  var s, c;
  "function" == typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (e) {
        return l(e, window, document);
      })
    : "object" == typeof exports
      ? ((s = require("jquery")),
        (c = function (e, t) {
          t.fn.dataTable || require("datatables.net")(e, t);
        }),
        "undefined" == typeof window
          ? (module.exports = function (e, t) {
              return (
                (e = e || window), (t = t || s(e)), c(e, t), l(t, e, e.document)
              );
            })
          : (c(window, s), (module.exports = l(s, window, window.document))))
      : l(jQuery, window, document);
})(function (m, i, e) {
  "use strict";
  var _ = m.fn.dataTable;
  function r(n, e, t) {
    function l(t, l) {
      l < t && ((e = l), (l = t), (t = e));
      var e,
        s = !1;
      return n
        .columns(":visible")
        .indexes()
        .filter(function (e) {
          return e === t && (s = !0), e === l ? !(s = !1) : s;
        });
    }
    function s(t, l) {
      var e,
        s = n.rows({ search: "applied" }).indexes(),
        c = (s.indexOf(t) > s.indexOf(l) && ((e = l), (l = t), (t = e)), !1);
      return s.filter(function (e) {
        return e === t && (c = !0), e === l ? !(c = !1) : c;
      });
    }
    var c,
      t =
        n.cells({ selected: !0 }).any() || t
          ? ((c = l(t.column, e.column)), s(t.row, e.row))
          : ((c = l(0, e.column)), s(0, e.row)),
      t = n.cells(t, c).flatten();
    n.cells(e, { selected: !0 }).any()
      ? n.cells(t).deselect()
      : n.cells(t).select();
  }
  function s(e) {
    var t = e.settings()[0]._select.selector;
    m(e.table().container())
      .off("mousedown.dtSelect", t)
      .off("mouseup.dtSelect", t)
      .off("click.dtSelect", t),
      m("body").off("click.dtSelect" + v(e.table().node()));
  }
  function n(o) {
    var a,
      t = m(o.table().container()),
      l = o.settings()[0],
      s = l._select.selector;
    t
      .on("mousedown.dtSelect", s, function (e) {
        (e.shiftKey || e.metaKey || e.ctrlKey) &&
          t
            .css("-moz-user-select", "none")
            .one("selectstart.dtSelect", s, function () {
              return !1;
            }),
          i.getSelection && (a = i.getSelection());
      })
      .on("mouseup.dtSelect", s, function () {
        t.css("-moz-user-select", "");
      })
      .on("click.dtSelect", s, function (e) {
        var t,
          l = o.select.items();
        if (a) {
          var s = i.getSelection();
          if (
            (!s.anchorNode ||
              m(s.anchorNode).closest("table")[0] === o.table().node()) &&
            s !== a
          )
            return;
        }
        var c,
          s = o.settings()[0],
          n = o.table().container();
        m(e.target).closest("div.dt-container")[0] == n &&
          (n = o.cell(m(e.target).closest("td, th"))).any() &&
          ((c = m.Event("user-select.dt")),
          d(o, c, [l, n, e]),
          c.isDefaultPrevented() ||
            ((c = n.index()),
            "row" === l
              ? ((t = c.row), h(e, o, s, "row", t))
              : "column" === l
                ? ((t = n.index().column), h(e, o, s, "column", t))
                : "cell" === l && ((t = n.index()), h(e, o, s, "cell", t)),
            (s._select_lastCell = c)));
      }),
      m("body").on("click.dtSelect" + v(o.table().node()), function (e) {
        var t;
        !l._select.blurable ||
          m(e.target).parents().filter(o.table().container()).length ||
          0 === m(e.target).parents("html").length ||
          m(e.target).parents("div.DTE").length ||
          ((t = m.Event("select-blur.dt")),
          d(o, t, [e.target, e]),
          t.isDefaultPrevented()) ||
          f(l, !0);
      });
  }
  function d(e, t, l, s) {
    (s && !e.flatten().length) ||
      ("string" == typeof t && (t += ".dt"),
      l.unshift(e),
      m(e.table().node()).trigger(t, l));
  }
  function a(s, e) {
    var t, l, c, n, o;
    "api" !== s.select.style() &&
      !1 !== s.select.info() &&
      ((o = s.rows({ selected: !0 }).flatten().length),
      (t = s.columns({ selected: !0 }).flatten().length),
      (l = s.cells({ selected: !0 }).flatten().length),
      (c = function (e, t, l) {
        e.append(
          m('<span class="select-item"/>').append(
            s.i18n(
              "select." + t + "s",
              { _: "%d " + t + "s selected", 0: "", 1: "1 " + t + " selected" },
              l
            )
          )
        );
      }),
      (e = m(e)),
      c((n = m('<span class="select-info"/>')), "row", o),
      c(n, "column", t),
      c(n, "cell", l),
      (o = e.children("span.select-info")).length && o.remove(),
      "" !== n.text()) &&
      e.append(n);
  }
  function p(o) {
    o.columns(".dt-select").every(function () {
      var n,
        e = this.header();
      m("input", e).length ||
        ((n = m("<input>")
          .attr({
            class: "dt-select-checkbox",
            type: "checkbox",
            "aria-label":
              o.i18n("select.aria.headerCheckbox") || "Select all rows",
          })
          .appendTo(e)
          .on("change", function () {
            this.checked
              ? o.rows({ search: "applied" }).select()
              : o.rows({ selected: !0 }).deselect();
          })
          .on("click", function (e) {
            e.stopPropagation();
          })),
        o.on("draw select deselect", function (e, t, l) {
          var s, c;
          ("row" !== l && l) ||
            ((l = o.rows({ selected: !0 }).count()),
            (s = o.rows({ search: "applied", selected: !0 }).count()),
            (c = o.rows({ search: "applied" }).count()),
            s && s <= l && s === c
              ? n.prop("checked", !0).prop("indeterminate", !1)
              : 0 === s && 0 === l
                ? n.prop("checked", !1).prop("indeterminate", !1)
                : n.prop("checked", !1).prop("indeterminate", !0));
        }));
    });
  }
  function u(e, t, l, s) {
    var c,
      n = e[t + "s"]({ search: "applied" }).indexes(),
      s = n.indexOf(s),
      o = n.indexOf(l);
    e[t + "s"]({ selected: !0 }).any() || -1 !== s
      ? (o < s && ((c = o), (o = s), (s = c)),
        n.splice(o + 1, n.length),
        n.splice(0, s))
      : n.splice(n.indexOf(l) + 1, n.length),
      e[t](l, { selected: !0 }).any()
        ? (n.splice(n.indexOf(l), 1), e[t + "s"](n).deselect())
        : e[t + "s"](n).select();
  }
  function f(e, t) {
    (!t && "single" !== e._select.style) ||
      ((t = new _.Api(e)).rows({ selected: !0 }).deselect(),
      t.columns({ selected: !0 }).deselect(),
      t.cells({ selected: !0 }).deselect());
  }
  function h(e, t, l, s, c) {
    var n = t.select.style(),
      o = t.select.toggleable(),
      a = t[s](c, { selected: !0 }).any();
    (a && !o) ||
      ("os" === n
        ? e.ctrlKey || e.metaKey
          ? t[s](c).select(!a)
          : e.shiftKey
            ? "cell" === s
              ? r(t, c, l._select_lastCell || null)
              : u(t, s, c, l._select_lastCell ? l._select_lastCell[s] : null)
            : ((o = t[s + "s"]({ selected: !0 })),
              a && 1 === o.flatten().length
                ? t[s](c).deselect()
                : (o.deselect(), t[s](c).select()))
        : "multi+shift" == n && e.shiftKey
          ? "cell" === s
            ? r(t, c, l._select_lastCell || null)
            : u(t, s, c, l._select_lastCell ? l._select_lastCell[s] : null)
          : t[s](c).select(!a));
  }
  function v(e) {
    return e.id.replace(/[^a-zA-Z0-9\-\_]/g, "-");
  }
  (_.select = {}),
    (_.select.version = "2.0.0"),
    (_.select.init = function (c) {
      var e,
        t,
        l,
        s,
        n,
        o,
        a,
        i,
        r,
        d,
        u,
        f,
        h = c.settings()[0];
      if (!_.versionCheck("2"))
        throw "Warning: Select requires DataTables 2 or newer";
      h._select ||
        ((e = c.state.loaded()),
        (t = function (e, t, l) {
          if (null !== l && void 0 !== l.select) {
            if (
              (c.rows({ selected: !0 }).any() && c.rows().deselect(),
              void 0 !== l.select.rows && c.rows(l.select.rows).select(),
              c.columns({ selected: !0 }).any() && c.columns().deselect(),
              void 0 !== l.select.columns &&
                c.columns(l.select.columns).select(),
              c.cells({ selected: !0 }).any() && c.cells().deselect(),
              void 0 !== l.select.cells)
            )
              for (var s = 0; s < l.select.cells.length; s++)
                c.cell(
                  l.select.cells[s].row,
                  l.select.cells[s].column
                ).select();
            c.state.save();
          }
        }),
        c
          .on("stateSaveParams", function (e, t, l) {
            (l.select = {}),
              (l.select.rows = c.rows({ selected: !0 }).ids(!0).toArray()),
              (l.select.columns = c.columns({ selected: !0 })[0]),
              (l.select.cells = c.cells({ selected: !0 })[0].map(function (e) {
                return { row: c.row(e.row).id(!0), column: e.column };
              }));
          })
          .on("stateLoadParams", t)
          .one("init", function () {
            t(0, 0, e);
          }),
        (s = h.oInit.select),
        (l = _.defaults.select),
        (l = void 0 === s ? l : s),
        (s = "row"),
        (r = "td, th"),
        (d = "selected"),
        (f = !(u = i = a = !(o = !(n = "api")))),
        (h._select = { infoEls: [] }),
        !0 === l
          ? ((n = "os"), (f = !0))
          : "string" == typeof l
            ? ((n = l), (f = !0))
            : m.isPlainObject(l) &&
              (void 0 !== l.blurable && (o = l.blurable),
              void 0 !== l.toggleable && (a = l.toggleable),
              void 0 !== l.info && (i = l.info),
              void 0 !== l.items && (s = l.items),
              (f = ((n = void 0 !== l.style ? l.style : "os"), !0)),
              void 0 !== l.selector && (r = l.selector),
              void 0 !== l.className && (d = l.className),
              void 0 !== l.headerCheckbox) &&
              (u = l.headerCheckbox),
        c.select.selector(r),
        c.select.items(s),
        c.select.style(n),
        c.select.blurable(o),
        c.select.toggleable(a),
        c.select.info(i),
        (h._select.className = d),
        !f &&
          m(c.table().node()).hasClass("selectable") &&
          c.select.style("os"),
        u &&
          (p(c),
          c.on("init", function () {
            p(c);
          })));
    }),
    m.each(
      [
        { type: "row", prop: "aoData" },
        { type: "column", prop: "aoColumns" },
      ],
      function (e, i) {
        _.ext.selector[i.type].push(function (e, t, l) {
          var s,
            c = t.selected,
            n = [];
          if (!0 !== c && !1 !== c) return l;
          for (var o = 0, a = l.length; o < a; o++)
            (s = e[i.prop][l[o]]) &&
              ((!0 === c && !0 === s._select_selected) ||
                (!1 === c && !s._select_selected)) &&
              n.push(l[o]);
          return n;
        });
      }
    ),
    _.ext.selector.cell.push(function (e, t, l) {
      var s,
        c = t.selected,
        n = [];
      if (void 0 === c) return l;
      for (var o = 0, a = l.length; o < a; o++)
        (s = e.aoData[l[o].row]) &&
          ((!0 === c &&
            s._selected_cells &&
            !0 === s._selected_cells[l[o].column]) ||
            (!1 === c &&
              (!s._selected_cells || !s._selected_cells[l[o].column]))) &&
          n.push(l[o]);
      return n;
    });
  var t = _.Api.register,
    l = _.Api.registerPlural;
  function o(t, l) {
    return function (e) {
      return e.i18n("buttons." + t, l);
    };
  }
  function w(e) {
    e = e._eventNamespace;
    return "draw.dt.DT" + e + " select.dt.DT" + e + " deselect.dt.DT" + e;
  }
  t("select()", function () {
    return this.iterator("table", function (e) {
      _.select.init(new _.Api(e));
    });
  }),
    t("select.blurable()", function (t) {
      return void 0 === t
        ? this.context[0]._select.blurable
        : this.iterator("table", function (e) {
            e._select.blurable = t;
          });
    }),
    t("select.toggleable()", function (t) {
      return void 0 === t
        ? this.context[0]._select.toggleable
        : this.iterator("table", function (e) {
            e._select.toggleable = t;
          });
    }),
    t("select.info()", function (t) {
      return void 0 === t
        ? this.context[0]._select.info
        : this.iterator("table", function (e) {
            e._select.info = t;
          });
    }),
    t("select.items()", function (t) {
      return void 0 === t
        ? this.context[0]._select.items
        : this.iterator("table", function (e) {
            (e._select.items = t), d(new _.Api(e), "selectItems", [t]);
          });
    }),
    t("select.style()", function (l) {
      return void 0 === l
        ? this.context[0]._select.style
        : this.iterator("table", function (e) {
            e._select || _.select.init(new _.Api(e)),
              e._select_init ||
                ((o = e),
                (c = new _.Api(o)),
                (o._select_init = !0),
                o.aoRowCreatedCallback.push(function (e, t, l) {
                  var s,
                    c,
                    n = o.aoData[l];
                  for (
                    n._select_selected && m(e).addClass(o._select.className),
                      s = 0,
                      c = o.aoColumns.length;
                    s < c;
                    s++
                  )
                    (o.aoColumns[s]._select_selected ||
                      (n._selected_cells && n._selected_cells[s])) &&
                      m(n.anCells[s]).addClass(o._select.className);
                }),
                c.on("preXhr.dt.dtSelect", function (e, t) {
                  var l, s;
                  t === c.settings()[0] &&
                    ((l = c
                      .rows({ selected: !0 })
                      .ids(!0)
                      .filter(function (e) {
                        return void 0 !== e;
                      })),
                    (s = c
                      .cells({ selected: !0 })
                      .eq(0)
                      .map(function (e) {
                        var t = c.row(e.row).id(!0);
                        return t ? { row: t, column: e.column } : void 0;
                      })
                      .filter(function (e) {
                        return void 0 !== e;
                      })),
                    c.one("draw.dt.dtSelect", function () {
                      c.rows(l).select(),
                        s.any() &&
                          s.each(function (e) {
                            c.cells(e.row, e.column).select();
                          });
                    }));
                }),
                c.on("info.dt", function (e, t, l) {
                  t._select.infoEls.includes(l) || t._select.infoEls.push(l),
                    a(c, l);
                }),
                c.on("select.dtSelect.dt deselect.dtSelect.dt", function () {
                  o._select.infoEls.forEach(function (e) {
                    a(c, e);
                  }),
                    c.state.save();
                }),
                c.on("destroy.dtSelect", function () {
                  m(c.rows({ selected: !0 }).nodes()).removeClass(
                    c.settings()[0]._select.className
                  ),
                    s(c),
                    c.off(".dtSelect"),
                    m("body").off(".dtSelect" + v(c.table().node()));
                })),
              (e._select.style = l);
            var o,
              c,
              t = new _.Api(e);
            s(t), "api" !== l && n(t), d(new _.Api(e), "selectStyle", [l]);
          });
    }),
    t("select.selector()", function (t) {
      return void 0 === t
        ? this.context[0]._select.selector
        : this.iterator("table", function (e) {
            s(new _.Api(e)),
              (e._select.selector = t),
              "api" !== e._select.style && n(new _.Api(e));
          });
    }),
    t("select.last()", function (e) {
      var t = this.context[0];
      return e ? ((t._select_lastCell = e), this) : t._select_lastCell;
    }),
    l("rows().select()", "row().select()", function (e) {
      var l = this;
      return !1 === e
        ? this.deselect()
        : (this.iterator("row", function (e, t) {
            f(e);
            var l = e.aoData[t],
              s = e.aoColumns;
            m(l.nTr).addClass(e._select.className), (l._select_selected = !0);
            for (var c = 0; c < s.length; c++)
              "select-checkbox" === s[c].sType &&
                (m("input.dt-select-checkbox", l.anCells[c]).prop(
                  "checked",
                  !0
                ),
                (l._aSortData[c] = null));
          }),
          this.iterator("table", function (e, t) {
            d(l, "select", ["row", l[t]], !0);
          }),
          this);
    }),
    t("row().selected()", function () {
      var e = this.context[0];
      return !!(
        e &&
        this.length &&
        e.aoData[this[0]] &&
        e.aoData[this[0]]._select_selected
      );
    }),
    l("columns().select()", "column().select()", function (e) {
      var l = this;
      return !1 === e
        ? this.deselect()
        : (this.iterator("column", function (e, t) {
            f(e), (e.aoColumns[t]._select_selected = !0);
            t = new _.Api(e).column(t);
            m(t.header()).addClass(e._select.className),
              m(t.footer()).addClass(e._select.className),
              t.nodes().to$().addClass(e._select.className);
          }),
          this.iterator("table", function (e, t) {
            d(l, "select", ["column", l[t]], !0);
          }),
          this);
    }),
    t("column().selected()", function () {
      var e = this.context[0];
      return !!(
        e &&
        this.length &&
        e.aoColumns[this[0]] &&
        e.aoColumns[this[0]]._select_selected
      );
    }),
    l("cells().select()", "cell().select()", function (e) {
      var l = this;
      return !1 === e
        ? this.deselect()
        : (this.iterator("cell", function (e, t, l) {
            f(e);
            t = e.aoData[t];
            void 0 === t._selected_cells && (t._selected_cells = []),
              (t._selected_cells[l] = !0),
              t.anCells && m(t.anCells[l]).addClass(e._select.className);
          }),
          this.iterator("table", function (e, t) {
            d(l, "select", ["cell", l.cells(l[t]).indexes().toArray()], !0);
          }),
          this);
    }),
    t("cell().selected()", function () {
      var e = this.context[0];
      if (e && this.length) {
        e = e.aoData[this[0][0].row];
        if (e && e._selected_cells && e._selected_cells[this[0][0].column])
          return !0;
      }
      return !1;
    }),
    l("rows().deselect()", "row().deselect()", function () {
      var l = this;
      return (
        this.iterator("row", function (e, t) {
          var l = e.aoData[t],
            s = e.aoColumns;
          m(l.nTr).removeClass(e._select.className),
            (l._select_selected = !1),
            (e._select_lastCell = null);
          for (var c = 0; c < s.length; c++)
            "select-checkbox" === s[c].sType &&
              (m("input.dt-select-checkbox", l.anCells[c]).prop("checked", !1),
              (l._aSortData[c] = null));
        }),
        this.iterator("table", function (e, t) {
          d(l, "deselect", ["row", l[t]], !0);
        }),
        this
      );
    }),
    l("columns().deselect()", "column().deselect()", function () {
      var l = this;
      return (
        this.iterator("column", function (s, e) {
          s.aoColumns[e]._select_selected = !1;
          var t = new _.Api(s),
            l = t.column(e);
          m(l.header()).removeClass(s._select.className),
            m(l.footer()).removeClass(s._select.className),
            t
              .cells(null, e)
              .indexes()
              .each(function (e) {
                var t = s.aoData[e.row],
                  l = t._selected_cells;
                !t.anCells ||
                  (l && l[e.column]) ||
                  m(t.anCells[e.column]).removeClass(s._select.className);
              });
        }),
        this.iterator("table", function (e, t) {
          d(l, "deselect", ["column", l[t]], !0);
        }),
        this
      );
    }),
    l("cells().deselect()", "cell().deselect()", function () {
      var l = this;
      return (
        this.iterator("cell", function (e, t, l) {
          t = e.aoData[t];
          void 0 !== t._selected_cells && (t._selected_cells[l] = !1),
            t.anCells &&
              !e.aoColumns[l]._select_selected &&
              m(t.anCells[l]).removeClass(e._select.className);
        }),
        this.iterator("table", function (e, t) {
          d(l, "deselect", ["cell", l[t]], !0);
        }),
        this
      );
    });
  var b = 0;
  return (
    m.extend(_.ext.buttons, {
      selected: {
        text: o("selected", "Selected"),
        className: "buttons-selected",
        limitTo: ["rows", "columns", "cells"],
        init: function (l, e, s) {
          var c = this;
          (s._eventNamespace = ".select" + b++),
            l.on(w(s), function () {
              var e, t;
              c.enable(
                ((e = l),
                !(
                  -1 === (t = s).limitTo.indexOf("rows") ||
                  !e.rows({ selected: !0 }).any()
                ) ||
                  !(
                    -1 === t.limitTo.indexOf("columns") ||
                    !e.columns({ selected: !0 }).any()
                  ) ||
                  !(
                    -1 === t.limitTo.indexOf("cells") ||
                    !e.cells({ selected: !0 }).any()
                  ))
              );
            }),
            this.disable();
        },
        destroy: function (e, t, l) {
          e.off(l._eventNamespace);
        },
      },
      selectedSingle: {
        text: o("selectedSingle", "Selected single"),
        className: "buttons-selected-single",
        init: function (t, e, l) {
          var s = this;
          (l._eventNamespace = ".select" + b++),
            t.on(w(l), function () {
              var e =
                t.rows({ selected: !0 }).flatten().length +
                t.columns({ selected: !0 }).flatten().length +
                t.cells({ selected: !0 }).flatten().length;
              s.enable(1 === e);
            }),
            this.disable();
        },
        destroy: function (e, t, l) {
          e.off(l._eventNamespace);
        },
      },
      selectAll: {
        text: o("selectAll", "Select all"),
        className: "buttons-select-all",
        action: function (e, t, l, s) {
          var c = this.select.items(),
            n = s.selectorModifier;
          (n
            ? ("function" == typeof n && (n = n.call(t, e, t, l, s)),
              this[c + "s"](n))
            : this[c + "s"]()
          ).select();
        },
      },
      selectNone: {
        text: o("selectNone", "Deselect all"),
        className: "buttons-select-none",
        action: function () {
          f(this.settings()[0], !0);
        },
        init: function (t, e, l) {
          var s = this;
          (l._eventNamespace = ".select" + b++),
            t.on(w(l), function () {
              var e =
                t.rows({ selected: !0 }).flatten().length +
                t.columns({ selected: !0 }).flatten().length +
                t.cells({ selected: !0 }).flatten().length;
              s.enable(0 < e);
            }),
            this.disable();
        },
        destroy: function (e, t, l) {
          e.off(l._eventNamespace);
        },
      },
      showSelected: {
        text: o("showSelected", "Show only selected"),
        className: "buttons-show-selected",
        action: function (e, t) {
          var s;
          t.search.fixed("dt-select")
            ? (t.search.fixed("dt-select", null), this.active(!1))
            : ((s = t.settings()[0].aoData),
              t.search.fixed("dt-select", function (e, t, l) {
                return s[l]._select_selected;
              }),
              this.active(!0)),
            t.draw();
        },
      },
    }),
    m.each(["Row", "Column", "Cell"], function (e, t) {
      var c = t.toLowerCase();
      _.ext.buttons["select" + t + "s"] = {
        text: o("select" + t + "s", "Select " + c + "s"),
        className: "buttons-select-" + c + "s",
        action: function () {
          this.select.items(c);
        },
        init: function (e) {
          var s = this;
          e.on("selectItems.dt.DT", function (e, t, l) {
            s.active(l === c);
          });
        },
      };
    }),
    _.type("select-checkbox", {
      className: "dt-select",
      detect: function (e) {
        return "select-checkbox" === e && e;
      },
      order: {
        pre: function (e) {
          return "X" === e ? -1 : 0;
        },
      },
    }),
    m.extend(!0, _.defaults.oLanguage, {
      select: { aria: { rowCheckbox: "Select row" } },
    }),
    (_.render.select = function (e, t) {
      var n = e ? _.util.get(e) : null,
        o = t ? _.util.get(t) : null;
      return function (e, t, l, s) {
        var c = s.settings.aoData[s.row]._select_selected,
          s = s.settings.oLanguage.select.aria.rowCheckbox;
        return "display" === t
          ? m("<input>").attr({
              "aria-label": s,
              class: "dt-select-checkbox",
              name: o ? o(l) : null,
              type: "checkbox",
              value: n ? n(l) : null,
              checked: c,
            })[0]
          : "type" === t
            ? "select-checkbox"
            : "filter" !== t && c
              ? "X"
              : "";
      };
    }),
    (_.ext.order["select-checkbox"] = function (t, e) {
      return this.api()
        .column(e, { order: "index" })
        .nodes()
        .map(function (e) {
          return "row" === t._select.items
            ? m(e).parent().hasClass(t._select.className)
            : "cell" === t._select.items && m(e).hasClass(t._select.className);
        });
    }),
    (m.fn.DataTable.select = _.select),
    m(e).on("preInit.dt.dtSelect", function (e, t) {
      "dt" === e.namespace && _.select.init(new _.Api(t));
    }),
    _
  );
});

// row().show().js
!(function (n) {
  var i, o;
  "function" == typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (e) {
        return n(e, window, document);
      })
    : "object" == typeof exports
      ? ((i = require("jquery")),
        (o = function (e, t) {
          t.fn.dataTable || require("datatables.net")(e, t);
        }),
        "undefined" == typeof window
          ? (module.exports = function (e, t) {
              return (
                (e = e || window), (t = t || i(e)), o(e, t), n(t, 0, e.document)
              );
            })
          : (o(window, i), (module.exports = n(i, window, window.document))))
      : n(jQuery, window, document);
})(function (e, t, n, i) {
  "use strict";
  e = e.fn.dataTable;
  return (
    e.Api.register("row().show()", function () {
      var e = this.table().page.info(),
        t = this.index(),
        t = this.table().rows({ search: "applied" })[0].indexOf(t);
      return (
        (t >= e.start && t < e.end) ||
          t < 0 ||
          ((e = Math.floor(t / this.table().page.len())), this.table().page(e)),
        this
      );
    }),
    e
  );
});

// input.min.js
(function (b) {
  function m(a) {
    return Math.ceil(a._iDisplayStart / a._iDisplayLength) + 1;
  }
  function r(a) {
    return Math.ceil(a.fnRecordsDisplay() / a._iDisplayLength);
  }
  b.fn.dataTableExt.oPagination.input = {
    fnInit: function (a, e, h) {
      var d = document.createElement("span"),
        g = document.createElement("span"),
        c = document.createElement("span"),
        k = document.createElement("span"),
        l = document.createElement("input"),
        n = document.createElement("span"),
        u = document.createElement("span"),
        p = a.oLanguage.oPaginate,
        t = a.oClasses,
        q = p.info || "Page _INPUT_ of _TOTAL_";
      d.innerHTML = p.sFirst;
      g.innerHTML = p.sPrevious;
      c.innerHTML = p.sNext;
      k.innerHTML = p.sLast;
      d.className = "first " + t.sPageButton;
      g.className = "previous " + t.sPageButton;
      c.className = "next " + t.sPageButton;
      k.className = "last " + t.sPageButton;
      l.className = "paginate_input";
      n.className = "paginate_total";
      "" !== a.sTableId &&
        (e.setAttribute("id", a.sTableId + "_paginate"),
        d.setAttribute("id", a.sTableId + "_first"),
        g.setAttribute("id", a.sTableId + "_previous"),
        c.setAttribute("id", a.sTableId + "_next"),
        k.setAttribute("id", a.sTableId + "_last"));
      l.type = "text";
      q = q.replace(/_INPUT_/g, "</span>" + l.outerHTML + "<span>");
      q = q.replace(/_TOTAL_/g, "</span>" + n.outerHTML + "<span>");
      u.innerHTML = "<span>" + q + "</span>";
      e.appendChild(d);
      e.appendChild(g);
      b(u)
        .children()
        .each(function (f, v) {
          e.appendChild(v);
        });
      e.appendChild(c);
      e.appendChild(k);
      b(d).click(function () {
        1 !== m(a) && (a.oApi._fnPageChange(a, "first"), h(a));
      });
      b(g).click(function () {
        1 !== m(a) && (a.oApi._fnPageChange(a, "previous"), h(a));
      });
      b(c).click(function () {
        m(a) !== r(a) && (a.oApi._fnPageChange(a, "next"), h(a));
      });
      b(k).click(function () {
        m(a) !== r(a) && (a.oApi._fnPageChange(a, "last"), h(a));
      });
      b(e)
        .find(".paginate_input")
        .keyup(function (f) {
          38 === f.which || 39 === f.which
            ? this.value++
            : (37 === f.which || 40 === f.which) &&
              1 < this.value &&
              this.value--;
          "" === this.value || this.value.match(/[^0-9]/)
            ? (this.value = this.value.replace(/[^\d]/g, ""))
            : ((f = a._iDisplayLength * (this.value - 1)),
              0 > f && (f = 0),
              f >= a.fnRecordsDisplay() &&
                (f =
                  (Math.ceil(a.fnRecordsDisplay() / a._iDisplayLength) - 1) *
                  a._iDisplayLength),
              (a._iDisplayStart = f),
              a.oInstance.trigger("page.dt", a),
              h(a));
        });
      b("span", e).bind("mousedown", function () {
        return !1;
      });
      b("span", e).bind("selectstart", function () {
        return !1;
      });
      1 >= r(a) && b(e).hide();
    },
    fnUpdate: function (a) {
      if (a.aanFeatures.p) {
        var e = r(a),
          h = m(a),
          d = a.aanFeatures.p;
        if (1 >= e) b(d).hide();
        else {
          var g = a._iDisplayStart;
          var c = a._iDisplayLength;
          var k = a.fnRecordsDisplay(),
            l = -1 === c,
            n = l ? 0 : Math.ceil(g / c);
          g = 0 < n ? "" : a.oClasses.sPageButtonDisabled;
          c =
            n < (l ? 1 : Math.ceil(k / c)) - 1
              ? ""
              : a.oClasses.sPageButtonDisabled;
          c = { first: g, previous: g, next: c, last: c };
          b(d).show();
          b(d)
            .children(".first")
            .removeClass(a.oClasses.sPageButtonDisabled)
            .addClass(c.first);
          b(d)
            .children(".previous")
            .removeClass(a.oClasses.sPageButtonDisabled)
            .addClass(c.previous);
          b(d)
            .children(".next")
            .removeClass(a.oClasses.sPageButtonDisabled)
            .addClass(c.next);
          b(d)
            .children(".last")
            .removeClass(a.oClasses.sPageButtonDisabled)
            .addClass(c.last);
          b(d).find(".paginate_total").html(e);
          b(d).find(".paginate_input").val(h);
        }
      }
    },
  };
})(jQuery);

// jquery.mark.min.js
!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = t(require("jquery")))
    : "function" == typeof define && define.amd
      ? define(["jquery"], t)
      : (e.Mark = t(e.jQuery));
})(this, function (e) {
  "use strict";
  function t(e) {
    return (t =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              "function" == typeof Symbol &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? "symbol"
              : typeof e;
          })(e);
  }
  function n(e, t) {
    if (!(e instanceof t))
      throw new TypeError("Cannot call a class as a function");
  }
  function r(e, t) {
    for (var n = 0; n < t.length; n++) {
      var r = t[n];
      (r.enumerable = r.enumerable || !1),
        (r.configurable = !0),
        "value" in r && (r.writable = !0),
        Object.defineProperty(e, r.key, r);
    }
  }
  function o(e, t, n) {
    return t && r(e.prototype, t), n && r(e, n), e;
  }
  function i() {
    return (i =
      Object.assign ||
      function (e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = arguments[t];
          for (var r in n)
            Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
        }
        return e;
      }).apply(this, arguments);
  }
  e = e && e.hasOwnProperty("default") ? e.default : e;
  var a = /* */ (function () {
      function e(t) {
        var r =
            !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1],
          o =
            arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : [],
          i =
            arguments.length > 3 && void 0 !== arguments[3]
              ? arguments[3]
              : 5e3;
        n(this, e),
          (this.ctx = t),
          (this.iframes = r),
          (this.exclude = o),
          (this.iframesTimeout = i);
      }
      return (
        o(
          e,
          [
            {
              key: "getContexts",
              value: function () {
                var e = [];
                return (
                  (void 0 !== this.ctx && this.ctx
                    ? NodeList.prototype.isPrototypeOf(this.ctx)
                      ? Array.prototype.slice.call(this.ctx)
                      : Array.isArray(this.ctx)
                        ? this.ctx
                        : "string" == typeof this.ctx
                          ? Array.prototype.slice.call(
                              document.querySelectorAll(this.ctx)
                            )
                          : [this.ctx]
                    : []
                  ).forEach(function (t) {
                    var n =
                      e.filter(function (e) {
                        return e.contains(t);
                      }).length > 0;
                    -1 !== e.indexOf(t) || n || e.push(t);
                  }),
                  e
                );
              },
            },
            {
              key: "getIframeContents",
              value: function (e, t) {
                var n,
                  r =
                    arguments.length > 2 && void 0 !== arguments[2]
                      ? arguments[2]
                      : function () {};
                try {
                  var o = e.contentWindow;
                  if (((n = o.document), !o || !n))
                    throw new Error("iframe inaccessible");
                } catch (e) {
                  r();
                }
                n && t(n);
              },
            },
            {
              key: "isIframeBlank",
              value: function (e) {
                var t = "about:blank",
                  n = e.getAttribute("src").trim();
                return e.contentWindow.location.href === t && n !== t && n;
              },
            },
            {
              key: "observeIframeLoad",
              value: function (e, t, n) {
                var r = this,
                  o = !1,
                  i = null,
                  a = function a() {
                    if (!o) {
                      (o = !0), clearTimeout(i);
                      try {
                        r.isIframeBlank(e) ||
                          (e.removeEventListener("load", a),
                          r.getIframeContents(e, t, n));
                      } catch (e) {
                        n();
                      }
                    }
                  };
                e.addEventListener("load", a),
                  (i = setTimeout(a, this.iframesTimeout));
              },
            },
            {
              key: "onIframeReady",
              value: function (e, t, n) {
                try {
                  "complete" === e.contentWindow.document.readyState
                    ? this.isIframeBlank(e)
                      ? this.observeIframeLoad(e, t, n)
                      : this.getIframeContents(e, t, n)
                    : this.observeIframeLoad(e, t, n);
                } catch (e) {
                  n();
                }
              },
            },
            {
              key: "waitForIframes",
              value: function (e, t) {
                var n = this,
                  r = 0;
                this.forEachIframe(
                  e,
                  function () {
                    return !0;
                  },
                  function (e) {
                    r++,
                      n.waitForIframes(e.querySelector("html"), function () {
                        --r || t();
                      });
                  },
                  function (e) {
                    e || t();
                  }
                );
              },
            },
            {
              key: "forEachIframe",
              value: function (t, n, r) {
                var o = this,
                  i =
                    arguments.length > 3 && void 0 !== arguments[3]
                      ? arguments[3]
                      : function () {},
                  a = t.querySelectorAll("iframe"),
                  s = a.length,
                  c = 0;
                a = Array.prototype.slice.call(a);
                var u = function () {
                  --s <= 0 && i(c);
                };
                s || u(),
                  a.forEach(function (t) {
                    e.matches(t, o.exclude)
                      ? u()
                      : o.onIframeReady(
                          t,
                          function (e) {
                            n(t) && (c++, r(e)), u();
                          },
                          u
                        );
                  });
              },
            },
            {
              key: "createIterator",
              value: function (e, t, n) {
                return document.createNodeIterator(e, t, n, !1);
              },
            },
            {
              key: "createInstanceOnIframe",
              value: function (t) {
                return new e(t.querySelector("html"), this.iframes);
              },
            },
            {
              key: "compareNodeIframe",
              value: function (e, t, n) {
                if (
                  e.compareDocumentPosition(n) &
                  Node.DOCUMENT_POSITION_PRECEDING
                ) {
                  if (null === t) return !0;
                  if (
                    t.compareDocumentPosition(n) &
                    Node.DOCUMENT_POSITION_FOLLOWING
                  )
                    return !0;
                }
                return !1;
              },
            },
            {
              key: "getIteratorNode",
              value: function (e) {
                var t = e.previousNode();
                return {
                  prevNode: t,
                  node:
                    null === t ? e.nextNode() : e.nextNode() && e.nextNode(),
                };
              },
            },
            {
              key: "checkIframeFilter",
              value: function (e, t, n, r) {
                var o = !1,
                  i = !1;
                return (
                  r.forEach(function (e, t) {
                    e.val === n && ((o = t), (i = e.handled));
                  }),
                  this.compareNodeIframe(e, t, n)
                    ? (!1 !== o || i
                        ? !1 === o || i || (r[o].handled = !0)
                        : r.push({ val: n, handled: !0 }),
                      !0)
                    : (!1 === o && r.push({ val: n, handled: !1 }), !1)
                );
              },
            },
            {
              key: "handleOpenIframes",
              value: function (e, t, n, r) {
                var o = this;
                e.forEach(function (e) {
                  e.handled ||
                    o.getIframeContents(e.val, function (e) {
                      o.createInstanceOnIframe(e).forEachNode(t, n, r);
                    });
                });
              },
            },
            {
              key: "iterateThroughNodes",
              value: function (e, t, n, r, o) {
                for (
                  var i,
                    a,
                    s,
                    c = this,
                    u = this.createIterator(t, e, r),
                    l = [],
                    h = [];
                  (s = void 0),
                    (s = c.getIteratorNode(u)),
                    (a = s.prevNode),
                    (i = s.node);

                )
                  this.iframes &&
                    this.forEachIframe(
                      t,
                      function (e) {
                        return c.checkIframeFilter(i, a, e, l);
                      },
                      function (t) {
                        c.createInstanceOnIframe(t).forEachNode(
                          e,
                          function (e) {
                            return h.push(e);
                          },
                          r
                        );
                      }
                    ),
                    h.push(i);
                h.forEach(function (e) {
                  n(e);
                }),
                  this.iframes && this.handleOpenIframes(l, e, n, r),
                  o();
              },
            },
            {
              key: "forEachNode",
              value: function (e, t, n) {
                var r = this,
                  o =
                    arguments.length > 3 && void 0 !== arguments[3]
                      ? arguments[3]
                      : function () {},
                  i = this.getContexts(),
                  a = i.length;
                a || o(),
                  i.forEach(function (i) {
                    var s = function () {
                      r.iterateThroughNodes(e, i, t, n, function () {
                        --a <= 0 && o();
                      });
                    };
                    r.iframes ? r.waitForIframes(i, s) : s();
                  });
              },
            },
          ],
          [
            {
              key: "matches",
              value: function (e, t) {
                var n = "string" == typeof t ? [t] : t,
                  r =
                    e.matches ||
                    e.matchesSelector ||
                    e.msMatchesSelector ||
                    e.mozMatchesSelector ||
                    e.oMatchesSelector ||
                    e.webkitMatchesSelector;
                if (r) {
                  var o = !1;
                  return (
                    n.every(function (t) {
                      return !r.call(e, t) || ((o = !0), !1);
                    }),
                    o
                  );
                }
                return !1;
              },
            },
          ]
        ),
        e
      );
    })(),
    s = /* */ (function () {
      function e(t) {
        n(this, e),
          (this.opt = i(
            {},
            {
              diacritics: !0,
              synonyms: {},
              accuracy: "partially",
              caseSensitive: !1,
              ignoreJoiners: !1,
              ignorePunctuation: [],
              wildcards: "disabled",
            },
            t
          ));
      }
      return (
        o(e, [
          {
            key: "create",
            value: function (e) {
              return (
                "disabled" !== this.opt.wildcards &&
                  (e = this.setupWildcardsRegExp(e)),
                (e = this.escapeStr(e)),
                Object.keys(this.opt.synonyms).length &&
                  (e = this.createSynonymsRegExp(e)),
                (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) &&
                  (e = this.setupIgnoreJoinersRegExp(e)),
                this.opt.diacritics && (e = this.createDiacriticsRegExp(e)),
                (e = this.createMergedBlanksRegExp(e)),
                (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) &&
                  (e = this.createJoinersRegExp(e)),
                "disabled" !== this.opt.wildcards &&
                  (e = this.createWildcardsRegExp(e)),
                (e = this.createAccuracyRegExp(e)),
                new RegExp(e, "gm".concat(this.opt.caseSensitive ? "" : "i"))
              );
            },
          },
          {
            key: "sortByLength",
            value: function (e) {
              return e.sort(function (e, t) {
                return e.length === t.length
                  ? e > t
                    ? 1
                    : -1
                  : t.length - e.length;
              });
            },
          },
          {
            key: "escapeStr",
            value: function (e) {
              return e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
          },
          {
            key: "createSynonymsRegExp",
            value: function (e) {
              var t = this,
                n = this.opt.synonyms,
                r = this.opt.caseSensitive ? "" : "i",
                o =
                  this.opt.ignoreJoiners || this.opt.ignorePunctuation.length
                    ? "\0"
                    : "";
              for (var i in n)
                if (n.hasOwnProperty(i)) {
                  var a = Array.isArray(n[i]) ? n[i] : [n[i]];
                  a.unshift(i),
                    (a = this.sortByLength(a)
                      .map(function (e) {
                        return (
                          "disabled" !== t.opt.wildcards &&
                            (e = t.setupWildcardsRegExp(e)),
                          (e = t.escapeStr(e))
                        );
                      })
                      .filter(function (e) {
                        return "" !== e;
                      })).length > 1 &&
                      (e = e.replace(
                        new RegExp(
                          "(".concat(
                            a
                              .map(function (e) {
                                return t.escapeStr(e);
                              })
                              .join("|"),
                            ")"
                          ),
                          "gm".concat(r)
                        ),
                        o +
                          "(".concat(
                            a
                              .map(function (e) {
                                return t.processSynonyms(e);
                              })
                              .join("|"),
                            ")"
                          ) +
                          o
                      ));
                }
              return e;
            },
          },
          {
            key: "processSynonyms",
            value: function (e) {
              return (
                (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) &&
                  (e = this.setupIgnoreJoinersRegExp(e)),
                e
              );
            },
          },
          {
            key: "setupWildcardsRegExp",
            value: function (e) {
              return (e = e.replace(/(?:\\)*\?/g, function (e) {
                return "\\" === e.charAt(0) ? "?" : "";
              })).replace(/(?:\\)*\*/g, function (e) {
                return "\\" === e.charAt(0) ? "*" : "";
              });
            },
          },
          {
            key: "createWildcardsRegExp",
            value: function (e) {
              var t = "withSpaces" === this.opt.wildcards;
              return e
                .replace(/\u0001/g, t ? "[\\S\\s]?" : "\\S?")
                .replace(/\u0002/g, t ? "[\\S\\s]*?" : "\\S*");
            },
          },
          {
            key: "setupIgnoreJoinersRegExp",
            value: function (e) {
              return e.replace(/[^(|)\\]/g, function (e, t, n) {
                var r = n.charAt(t + 1);
                return /[(|)\\]/.test(r) || "" === r ? e : e + "\0";
              });
            },
          },
          {
            key: "createJoinersRegExp",
            value: function (e) {
              var t = [],
                n = this.opt.ignorePunctuation;
              return (
                Array.isArray(n) &&
                  n.length &&
                  t.push(this.escapeStr(n.join(""))),
                this.opt.ignoreJoiners &&
                  t.push("\\u00ad\\u200b\\u200c\\u200d"),
                t.length
                  ? e.split(/\u0000+/).join("[".concat(t.join(""), "]*"))
                  : e
              );
            },
          },
          {
            key: "createDiacriticsRegExp",
            value: function (e) {
              var t = this.opt.caseSensitive ? "" : "i",
                n = this.opt.caseSensitive
                  ? [
                      "aàáảãạăằắẳẵặâầấẩẫậäåāą",
                      "AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ",
                      "cçćč",
                      "CÇĆČ",
                      "dđď",
                      "DĐĎ",
                      "eèéẻẽẹêềếểễệëěēę",
                      "EÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ",
                      "iìíỉĩịîïī",
                      "IÌÍỈĨỊÎÏĪ",
                      "lł",
                      "LŁ",
                      "nñňń",
                      "NÑŇŃ",
                      "oòóỏõọôồốổỗộơởỡớờợöøō",
                      "OÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ",
                      "rř",
                      "RŘ",
                      "sšśșş",
                      "SŠŚȘŞ",
                      "tťțţ",
                      "TŤȚŢ",
                      "uùúủũụưừứửữựûüůū",
                      "UÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ",
                      "yýỳỷỹỵÿ",
                      "YÝỲỶỸỴŸ",
                      "zžżź",
                      "ZŽŻŹ",
                    ]
                  : [
                      "aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ",
                      "cçćčCÇĆČ",
                      "dđďDĐĎ",
                      "eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ",
                      "iìíỉĩịîïīIÌÍỈĨỊÎÏĪ",
                      "lłLŁ",
                      "nñňńNÑŇŃ",
                      "oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ",
                      "rřRŘ",
                      "sšśșşSŠŚȘŞ",
                      "tťțţTŤȚŢ",
                      "uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ",
                      "yýỳỷỹỵÿYÝỲỶỸỴŸ",
                      "zžżźZŽŻŹ",
                    ],
                r = [];
              return (
                e.split("").forEach(function (o) {
                  n.every(function (n) {
                    if (-1 !== n.indexOf(o)) {
                      if (r.indexOf(n) > -1) return !1;
                      (e = e.replace(
                        new RegExp("[".concat(n, "]"), "gm".concat(t)),
                        "[".concat(n, "]")
                      )),
                        r.push(n);
                    }
                    return !0;
                  });
                }),
                e
              );
            },
          },
          {
            key: "createMergedBlanksRegExp",
            value: function (e) {
              return e.replace(/[\s]+/gim, "[\\s]+");
            },
          },
          {
            key: "createAccuracyRegExp",
            value: function (e) {
              var t = this,
                n = this.opt.accuracy,
                r = "string" == typeof n ? n : n.value,
                o = "string" == typeof n ? [] : n.limiters,
                i = "";
              switch (
                (o.forEach(function (e) {
                  i += "|".concat(t.escapeStr(e));
                }),
                r)
              ) {
                case "partially":
                default:
                  return "()(".concat(e, ")");
                case "complementary":
                  return (
                    (i =
                      "\\s" +
                      (i ||
                        this.escapeStr(
                          "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~¡¿"
                        ))),
                    "()([^".concat(i, "]*").concat(e, "[^").concat(i, "]*)")
                  );
                case "exactly":
                  return "(^|\\s"
                    .concat(i, ")(")
                    .concat(e, ")(?=$|\\s")
                    .concat(i, ")");
              }
            },
          },
        ]),
        e
      );
    })(),
    c = /* */ (function () {
      function e(t) {
        n(this, e), (this.ctx = t), (this.ie = !1);
        var r = window.navigator.userAgent;
        (r.indexOf("MSIE") > -1 || r.indexOf("Trident") > -1) && (this.ie = !0);
      }
      return (
        o(e, [
          {
            key: "log",
            value: function (e) {
              var n =
                  arguments.length > 1 && void 0 !== arguments[1]
                    ? arguments[1]
                    : "debug",
                r = this.opt.log;
              this.opt.debug &&
                "object" === t(r) &&
                "function" == typeof r[n] &&
                r[n]("mark.js: ".concat(e));
            },
          },
          {
            key: "getSeparatedKeywords",
            value: function (e) {
              var t = this,
                n = [];
              return (
                e.forEach(function (e) {
                  t.opt.separateWordSearch
                    ? e.split(" ").forEach(function (e) {
                        e.trim() && -1 === n.indexOf(e) && n.push(e);
                      })
                    : e.trim() && -1 === n.indexOf(e) && n.push(e);
                }),
                {
                  keywords: n.sort(function (e, t) {
                    return t.length - e.length;
                  }),
                  length: n.length,
                }
              );
            },
          },
          {
            key: "isNumeric",
            value: function (e) {
              return Number(parseFloat(e)) == e;
            },
          },
          {
            key: "checkRanges",
            value: function (e) {
              var t = this;
              if (
                !Array.isArray(e) ||
                "[object Object]" !== Object.prototype.toString.call(e[0])
              )
                return (
                  this.log("markRanges() will only accept an array of objects"),
                  this.opt.noMatch(e),
                  []
                );
              var n = [],
                r = 0;
              return (
                e
                  .sort(function (e, t) {
                    return e.start - t.start;
                  })
                  .forEach(function (e) {
                    var o = t.callNoMatchOnInvalidRanges(e, r),
                      i = o.start,
                      a = o.end;
                    o.valid &&
                      ((e.start = i), (e.length = a - i), n.push(e), (r = a));
                  }),
                n
              );
            },
          },
          {
            key: "callNoMatchOnInvalidRanges",
            value: function (e, t) {
              var n,
                r,
                o = !1;
              return (
                e && void 0 !== e.start
                  ? ((r = (n = parseInt(e.start, 10)) + parseInt(e.length, 10)),
                    this.isNumeric(e.start) &&
                    this.isNumeric(e.length) &&
                    r - t > 0 &&
                    r - n > 0
                      ? (o = !0)
                      : (this.log(
                          "Ignoring invalid or overlapping range: " +
                            "".concat(JSON.stringify(e))
                        ),
                        this.opt.noMatch(e)))
                  : (this.log(
                      "Ignoring invalid range: ".concat(JSON.stringify(e))
                    ),
                    this.opt.noMatch(e)),
                { start: n, end: r, valid: o }
              );
            },
          },
          {
            key: "checkWhitespaceRanges",
            value: function (e, t, n) {
              var r,
                o = !0,
                i = n.length,
                a = t - i,
                s = parseInt(e.start, 10) - a;
              return (
                (r = (s = s > i ? i : s) + parseInt(e.length, 10)) > i &&
                  ((r = i),
                  this.log(
                    "End range automatically set to the max value of ".concat(i)
                  )),
                s < 0 || r - s < 0 || s > i || r > i
                  ? ((o = !1),
                    this.log("Invalid range: ".concat(JSON.stringify(e))),
                    this.opt.noMatch(e))
                  : "" === n.substring(s, r).replace(/\s+/g, "") &&
                    ((o = !1),
                    this.log(
                      "Skipping whitespace only range: " + JSON.stringify(e)
                    ),
                    this.opt.noMatch(e)),
                { start: s, end: r, valid: o }
              );
            },
          },
          {
            key: "getTextNodes",
            value: function (e) {
              var t = this,
                n = "",
                r = [];
              this.iterator.forEachNode(
                NodeFilter.SHOW_TEXT,
                function (e) {
                  r.push({
                    start: n.length,
                    end: (n += e.textContent).length,
                    node: e,
                  });
                },
                function (e) {
                  return t.matchesExclude(e.parentNode)
                    ? NodeFilter.FILTER_REJECT
                    : NodeFilter.FILTER_ACCEPT;
                },
                function () {
                  e({ value: n, nodes: r });
                }
              );
            },
          },
          {
            key: "matchesExclude",
            value: function (e) {
              return a.matches(
                e,
                this.opt.exclude.concat([
                  "script",
                  "style",
                  "title",
                  "head",
                  "html",
                ])
              );
            },
          },
          {
            key: "wrapRangeInTextNode",
            value: function (e, t, n) {
              var r = this.opt.element ? this.opt.element : "mark",
                o = e.splitText(t),
                i = o.splitText(n - t),
                a = document.createElement(r);
              return (
                a.setAttribute("data-markjs", "true"),
                this.opt.className &&
                  a.setAttribute("class", this.opt.className),
                (a.textContent = o.textContent),
                o.parentNode.replaceChild(a, o),
                i
              );
            },
          },
          {
            key: "wrapRangeInMappedTextNode",
            value: function (e, t, n, r, o) {
              var i = this;
              e.nodes.every(function (a, s) {
                var c = e.nodes[s + 1];
                if (void 0 === c || c.start > t) {
                  if (!r(a.node)) return !1;
                  var u = t - a.start,
                    l = (n > a.end ? a.end : n) - a.start,
                    h = e.value.substr(0, a.start),
                    f = e.value.substr(l + a.start);
                  if (
                    ((a.node = i.wrapRangeInTextNode(a.node, u, l)),
                    (e.value = h + f),
                    e.nodes.forEach(function (t, n) {
                      n >= s &&
                        (e.nodes[n].start > 0 &&
                          n !== s &&
                          (e.nodes[n].start -= l),
                        (e.nodes[n].end -= l));
                    }),
                    (n -= l),
                    o(a.node.previousSibling, a.start),
                    !(n > a.end))
                  )
                    return !1;
                  t = a.end;
                }
                return !0;
              });
            },
          },
          {
            key: "wrapGroups",
            value: function (e, t, n, r) {
              return (
                r((e = this.wrapRangeInTextNode(e, t, t + n)).previousSibling),
                e
              );
            },
          },
          {
            key: "separateGroups",
            value: function (e, t, n, r, o) {
              for (var i = t.length, a = 1; a < i; a++) {
                var s = e.textContent.indexOf(t[a]);
                t[a] &&
                  s > -1 &&
                  r(t[a], e) &&
                  (e = this.wrapGroups(e, s, t[a].length, o));
              }
              return e;
            },
          },
          {
            key: "wrapMatches",
            value: function (e, t, n, r, o) {
              var i = this,
                a = 0 === t ? 0 : t + 1;
              this.getTextNodes(function (t) {
                t.nodes.forEach(function (t) {
                  var o;
                  for (
                    t = t.node;
                    null !== (o = e.exec(t.textContent)) && "" !== o[a];

                  ) {
                    if (i.opt.separateGroups)
                      t = i.separateGroups(t, o, a, n, r);
                    else {
                      if (!n(o[a], t)) continue;
                      var s = o.index;
                      if (0 !== a) for (var c = 1; c < a; c++) s += o[c].length;
                      t = i.wrapGroups(t, s, o[a].length, r);
                    }
                    e.lastIndex = 0;
                  }
                }),
                  o();
              });
            },
          },
          {
            key: "wrapMatchesAcrossElements",
            value: function (e, t, n, r, o) {
              var i = this,
                a = 0 === t ? 0 : t + 1;
              this.getTextNodes(function (t) {
                for (var s; null !== (s = e.exec(t.value)) && "" !== s[a]; ) {
                  var c = s.index;
                  if (0 !== a) for (var u = 1; u < a; u++) c += s[u].length;
                  var l = c + s[a].length;
                  i.wrapRangeInMappedTextNode(
                    t,
                    c,
                    l,
                    function (e) {
                      return n(s[a], e);
                    },
                    function (t, n) {
                      (e.lastIndex = n), r(t);
                    }
                  );
                }
                o();
              });
            },
          },
          {
            key: "wrapRangeFromIndex",
            value: function (e, t, n, r) {
              var o = this;
              this.getTextNodes(function (i) {
                var a = i.value.length;
                e.forEach(function (e, r) {
                  var s = o.checkWhitespaceRanges(e, a, i.value),
                    c = s.start,
                    u = s.end;
                  s.valid &&
                    o.wrapRangeInMappedTextNode(
                      i,
                      c,
                      u,
                      function (n) {
                        return t(n, e, i.value.substring(c, u), r);
                      },
                      function (t) {
                        n(t, e);
                      }
                    );
                }),
                  r();
              });
            },
          },
          {
            key: "unwrapMatches",
            value: function (e) {
              for (
                var t = e.parentNode, n = document.createDocumentFragment();
                e.firstChild;

              )
                n.appendChild(e.removeChild(e.firstChild));
              t.replaceChild(n, e),
                this.ie ? this.normalizeTextNode(t) : t.normalize();
            },
          },
          {
            key: "normalizeTextNode",
            value: function (e) {
              if (e) {
                if (3 === e.nodeType)
                  for (; e.nextSibling && 3 === e.nextSibling.nodeType; )
                    (e.nodeValue += e.nextSibling.nodeValue),
                      e.parentNode.removeChild(e.nextSibling);
                else this.normalizeTextNode(e.firstChild);
                this.normalizeTextNode(e.nextSibling);
              }
            },
          },
          {
            key: "markRegExp",
            value: function (e, t) {
              var n = this;
              (this.opt = t),
                this.log('Searching with expression "'.concat(e, '"'));
              var r = 0,
                o = "wrapMatches";
              this.opt.acrossElements && (o = "wrapMatchesAcrossElements"),
                this[o](
                  e,
                  this.opt.ignoreGroups,
                  function (e, t) {
                    return n.opt.filter(t, e, r);
                  },
                  function (e) {
                    r++, n.opt.each(e);
                  },
                  function () {
                    0 === r && n.opt.noMatch(e), n.opt.done(r);
                  }
                );
            },
          },
          {
            key: "mark",
            value: function (e, t) {
              var n = this;
              this.opt = t;
              var r = 0,
                o = "wrapMatches",
                i = this.getSeparatedKeywords("string" == typeof e ? [e] : e),
                a = i.keywords,
                c = i.length;
              this.opt.acrossElements && (o = "wrapMatchesAcrossElements"),
                0 === c
                  ? this.opt.done(r)
                  : (function e(t) {
                      var i = new s(n.opt).create(t),
                        u = 0;
                      n.log('Searching with expression "'.concat(i, '"')),
                        n[o](
                          i,
                          1,
                          function (e, o) {
                            return n.opt.filter(o, t, r, u);
                          },
                          function (e) {
                            u++, r++, n.opt.each(e);
                          },
                          function () {
                            0 === u && n.opt.noMatch(t),
                              a[c - 1] === t
                                ? n.opt.done(r)
                                : e(a[a.indexOf(t) + 1]);
                          }
                        );
                    })(a[0]);
            },
          },
          {
            key: "markRanges",
            value: function (e, t) {
              var n = this;
              this.opt = t;
              var r = 0,
                o = this.checkRanges(e);
              o && o.length
                ? (this.log(
                    "Starting to mark with the following ranges: " +
                      JSON.stringify(o)
                  ),
                  this.wrapRangeFromIndex(
                    o,
                    function (e, t, r, o) {
                      return n.opt.filter(e, t, r, o);
                    },
                    function (e, t) {
                      r++, n.opt.each(e, t);
                    },
                    function () {
                      n.opt.done(r);
                    }
                  ))
                : this.opt.done(r);
            },
          },
          {
            key: "unmark",
            value: function (e) {
              var t = this;
              this.opt = e;
              var n = this.opt.element ? this.opt.element : "*";
              (n += "[data-markjs]"),
                this.opt.className && (n += ".".concat(this.opt.className)),
                this.log('Removal selector "'.concat(n, '"')),
                this.iterator.forEachNode(
                  NodeFilter.SHOW_ELEMENT,
                  function (e) {
                    t.unwrapMatches(e);
                  },
                  function (e) {
                    var r = a.matches(e, n),
                      o = t.matchesExclude(e);
                    return !r || o
                      ? NodeFilter.FILTER_REJECT
                      : NodeFilter.FILTER_ACCEPT;
                  },
                  this.opt.done
                );
            },
          },
          {
            key: "opt",
            set: function (e) {
              this._opt = i(
                {},
                {
                  element: "",
                  className: "",
                  exclude: [],
                  iframes: !1,
                  iframesTimeout: 5e3,
                  separateWordSearch: !0,
                  acrossElements: !1,
                  ignoreGroups: 0,
                  each: function () {},
                  noMatch: function () {},
                  filter: function () {
                    return !0;
                  },
                  done: function () {},
                  debug: !1,
                  log: window.console,
                },
                e
              );
            },
            get: function () {
              return this._opt;
            },
          },
          {
            key: "iterator",
            get: function () {
              return new a(
                this.ctx,
                this.opt.iframes,
                this.opt.exclude,
                this.opt.iframesTimeout
              );
            },
          },
        ]),
        e
      );
    })();
  return (
    (e.fn.mark = function (e, t) {
      return new c(this.get()).mark(e, t), this;
    }),
    (e.fn.markRegExp = function (e, t) {
      return new c(this.get()).markRegExp(e, t), this;
    }),
    (e.fn.markRanges = function (e, t) {
      return new c(this.get()).markRanges(e, t), this;
    }),
    (e.fn.unmark = function (e) {
      return new c(this.get()).unmark(e), this;
    }),
    e
  );
});

// datatables.mark.min.js
("use strict");
var _createClass = (function () {
    function a(t, e) {
      for (var n = 0; n < e.length; n++) {
        var a = e[n];
        (a.enumerable = a.enumerable || !1),
          (a.configurable = !0),
          "value" in a && (a.writable = !0),
          Object.defineProperty(t, a.key, a);
      }
    }
    return function (t, e, n) {
      return e && a(t.prototype, e), n && a(t, n), t;
    };
  })(),
  _typeof =
    "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
      ? function (t) {
          return typeof t;
        }
      : function (t) {
          return t &&
            "function" == typeof Symbol &&
            t.constructor === Symbol &&
            t !== Symbol.prototype
            ? "symbol"
            : typeof t;
        };
function _classCallCheck(t, e) {
  if (!(t instanceof e))
    throw new TypeError("Cannot call a class as a function");
}
!(function (e, t, n) {
  var a;
  "object" === ("undefined" == typeof exports ? "undefined" : _typeof(exports))
    ? ((a = require("jquery")),
      require("datatables.net"),
      require("mark.js/dist/jquery.mark.js"),
      (module.exports = e(0, n, a)))
    : "function" == typeof define && define.amd
      ? define(["jquery", "datatables.net", "markjs"], function (t) {
          return e(0, n, t);
        })
      : e(0, n, jQuery);
})(
  function (t, e, i) {
    var r =
      (_createClass(n, [
        {
          key: "initMarkListener",
          value: function () {
            var t = this,
              e = "draw.dt.dth column-visibility.dt.dth column-reorder.dt.dth";
            e += " responsive-display.dt.dth";
            var n = null;
            this.instance.on(e, function () {
              t.instance.rows({ filter: "applied", page: "current" }).nodes()
                .length > t.intervalThreshold
                ? (clearTimeout(n),
                  (n = setTimeout(function () {
                    t.mark();
                  }, t.intervalMs)))
                : t.mark();
            }),
              this.instance.on("destroy", function () {
                t.instance.off(e);
              }),
              this.mark();
          },
        },
        {
          key: "mark",
          value: function () {
            var a = this,
              r = this.instance.search(),
              t = i(this.instance.table().body());
            t.unmark(this.options),
              this.instance.table().rows({ search: "applied" }).data().length &&
                t.mark(r, this.options),
              this.instance
                .columns({ search: "applied", page: "current" })
                .nodes()
                .each(function (t, e) {
                  var n = a.instance.column(e).search() || r;
                  n &&
                    t.forEach(function (t) {
                      i(t).unmark(a.options).mark(n, a.options);
                    });
                });
          },
        },
      ]),
      n);
    function n(t, e) {
      if ((_classCallCheck(this, n), !i.fn.mark || !i.fn.unmark))
        throw new Error("jquery.mark.js is necessary for datatables.mark.js");
      (this.instance = t),
        (this.options =
          "object" === (void 0 === e ? "undefined" : _typeof(e)) ? e : {}),
        (this.intervalThreshold = 49),
        (this.intervalMs = 300),
        this.initMarkListener();
    }
    i(e).on("init.dt.dth", function (t, e) {
      var n, a;
      "dt" === t.namespace &&
        ((a = null),
        (n = i.fn.dataTable.Api(e)).init().mark
          ? (a = n.init().mark)
          : i.fn.dataTable.defaults.mark && (a = i.fn.dataTable.defaults.mark),
        null !== a && new r(n, a));
    });
  },
  window,
  document
);

// dataTables.keepConditions.min.js
("use strict");
function _typeof(t) {
  return t && "undefined" != typeof Symbol && t.constructor === Symbol
    ? "symbol"
    : typeof t;
}
function _classCallCheck(t, n) {
  if (!(t instanceof n))
    throw new TypeError("Cannot call a class as a function");
}
var _createClass = (function () {
    function t(t, n) {
      for (var e = 0; e < n.length; e++) {
        var i = n[e];
        (i.enumerable = i.enumerable || !1),
          (i.configurable = !0),
          "value" in i && (i.writable = !0),
          Object.defineProperty(t, i.key, i);
      }
    }
    return function (n, e, i) {
      return e && t(n.prototype, e), i && t(n, i), n;
    };
  })(),
  KeepConditions = (function () {
    function t(n) {
      if (
        (_classCallCheck(this, t),
        !$.fn.DataTable.isDataTable(n) && (!n) instanceof $.fn.dataTable.Api)
      )
        throw new Error(
          "Failed to initialize KeepConditions plugin on non-datatable object"
        );
      n instanceof $.fn.dataTable.Api
        ? (this._dtApi = n)
        : (this._dtApi = new $.fn.dataTable.Api(n)),
        (n = this._dtApi.settings()[0]),
        (this._dtSettings = n),
        (this._tableId = $(this._dtApi.table().node()).attr("id")),
        (this._dtDefaults = $.fn.dataTable.defaults),
        (this._keysToCons = this._keyMap()),
        (this._shouldDraw = !1),
        (this._enabledConditions = []),
        (this._eventNamespace = "keepConditions"),
        (n.oKeepConditions = this),
        this._init();
    }
    return (
      _createClass(
        t,
        [
          {
            key: "_init",
            value: function () {
              this._collectEnabled(),
                (this._dtSettings.oInit.keepConditions === !0 ||
                  "string" == typeof this._dtSettings.oInit.keepConditions ||
                  $.isArray(this._dtSettings.oInit.keepConditions) ||
                  ($.isPlainObject(this._dtSettings.oInit.keepConditions) &&
                    ("undefined" ==
                      typeof this._dtSettings.oInit.keepConditions
                        .attachEvents ||
                      this._dtSettings.oInit.keepConditions.attachEvents ===
                        !0))) &&
                  this.attachEvents(),
                this.processHash();
            },
          },
          {
            key: "_collectEnabled",
            value: function () {
              var t = this;
              $.each(this.conditions(), function (n, e) {
                t._isEnabled(n) && e.isInit() && t.enableCondition(n);
              });
            },
          },
          {
            key: "_keyMap",
            value: function () {
              return (function (t) {
                var n = {};
                return (
                  $.each(t, function (t, e) {
                    n[e.key] = t;
                  }),
                  n
                );
              })(this.conditions());
            },
          },
          {
            key: "_isEnabled",
            value: function (t) {
              var n = this._dtSettings.oInit.keepConditions;
              if (1 === t.length) {
                var e = this.nameByKey(t);
                if (!t)
                  throw new Error(
                    "Unable to find an existing condition with the key '" +
                      t +
                      "'"
                  );
                t = e;
              } else if (this.conditions(t) === !1)
                throw new Error(
                  "Unable to find an existing condition with the name '" +
                    t +
                    "'"
                );
              return (
                n === !0 ||
                "undefined" == typeof n ||
                ("string" == typeof n &&
                  -1 !== n.indexOf(this.conditions(t).key)) ||
                ($.isArray(n) && -1 !== $.inArray(t, n)) ||
                ($.isPlainObject(n) &&
                  $.isArray(n.conditions) &&
                  -1 !== $.inArray(t, n.conditions)) ||
                ($.isPlainObject(n) &&
                  "string" == typeof n.conditions &&
                  -1 !== n.conditions.indexOf(this.conditions(t).key))
              );
            },
          },
          {
            key: "_drawTable",
            value: function (t, n) {
              (this._shouldDraw === !0 || t === !0) &&
                (this._dtApi.draw(n === !0), (this._shouldDraw = !1));
            },
          },
          { key: "_lang", value: function (t, n) {} },
          {
            key: "structureHash",
            value: function (n) {
              return t.structureHash(this._dtSettings, n);
            },
          },
          {
            key: "dtSettings",
            value: function () {
              return this._dtSettings;
            },
          },
          {
            key: "attachEvents",
            value: function () {
              var n = this,
                e = { dtSettings: this._dtSettings },
                i = this.getEnabledConditions();
              if (i === !1)
                throw new Error("No enabled conditions to attach to events");
              var o = this.conditions(i);
              $.each(o, function (i, o) {
                n._dtApi.on(
                  o.event + "." + n._eventNamespace,
                  e,
                  t.structureHash.bind(t)
                );
              });
            },
          },
          {
            key: "detachEvents",
            value: function () {
              var t = this,
                n =
                  ({ dtSettings: this._dtSettings },
                  this.getEnabledConditions());
              if (n === !1)
                throw new Error("No enabled conditions to attach to events");
              var e = this.conditions(n);
              $.each(e, function (n, e) {
                t._isEnabled(n) &&
                  e.isInit() &&
                  t._dtApi.off(e.event + "." + t._eventNamespace);
              });
            },
          },
          {
            key: "detachEvent",
            value: function (n) {
              var e = this;
              if ("undefined" == typeof n)
                return void console.warn(
                  "No condition or event specified for KeepConditions.detachEvent(), nothing is getting detached"
                );
              var i = this.conditions(n);
              if (!i) return !1;
              var o;
              "string" == typeof n
                ? ((o = n.endsWith(".dt") ? n : i.event),
                  this._dtApi.off(o, t.structureHash.bind(t)))
                : $.isArray(n) && n.length > 0
                  ? $.each(n, function (t, n) {
                      if (n.endsWith(".dt")) o = n;
                      else {
                        if ("undefined" == typeof i[n])
                          throw new Error("Unknown condition specified: " + n);
                        o = i[n].event;
                      }
                      e._dtApi.off(o + "." + e._eventNamespace);
                    })
                  : console.warn(
                      "Illegal parameter type for KeepConditions.detachEvent(), should be array or string, was: ",
                      "undefined" == typeof n ? "undefined" : _typeof(n)
                    );
            },
          },
          {
            key: "attachEvent",
            value: function (n) {
              var e = this;
              if ("undefined" == typeof n)
                return void console.warn(
                  "No condition or event specified for KeepConditions.attachEvent(), nothing is getting attached"
                );
              var i = { dtSettings: this._dtSettings },
                o = this.conditions(n);
              if (!o) return !1;
              var s;
              "string" == typeof n
                ? ((s = n.endsWith(".dt") ? n : o.event),
                  this._dtApi.on(s, i, t.structureHash.bind(t)))
                : $.isArray(n) && n.length > 0
                  ? $.each(n, function (n, i) {
                      if (i.endsWith(".dt")) s = i;
                      else {
                        if ("undefined" == typeof o[i])
                          throw new Error("Unknown condition specified: " + i);
                        s = o[i].event;
                      }
                      e._dtApi.on(
                        s + "." + e._eventNamespace,
                        t.structureHash.bind(t)
                      );
                    })
                  : console.warn(
                      "Illegal parameter type for KeepConditions.attachEvent(), should be array or string, was: " +
                        ("undefined" == typeof n ? "undefined" : _typeof(n))
                    );
            },
          },
          {
            key: "processHash",
            value: function () {
              var n = this;
              $.each(t.queryString(), function (t, e) {
                ($.isArray(e) || $.isPlainObject(e)) && (e = e[0]),
                  t === n._tableId &&
                    ($.each(e.split(":"), function (t, e) {
                      var i = e.charAt(0),
                        o = e.substring(1),
                        s = n.nameByKey(i),
                        a = n.conditions()[s];
                      if (-1 !== $.inArray(s, n.getEnabledConditions()))
                        return "undefined" == typeof a
                          ? void console.warn(
                              "[keepConditions:' " +
                                n._tableId +
                                "] No condition object found for condition key:",
                              i
                            )
                          : void a.onLoad(o);
                    }),
                    n._drawTable());
              });
            },
          },
          {
            key: "enableCondition",
            value: function (n, e) {
              var i = this,
                o = !1;
              $.isArray(n)
                ? $.each(n, function (t, n) {
                    1 === n.length && (n = i.nameByKey(n)),
                      i.conditions(n) !== !1 &&
                        (i._enabledConditions.push(n), (o = !0));
                  })
                : "string" == typeof n &&
                  (1 === n.length && (n = this.nameByKey(n)),
                  this.conditions(n) !== !1 &&
                    (this._enabledConditions.push(n), (o = !0))),
                e === !0 && o === !0 && t.structureHash(this._dtSettings, !1);
            },
          },
          {
            key: "disableCondition",
            value: function (n, e) {
              var i = this,
                o = !1;
              $.isArray(n)
                ? $.each(n, function (t, n) {
                    1 === n.length && (n = i.nameByKey(n)),
                      i.conditions(n) !== !1 &&
                        (i._enabledConditions.splice(
                          $.inArray(n, i._enabledConditions),
                          1
                        ),
                        (o = !0));
                  })
                : "string" == typeof n &&
                  (1 === n.length && (n = this.nameByKey(n)),
                  this.conditions(n) !== !1 &&
                    (this._enabledConditions.splice(
                      $.inArray(n, this._enabledConditions),
                      1
                    ),
                    (o = !0))),
                e === !0 && o === !0 && t.structureHash(this._dtSettings, !1);
            },
          },
          {
            key: "getEnabledConditions",
            value: function () {
              return this._enabledConditions.length > 0
                ? $.unique(this._enabledConditions)
                : !1;
            },
          },
          {
            key: "nameByKey",
            value: function (t) {
              return this._keysToCons[t] || !1;
            },
          },
          {
            key: "conditions",
            value: function n(t) {
              var e = this,
                i = this,
                n = {
                  search: {
                    key: "f",
                    event: "search.dt",
                    isInit: function () {
                      return (
                        "undefined" == typeof i._dtSettings.oInit.searching ||
                        i._dtSettings.oInit.searching !== !1
                      );
                    },
                    onLoad: function (t) {
                      "undefined" != typeof t &&
                        i._dtApi.search() !== decodeURIComponent(t) &&
                        (i._dtApi.search(decodeURIComponent(t)),
                        (i._shouldDraw = !0));
                    },
                    isset: function () {
                      return 0 !== i._dtApi.search().length;
                    },
                    newHashVal: function () {
                      return encodeURIComponent(i._dtApi.search());
                    },
                  },
                  length: {
                    key: "l",
                    event: "length.dt",
                    isInit: function () {
                      return !(
                        i._dtSettings.oInit.lengthChange === !1 ||
                        ("undefined" ==
                          typeof i._dtSettings.oInit.lengthChange &&
                          i._dtDefaults.bLengthChange === !1)
                      );
                    },
                    onLoad: function (t) {
                      "undefined" != typeof t &&
                        (i._dtApi.page.len(parseInt(t)), (i._shouldDraw = !0));
                    },
                    isset: function () {
                      return (
                        i._dtApi.page.len() &&
                        i._dtApi.page.len() !==
                          (i._dtSettings.oInit.pageLength ||
                            i._dtDefaults.iDisplayLength)
                      );
                    },
                    newHashVal: function () {
                      return i._dtApi.page.len();
                    },
                  },
                  page: {
                    key: "p",
                    event: "page.dt",
                    isInit: function () {
                      return !(
                        i._dtSettings.oInit.paging === !1 ||
                        ("undefined" == typeof i._dtSettings.oInit.paging &&
                          i._dtDefaults.bPaginate === !1)
                      );
                    },
                    onLoad: function (t) {
                      "undefined" != typeof t &&
                        0 !== parseInt(t) &&
                        (i._dtApi.page(parseInt(t)), (i._shouldDraw = !0));
                    },
                    isset: function () {
                      return (
                        i._dtApi.page.info() && 0 !== i._dtApi.page.info().page
                      );
                    },
                    newHashVal: function () {
                      return i._dtApi.page.info().page;
                    },
                  },
                  colvis: {
                    key: "v",
                    event: "column-visibility.dt",
                    isInit: function () {
                      return !0;
                    },
                    onLoad: function (t) {
                      if ("undefined" != typeof t) {
                        var n = (function () {
                          var n = t.charAt(0),
                            e = t.substring(1).split(".");
                          return "f" !== n && "t" !== n
                            ? (console.warn(
                                "Unknown ColVis condition visibility value, expected t or f, found:",
                                n
                              ),
                              { v: void 0 })
                            : (i._dtApi
                                .columns()
                                .indexes()
                                .each(function (t, o) {
                                  "t" === n
                                    ? -1 === $.inArray(t.toString(), e)
                                      ? i._dtApi.column(t).visible(!1)
                                      : i._dtApi.column(t).visible(!0)
                                    : -1 === $.inArray(t.toString(), e)
                                      ? i._dtApi.column(t).visible(!0)
                                      : i._dtApi.column(t).visible(!1);
                                }),
                              void (i._shouldDraw = !0));
                        })();
                        if (
                          "object" ===
                          ("undefined" == typeof n ? "undefined" : _typeof(n))
                        )
                          return n.v;
                      }
                    },
                    isset: function () {
                      return i._dtApi
                        .columns()
                        .visible()
                        .filter(function (t) {
                          return !t;
                        })
                        .any();
                    },
                    newHashVal: function () {
                      var t = [],
                        n = [];
                      return (
                        i._dtApi
                          .columns()
                          .visible()
                          .each(function (e, i) {
                            e === !0 ? t.push(i) : n.push(i);
                          }),
                        t.length >= n.length
                          ? "f" + n.join(".")
                          : "t" + t.join(".")
                      );
                    },
                  },
                  scroller: {
                    key: "s",
                    event: "draw.dt",
                    isInit: function () {
                      return "undefined" != typeof i._dtSettings.oScroller;
                    },
                    onLoad: function (t) {
                      0 !== parseInt(t) && i._dtApi.row(parseInt(t)).scrollTo();
                    },
                    isset: function () {
                      return (
                        0 !==
                        Math.trunc(
                          parseInt(i._dtSettings.oScroller.s.baseRowTop)
                        )
                      );
                    },
                    newHashVal: function () {
                      var t = Math.trunc(
                        parseInt(i._dtSettings.oScroller.s.baseRowTop)
                      );
                      return 0 !== t ? t : !1;
                    },
                  },
                  colorder: {
                    key: "c",
                    event: "column-reorder.dt",
                    isInit: function () {
                      return "undefined" != typeof i._dtSettings._colReorder;
                    },
                    onLoad: function (t) {
                      var n = t.split("."),
                        e = [];
                      $.each(n, function (t, n) {
                        if (-1 !== n.indexOf("-")) {
                          var i = n.split("-"),
                            o = parseInt(i[0]),
                            s = parseInt(i[1]);
                          if (o > s) for (var a = o; a + 1 > s; a--) e.push(a);
                          else for (var a = o; s > a - 1; a++) e.push(a);
                        } else e.push(n);
                      });
                      var o = e.map(function (t) {
                        return parseInt(t);
                      });
                      return "undefined" == typeof i._dtApi.colReorder
                        ? !1
                        : void (
                            JSON.stringify(o) !==
                              JSON.stringify(i._dtApi.colReorder.order()) &&
                            (i._dtApi.colReorder.order(o, !0),
                            (i._shouldDraw = !0))
                          );
                    },
                    isset: function () {
                      return "undefined" == typeof i._dtApi.colReorder
                        ? !1
                        : JSON.stringify(i._dtApi.colReorder.order()) !==
                            JSON.stringify(
                              i._dtApi.columns().indexes().toArray()
                            );
                    },
                    newHashVal: function () {
                      var t = i._dtApi.colReorder.order(),
                        n = void 0,
                        e = [],
                        o = [],
                        s = function (t) {
                          return o[o.length - t];
                        },
                        a = function () {
                          var t = void 0;
                          return (
                            (t =
                              2 === o.length
                                ? o[0] + "." + o[1]
                                : o[0] + "-" + s(1)),
                            (o = []),
                            t
                          );
                        };
                      return (
                        $.each(t, function (t, i) {
                          (i = parseInt(i)),
                            "undefined" == typeof n
                              ? e.push(i)
                              : o.length > 0
                                ? s(1) > s(2) && i === s(1) + 1
                                  ? o.push(i)
                                  : s(1) < s(2) && i === s(1) - 1
                                    ? o.push(i)
                                    : (e.push(a()), e.push(i))
                                : i === n + 1 || i === n - 1
                                  ? (e.splice(e.length - 1, 1),
                                    o.push(n),
                                    o.push(i))
                                  : e.push(i),
                            (n = i);
                        }),
                        o.length > 0 && e.push(a()),
                        e.join(".")
                      );
                    },
                  },
                  order: {
                    key: "o",
                    event: "order.dt",
                    isInit: function () {
                      var t = !1;
                      return (
                        $.each(e._dtSettings.aoColumns, function (n, e) {
                          return e.bSortable === !0 ? ((t = !0), !1) : void 0;
                        }),
                        t
                      );
                    },
                    onLoad: function (t) {
                      if ("undefined" != typeof t) {
                        var n = { a: "asc", d: "desc" };
                        i._dtApi.order([
                          parseInt(t.substring(1)),
                          n[t.charAt(0)],
                        ]),
                          (i._shouldDraw = !0);
                      }
                    },
                    isset: function () {
                      return (
                        i._dtApi.order()[0] &&
                        JSON.stringify(i._dtApi.order()) !==
                          JSON.stringify($.fn.dataTable.defaults.aaSorting)
                      );
                    },
                    newHashVal: function () {
                      return (
                        i._dtApi.order()[0][1].charAt(0) +
                        i._dtApi.order()[0][0]
                      );
                    },
                  },
                };
              if ("string" == typeof t)
                return "undefined" == typeof n[t] ? !1 : n[t];
              if ($.isArray(t) && t.length > 0) {
                var o = {};
                return (
                  $.each(t, function (t, e) {
                    if ("undefined" == typeof n[e])
                      throw new Error(
                        "Unable to retrieve condition by name: " + e
                      );
                    o[e] = n[e];
                  }),
                  o
                );
              }
              return n;
            },
          },
        ],
        [
          {
            key: "queryString",
            value: function e() {
              for (
                var e = {},
                  t = window.location.hash.substring(1),
                  n = t.split("&"),
                  i = 0;
                i < n.length;
                i++
              ) {
                var o = n[i].split("=");
                "undefined" == typeof e[o[0]]
                  ? (e[o[0]] = o[1])
                  : "string" == typeof e[o[0]]
                    ? (e[o[0]] = [e[o[0]], o[1]])
                    : e[o[0]].push(o[1]);
              }
              return e || !1;
            },
          },
          {
            key: "structureHash",
            value: function (n, e) {
              var i;
              if (!n)
                throw new Error(
                  "Illegal execution of KeepConditions.structureHash()"
                );
              if (n instanceof t) i = n.dtSettings();
              else if (
                "undefined" != typeof n.type &&
                "undefined" != typeof n.data.dtSettings
              )
                i = n.data.dtSettings;
              else if (n instanceof $.fn.dataTable.Api) i = n.settings()[0];
              else if ($.fn.DataTable.isDataTable(n))
                i = new $.fn.dataTable.Api(n).settings()[0];
              else {
                if (
                  !$.isPlainObject(n) ||
                  !_typeof($.isPlainObject(n.oKeepConditions))
                )
                  throw new Error(
                    "Unable to determine what you passed to KeepConditions.structureHash(), should be either an instance of KeepConditions, a proper jQuery event, or a DataTable instance with keepConditions enabled"
                  );
                i = n;
              }
              var o = new $.fn.dataTable.Api(i),
                s = (i.oInit, i.oKeepConditions.getEnabledConditions()),
                a = t.queryString(),
                r = $(o.table().node()).attr("id"),
                d = {},
                u = [],
                c = [];
              if ("undefined" == typeof s || s === !1)
                throw new Error("Couldn't get conditions from table settings");
              $.each(a, function (t, n) {
                (t || n) && t !== r && (d[t] = n || "");
              }),
                $.each(s, function (t, n) {
                  if (i.oKeepConditions.conditions()[n].isset()) {
                    var e = i.oKeepConditions.conditions()[n].newHashVal();
                    "undefined" != typeof e &&
                      e !== !1 &&
                      u.push(i.oKeepConditions.conditions()[n].key + e);
                  }
                }),
                (d[r] = u.join(":")),
                $.each(d, function (t, n) {
                  n.length > 0 && c.push(t + "=" + n);
                });
              var l = c.join("&");
              return e === !0 ? l : void (window.location.hash = l || "_");
            },
          },
        ]
      ),
      t
    );
  })();
!(function (t, n, e, i) {
  e.extend(!0, e.fn.dataTable.defaults, {
    language: {
      keepConditions: {
        button: {
          btnCopyTitle: "URL Copied",
          btnCopyBody:
            "The URL with the DataTables conditions has been copied to your clipboard",
          btnSelectTitle: "Copy URL",
          btnSelectBody: "Copy be below input to easily share the URL",
        },
      },
    },
  }),
    e(n).on("init.dt", function (t, n) {
      "dt" === t.namespace &&
        n.oInit.keepConditions !== i &&
        new KeepConditions(n);
    }),
    e.fn.dataTable.Api.register("keepConditions.attachEvents()", function (t) {
      return this.iterator("table", function (t) {
        return t.oKeepConditions.attachEvents();
      });
    }),
    e.fn.dataTable.Api.register("keepConditions.detachEvents()", function (t) {
      return this.iterator("table", function (t) {
        return t.oKeepConditions.detachEvents();
      });
    }),
    e.fn.dataTable.Api.register("keepConditions.structureHash()", function (t) {
      return this.context[0].oKeepConditions.structureHash(t);
    }),
    e.fn.dataTable.Api.register(
      "keepConditions.enableCondition()",
      function (t, n) {
        return this.iterator("table", function (e) {
          return e.oKeepConditions.enableCondition(t, n);
        });
      }
    ),
    e.fn.dataTable.Api.register(
      "keepConditions.disableCondition()",
      function (t, n) {
        return this.iterator("table", function (e) {
          return e.oKeepConditions.disableCondition(t, n);
        });
      }
    ),
    (e.fn.dataTable.ext.buttons.copyConditions = {
      text: "Copy Conditions",
      action: function (i, o, s, a) {
        var r,
          d = o.settings()[0].oLanguage.keepConditions,
          u = o.settings()[0].oKeepConditions.structureHash(!0),
          c =
            n.location.protocol +
            "//" +
            n.location.host +
            (n.location.port.length ? ":" + n.location.port : "") +
            n.location.pathname +
            "#" +
            u,
          l = {
            btnNoHashTitle: d.btnNoHashTitle || "No Conditions",
            btnNoHashBody:
              d.btnNoHashBody || "Thre are no conditions to be copied",
            btnCopyTitle: d.btnCopyTitle || "URL Copied",
            btnCopyBody:
              d.btnCopyBody ||
              "The URL with the DataTables conditions has been copied to your clipboard",
            btnSelectTitle: d.btnSelectTitle || "Copy URL",
            btnSelectBody:
              d.btnSelectBody || "Copy be below input to easily share the URL",
          };
        if (!u)
          return void o.buttons.info(l.btnNoHashTitle, l.btnNoHashBody, 3e3);
        e("<input />")
          .val(c)
          .attr("id", "copyConditions-text")
          .css({
            position: "absolute",
            left: "-9999px",
            top: (t.pageYOffset || n.documentElement.scrollTop) + "px",
          })
          .appendTo("body"),
          e("#copyConditions-text").select();
        try {
          n.execCommand("copy"),
            o.buttons.info(l.btnCopyTitle, l.btnCopyBody, a.copyTimeout || 4e3),
            (r = !0);
        } catch (f) {
          o.buttons.info(
            l.btnSelectTitle,
            l.btnSelectBody +
              '<br><input id="keepConditions-input" value="' +
              c +
              '" style="width:90%;">',
            a.selectTimeout || 1e4
          ),
            e("input#keepConditions-input").select();
        } finally {
          e("#copyConditions-text").remove();
        }
      },
    });
})(window, document, jQuery);

// hmv-script.js
function copyURLToClipButton() {
  var a = document.createElement("textarea");
  document.body.appendChild(a);
  a.value = window.location.href;
  a.value = a.value
    .replace(/^.*\/books\//, "https://hadithmv.github.io/books/")
    .replace(/^.*\/uc\//, "https://hadithmv.github.io/books/");
  a.select();
  document.execCommand("copy");
  document.body.removeChild(a);
}
function scrollUpTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function filiString() {
  var a = document.getElementById("toggleFiliButton");
  "&nbsp; ފިލިތައް ފޮރުވާ &nbsp;" === a.innerHTML.trim()
    ? (a.innerHTML = "&nbsp; ފިލިތައް ދައްކާ &nbsp;")
    : (a.innerHTML = "&nbsp; ފިލިތައް ފޮރުވާ &nbsp;");
}
function changeBook(a) {
  window.location = window.location
    .toString()
    .replace(
      /quranHmv|quranBakurube|quranJaufar|quranSoabuni|quranRasmee|quranMuyassarGhareeb|quranMukhtasar|quranMuyassar|quranSadi|quranBetaqat|quranQiraaath/g,
      a
    )
    .replace(/:v.*$/, "");
}
