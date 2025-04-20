// jquery.js
((e, t) => {
  "object" == typeof module && "object" == typeof module.exports
    ? (module.exports = e.document
        ? t(e, !0)
        : function (e) {
            if (e.document) return t(e);
            throw new Error("jQuery requires a window with a document");
          })
    : t(e);
})("undefined" != typeof window ? window : this, function (w, M) {
  function v(e) {
    return (
      "function" == typeof e &&
      "number" != typeof e.nodeType &&
      "function" != typeof e.item
    );
  }
  function R(e) {
    return null != e && e === e.window;
  }
  var t = [],
    I = Object.getPrototypeOf,
    a = t.slice,
    W = t.flat
      ? function (e) {
          return t.flat.call(e);
        }
      : function (e) {
          return t.concat.apply([], e);
        },
    F = t.push,
    x = t.indexOf,
    $ = {},
    B = $.toString,
    _ = $.hasOwnProperty,
    z = _.toString,
    X = z.call(Object),
    g = {},
    T = w.document,
    U = { type: !0, src: !0, nonce: !0, noModule: !0 };
  function V(e, t, n) {
    var r,
      i,
      o = (n = n || T).createElement("script");
    if (((o.text = e), t))
      for (r in U)
        (i = t[r] || (t.getAttribute && t.getAttribute(r))) &&
          o.setAttribute(r, i);
    n.head.appendChild(o).parentNode.removeChild(o);
  }
  function G(e) {
    return null == e
      ? e + ""
      : "object" == typeof e || "function" == typeof e
      ? $[B.call(e)] || "object"
      : typeof e;
  }
  var e = "3.7.1",
    Y = /HTML$/i,
    C = function (e, t) {
      return new C.fn.init(e, t);
    };
  function Q(e) {
    var t = !!e && "length" in e && e.length,
      n = G(e);
    return (
      !v(e) &&
      !R(e) &&
      ("array" === n ||
        0 === t ||
        ("number" == typeof t && 0 < t && t - 1 in e))
    );
  }
  function b(e, t) {
    return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase();
  }
  (C.fn = C.prototype =
    {
      jquery: e,
      constructor: C,
      length: 0,
      toArray: function () {
        return a.call(this);
      },
      get: function (e) {
        return null == e
          ? a.call(this)
          : e < 0
          ? this[e + this.length]
          : this[e];
      },
      pushStack: function (e) {
        e = C.merge(this.constructor(), e);
        return (e.prevObject = this), e;
      },
      each: function (e) {
        return C.each(this, e);
      },
      map: function (n) {
        return this.pushStack(
          C.map(this, function (e, t) {
            return n.call(e, t, e);
          })
        );
      },
      slice: function () {
        return this.pushStack(a.apply(this, arguments));
      },
      first: function () {
        return this.eq(0);
      },
      last: function () {
        return this.eq(-1);
      },
      even: function () {
        return this.pushStack(
          C.grep(this, function (e, t) {
            return (t + 1) % 2;
          })
        );
      },
      odd: function () {
        return this.pushStack(
          C.grep(this, function (e, t) {
            return t % 2;
          })
        );
      },
      eq: function (e) {
        var t = this.length,
          e = +e + (e < 0 ? t : 0);
        return this.pushStack(0 <= e && e < t ? [this[e]] : []);
      },
      end: function () {
        return this.prevObject || this.constructor();
      },
      push: F,
      sort: t.sort,
      splice: t.splice,
    }),
    (C.extend = C.fn.extend =
      function () {
        var e,
          t,
          n,
          r,
          i,
          o = arguments[0] || {},
          s = 1,
          a = arguments.length,
          u = !1;
        for (
          "boolean" == typeof o && ((u = o), (o = arguments[s] || {}), s++),
            "object" == typeof o || v(o) || (o = {}),
            s === a && ((o = this), s--);
          s < a;
          s++
        )
          if (null != (e = arguments[s]))
            for (t in e)
              (n = e[t]),
                "__proto__" !== t &&
                  o !== n &&
                  (u && n && (C.isPlainObject(n) || (r = Array.isArray(n)))
                    ? ((i = o[t]),
                      (i =
                        r && !Array.isArray(i)
                          ? []
                          : r || C.isPlainObject(i)
                          ? i
                          : {}),
                      (r = !1),
                      (o[t] = C.extend(u, i, n)))
                    : void 0 !== n && (o[t] = n));
        return o;
      }),
    C.extend({
      expando: "jQuery" + (e + Math.random()).replace(/\D/g, ""),
      isReady: !0,
      error: function (e) {
        throw new Error(e);
      },
      noop: function () {},
      isPlainObject: function (e) {
        return !(
          !e ||
          "[object Object]" !== B.call(e) ||
          ((e = I(e)) &&
            ("function" !=
              typeof (e = _.call(e, "constructor") && e.constructor) ||
              z.call(e) !== X))
        );
      },
      isEmptyObject: function (e) {
        for (var t in e) return !1;
        return !0;
      },
      globalEval: function (e, t, n) {
        V(e, { nonce: t && t.nonce }, n);
      },
      each: function (e, t) {
        var n,
          r = 0;
        if (Q(e))
          for (n = e.length; r < n && !1 !== t.call(e[r], r, e[r]); r++);
        else for (r in e) if (!1 === t.call(e[r], r, e[r])) break;
        return e;
      },
      text: function (e) {
        var t,
          n = "",
          r = 0,
          i = e.nodeType;
        if (!i) for (; (t = e[r++]); ) n += C.text(t);
        return 1 === i || 11 === i
          ? e.textContent
          : 9 === i
          ? e.documentElement.textContent
          : 3 === i || 4 === i
          ? e.nodeValue
          : n;
      },
      makeArray: function (e, t) {
        t = t || [];
        return (
          null != e &&
            (Q(Object(e))
              ? C.merge(t, "string" == typeof e ? [e] : e)
              : F.call(t, e)),
          t
        );
      },
      inArray: function (e, t, n) {
        return null == t ? -1 : x.call(t, e, n);
      },
      isXMLDoc: function (e) {
        var t = e && e.namespaceURI,
          e = e && (e.ownerDocument || e).documentElement;
        return !Y.test(t || (e && e.nodeName) || "HTML");
      },
      merge: function (e, t) {
        for (var n = +t.length, r = 0, i = e.length; r < n; r++) e[i++] = t[r];
        return (e.length = i), e;
      },
      grep: function (e, t, n) {
        for (var r = [], i = 0, o = e.length, s = !n; i < o; i++)
          !t(e[i], i) != s && r.push(e[i]);
        return r;
      },
      map: function (e, t, n) {
        var r,
          i,
          o = 0,
          s = [];
        if (Q(e))
          for (r = e.length; o < r; o++)
            null != (i = t(e[o], o, n)) && s.push(i);
        else for (o in e) null != (i = t(e[o], o, n)) && s.push(i);
        return W(s);
      },
      guid: 1,
      support: g,
    }),
    "function" == typeof Symbol && (C.fn[Symbol.iterator] = t[Symbol.iterator]),
    C.each(
      "Boolean Number String Function Array Date RegExp Object Error Symbol".split(
        " "
      ),
      function (e, t) {
        $["[object " + t + "]"] = t.toLowerCase();
      }
    );
  var J = t.pop,
    K = t.sort,
    Z = t.splice,
    n = "[\\x20\\t\\r\\n\\f]",
    ee = new RegExp("^" + n + "+|((?:^|[^\\\\])(?:\\\\.)*)" + n + "+$", "g"),
    te =
      ((C.contains = function (e, t) {
        t = t && t.parentNode;
        return (
          e === t ||
          !(
            !t ||
            1 !== t.nodeType ||
            !(e.contains
              ? e.contains(t)
              : e.compareDocumentPosition && 16 & e.compareDocumentPosition(t))
          )
        );
      }),
      /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g);
  function ne(e, t) {
    return t
      ? "\0" === e
        ? "�"
        : e.slice(0, -1) + "\\" + e.charCodeAt(e.length - 1).toString(16) + " "
      : "\\" + e;
  }
  C.escapeSelector = function (e) {
    return (e + "").replace(te, ne);
  };
  var re,
    S,
    ie,
    oe,
    se,
    E,
    r,
    k,
    p,
    ae,
    i = T,
    ue = F,
    j = ue,
    A = C.expando,
    D = 0,
    le = 0,
    ce = De(),
    fe = De(),
    pe = De(),
    de = De(),
    he = function (e, t) {
      return e === t && (se = !0), 0;
    },
    ge =
      "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
    e =
      "(?:\\\\[\\da-fA-F]{1,6}" + n + "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",
    o =
      "\\[" +
      n +
      "*(" +
      e +
      ")(?:" +
      n +
      "*([*^$|!~]?=)" +
      n +
      "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" +
      e +
      "))|)" +
      n +
      "*\\]",
    s =
      ":(" +
      e +
      ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" +
      o +
      ")*)|.*)\\)|)",
    ye = new RegExp(n + "+", "g"),
    me = new RegExp("^" + n + "*," + n + "*"),
    ve = new RegExp("^" + n + "*([>+~]|" + n + ")" + n + "*"),
    xe = new RegExp(n + "|>"),
    be = new RegExp(s),
    we = new RegExp("^" + e + "$"),
    Te = {
      ID: new RegExp("^#(" + e + ")"),
      CLASS: new RegExp("^\\.(" + e + ")"),
      TAG: new RegExp("^(" + e + "|[*])"),
      ATTR: new RegExp("^" + o),
      PSEUDO: new RegExp("^" + s),
      CHILD: new RegExp(
        "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
          n +
          "*(even|odd|(([+-]|)(\\d*)n|)" +
          n +
          "*(?:([+-]|)" +
          n +
          "*(\\d+)|))" +
          n +
          "*\\)|)",
        "i"
      ),
      bool: new RegExp("^(?:" + ge + ")$", "i"),
      needsContext: new RegExp(
        "^" +
          n +
          "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
          n +
          "*((?:-\\d)?\\d*)" +
          n +
          "*\\)|)(?=[^-]|$)",
        "i"
      ),
    },
    Ce = /^(?:input|select|textarea|button)$/i,
    Se = /^h\d$/i,
    Ee = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
    ke = /[+~]/,
    f = new RegExp("\\\\[\\da-fA-F]{1,6}" + n + "?|\\\\([^\\r\\n\\f])", "g"),
    d = function (e, t) {
      e = "0x" + e.slice(1) - 65536;
      return (
        t ||
        (e < 0
          ? String.fromCharCode(65536 + e)
          : String.fromCharCode((e >> 10) | 55296, (1023 & e) | 56320))
      );
    },
    je = function () {
      Oe();
    },
    Ae = Ie(
      function (e) {
        return !0 === e.disabled && b(e, "fieldset");
      },
      { dir: "parentNode", next: "legend" }
    );
  try {
    j.apply((t = a.call(i.childNodes)), i.childNodes),
      t[i.childNodes.length].nodeType;
  } catch (e) {
    j = {
      apply: function (e, t) {
        ue.apply(e, a.call(t));
      },
      call: function (e) {
        ue.apply(e, a.call(arguments, 1));
      },
    };
  }
  function N(t, e, n, r) {
    var i,
      o,
      s,
      a,
      u,
      l,
      c = e && e.ownerDocument,
      f = e ? e.nodeType : 9;
    if (
      ((n = n || []),
      "string" != typeof t || !t || (1 !== f && 9 !== f && 11 !== f))
    )
      return n;
    if (!r && (Oe(e), (e = e || E), k)) {
      if (11 !== f && (a = Ee.exec(t)))
        if ((i = a[1])) {
          if (9 === f) {
            if (!(l = e.getElementById(i))) return n;
            if (l.id === i) return j.call(n, l), n;
          } else if (
            c &&
            (l = c.getElementById(i)) &&
            N.contains(e, l) &&
            l.id === i
          )
            return j.call(n, l), n;
        } else {
          if (a[2]) return j.apply(n, e.getElementsByTagName(t)), n;
          if ((i = a[3]) && e.getElementsByClassName)
            return j.apply(n, e.getElementsByClassName(i)), n;
        }
      if (!(de[t + " "] || (p && p.test(t)))) {
        if (((l = t), (c = e), 1 === f && (xe.test(t) || ve.test(t)))) {
          for (
            ((c = (ke.test(t) && He(e.parentNode)) || e) == e && g.scope) ||
              ((s = e.getAttribute("id"))
                ? (s = C.escapeSelector(s))
                : e.setAttribute("id", (s = A))),
              o = (u = Me(t)).length;
            o--;

          )
            u[o] = (s ? "#" + s : ":scope") + " " + Re(u[o]);
          l = u.join(",");
        }
        try {
          return j.apply(n, c.querySelectorAll(l)), n;
        } catch (e) {
          de(t, !0);
        } finally {
          s === A && e.removeAttribute("id");
        }
      }
    }
    return ze(t.replace(ee, "$1"), e, n, r);
  }
  function De() {
    var n = [];
    function r(e, t) {
      return (
        n.push(e + " ") > S.cacheLength && delete r[n.shift()], (r[e + " "] = t)
      );
    }
    return r;
  }
  function u(e) {
    return (e[A] = !0), e;
  }
  function Ne(e) {
    var t = E.createElement("fieldset");
    try {
      return !!e(t);
    } catch (e) {
      return !1;
    } finally {
      t.parentNode && t.parentNode.removeChild(t);
    }
  }
  function qe(t) {
    return function (e) {
      return "form" in e
        ? e.parentNode && !1 === e.disabled
          ? "label" in e
            ? "label" in e.parentNode
              ? e.parentNode.disabled === t
              : e.disabled === t
            : e.isDisabled === t || (e.isDisabled !== !t && Ae(e) === t)
          : e.disabled === t
        : "label" in e && e.disabled === t;
    };
  }
  function Le(s) {
    return u(function (o) {
      return (
        (o = +o),
        u(function (e, t) {
          for (var n, r = s([], e.length, o), i = r.length; i--; )
            e[(n = r[i])] && (e[n] = !(t[n] = e[n]));
        })
      );
    });
  }
  function He(e) {
    return e && void 0 !== e.getElementsByTagName && e;
  }
  function Oe(e) {
    var e = e ? e.ownerDocument || e : i;
    return (
      e != E &&
        9 === e.nodeType &&
        e.documentElement &&
        ((r = (E = e).documentElement),
        (k = !C.isXMLDoc(E)),
        (ae = r.matches || r.webkitMatchesSelector || r.msMatchesSelector),
        r.msMatchesSelector &&
          i != E &&
          (e = E.defaultView) &&
          e.top !== e &&
          e.addEventListener("unload", je),
        (g.getById = Ne(function (e) {
          return (
            (r.appendChild(e).id = C.expando),
            !E.getElementsByName || !E.getElementsByName(C.expando).length
          );
        })),
        (g.disconnectedMatch = Ne(function (e) {
          return ae.call(e, "*");
        })),
        (g.scope = Ne(function () {
          return E.querySelectorAll(":scope");
        })),
        (g.cssHas = Ne(function () {
          try {
            E.querySelector(":has(*,:jqfake)");
          } catch (e) {
            return 1;
          }
        })),
        g.getById
          ? ((S.filter.ID = function (e) {
              var t = e.replace(f, d);
              return function (e) {
                return e.getAttribute("id") === t;
              };
            }),
            (S.find.ID = function (e, t) {
              if (void 0 !== t.getElementById && k)
                return (t = t.getElementById(e)) ? [t] : [];
            }))
          : ((S.filter.ID = function (e) {
              var t = e.replace(f, d);
              return function (e) {
                e = void 0 !== e.getAttributeNode && e.getAttributeNode("id");
                return e && e.value === t;
              };
            }),
            (S.find.ID = function (e, t) {
              if (void 0 !== t.getElementById && k) {
                var n,
                  r,
                  i,
                  o = t.getElementById(e);
                if (o) {
                  if ((n = o.getAttributeNode("id")) && n.value === e)
                    return [o];
                  for (i = t.getElementsByName(e), r = 0; (o = i[r++]); )
                    if ((n = o.getAttributeNode("id")) && n.value === e)
                      return [o];
                }
                return [];
              }
            })),
        (S.find.TAG = function (e, t) {
          return void 0 !== t.getElementsByTagName
            ? t.getElementsByTagName(e)
            : t.querySelectorAll(e);
        }),
        (S.find.CLASS = function (e, t) {
          if (void 0 !== t.getElementsByClassName && k)
            return t.getElementsByClassName(e);
        }),
        (p = []),
        Ne(function (e) {
          var t;
          (r.appendChild(e).innerHTML =
            "<a id='" +
            A +
            "' href='' disabled='disabled'></a><select id='" +
            A +
            "-\r\\' disabled='disabled'><option selected=''></option></select>"),
            e.querySelectorAll("[selected]").length ||
              p.push("\\[" + n + "*(?:value|" + ge + ")"),
            e.querySelectorAll("[id~=" + A + "-]").length || p.push("~="),
            e.querySelectorAll("a#" + A + "+*").length || p.push(".#.+[+~]"),
            e.querySelectorAll(":checked").length || p.push(":checked"),
            (t = E.createElement("input")).setAttribute("type", "hidden"),
            e.appendChild(t).setAttribute("name", "D"),
            (r.appendChild(e).disabled = !0),
            2 !== e.querySelectorAll(":disabled").length &&
              p.push(":enabled", ":disabled"),
            (t = E.createElement("input")).setAttribute("name", ""),
            e.appendChild(t),
            e.querySelectorAll("[name='']").length ||
              p.push("\\[" + n + "*name" + n + "*=" + n + "*(?:''|\"\")");
        }),
        g.cssHas || p.push(":has"),
        (p = p.length && new RegExp(p.join("|"))),
        (he = function (e, t) {
          var n;
          return e === t
            ? ((se = !0), 0)
            : (n = !e.compareDocumentPosition - !t.compareDocumentPosition) ||
                (1 &
                  (n =
                    (e.ownerDocument || e) == (t.ownerDocument || t)
                      ? e.compareDocumentPosition(t)
                      : 1) ||
                (!g.sortDetached && t.compareDocumentPosition(e) === n)
                  ? e === E || (e.ownerDocument == i && N.contains(i, e))
                    ? -1
                    : t === E || (t.ownerDocument == i && N.contains(i, t))
                    ? 1
                    : oe
                    ? x.call(oe, e) - x.call(oe, t)
                    : 0
                  : 4 & n
                  ? -1
                  : 1);
        })),
      E
    );
  }
  for (re in ((N.matches = function (e, t) {
    return N(e, null, null, t);
  }),
  (N.matchesSelector = function (e, t) {
    if ((Oe(e), k && !de[t + " "] && (!p || !p.test(t))))
      try {
        var n = ae.call(e, t);
        if (
          n ||
          g.disconnectedMatch ||
          (e.document && 11 !== e.document.nodeType)
        )
          return n;
      } catch (e) {
        de(t, !0);
      }
    return 0 < N(t, E, null, [e]).length;
  }),
  (N.contains = function (e, t) {
    return (e.ownerDocument || e) != E && Oe(e), C.contains(e, t);
  }),
  (N.attr = function (e, t) {
    (e.ownerDocument || e) != E && Oe(e);
    var n = S.attrHandle[t.toLowerCase()],
      n = n && _.call(S.attrHandle, t.toLowerCase()) ? n(e, t, !k) : void 0;
    return void 0 !== n ? n : e.getAttribute(t);
  }),
  (N.error = function (e) {
    throw new Error("Syntax error, unrecognized expression: " + e);
  }),
  (C.uniqueSort = function (e) {
    var t,
      n = [],
      r = 0,
      i = 0;
    if (
      ((se = !g.sortStable),
      (oe = !g.sortStable && a.call(e, 0)),
      K.call(e, he),
      se)
    ) {
      for (; (t = e[i++]); ) t === e[i] && (r = n.push(i));
      for (; r--; ) Z.call(e, n[r], 1);
    }
    return (oe = null), e;
  }),
  (C.fn.uniqueSort = function () {
    return this.pushStack(C.uniqueSort(a.apply(this)));
  }),
  ((S = C.expr =
    {
      cacheLength: 50,
      createPseudo: u,
      match: Te,
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
            (e[1] = e[1].replace(f, d)),
            (e[3] = (e[3] || e[4] || e[5] || "").replace(f, d)),
            "~=" === e[2] && (e[3] = " " + e[3] + " "),
            e.slice(0, 4)
          );
        },
        CHILD: function (e) {
          return (
            (e[1] = e[1].toLowerCase()),
            "nth" === e[1].slice(0, 3)
              ? (e[3] || N.error(e[0]),
                (e[4] = +(e[4]
                  ? e[5] + (e[6] || 1)
                  : 2 * ("even" === e[3] || "odd" === e[3]))),
                (e[5] = +(e[7] + e[8] || "odd" === e[3])))
              : e[3] && N.error(e[0]),
            e
          );
        },
        PSEUDO: function (e) {
          var t,
            n = !e[6] && e[2];
          return Te.CHILD.test(e[0])
            ? null
            : (e[3]
                ? (e[2] = e[4] || e[5] || "")
                : n &&
                  be.test(n) &&
                  (t =
                    (t = Me(n, !0)) &&
                    n.indexOf(")", n.length - t) - n.length) &&
                  ((e[0] = e[0].slice(0, t)), (e[2] = n.slice(0, t))),
              e.slice(0, 3));
        },
      },
      filter: {
        TAG: function (e) {
          var t = e.replace(f, d).toLowerCase();
          return "*" === e
            ? function () {
                return !0;
              }
            : function (e) {
                return b(e, t);
              };
        },
        CLASS: function (e) {
          var t = ce[e + " "];
          return (
            t ||
            ((t = new RegExp("(^|" + n + ")" + e + "(" + n + "|$)")) &&
              ce(e, function (e) {
                return t.test(
                  ("string" == typeof e.className && e.className) ||
                    (void 0 !== e.getAttribute && e.getAttribute("class")) ||
                    ""
                );
              }))
          );
        },
        ATTR: function (t, n, r) {
          return function (e) {
            e = N.attr(e, t);
            return null == e
              ? "!=" === n
              : !n ||
                  ((e += ""),
                  "=" === n
                    ? e === r
                    : "!=" === n
                    ? e !== r
                    : "^=" === n
                    ? r && 0 === e.indexOf(r)
                    : "*=" === n
                    ? r && -1 < e.indexOf(r)
                    : "$=" === n
                    ? r && e.slice(-r.length) === r
                    : "~=" === n
                    ? -1 < (" " + e.replace(ye, " ") + " ").indexOf(r)
                    : "|=" === n &&
                      (e === r || e.slice(0, r.length + 1) === r + "-"));
          };
        },
        CHILD: function (d, e, t, h, g) {
          var y = "nth" !== d.slice(0, 3),
            m = "last" !== d.slice(-4),
            v = "of-type" === e;
          return 1 === h && 0 === g
            ? function (e) {
                return !!e.parentNode;
              }
            : function (e, t, n) {
                var r,
                  i,
                  o,
                  s,
                  a,
                  u = y != m ? "nextSibling" : "previousSibling",
                  l = e.parentNode,
                  c = v && e.nodeName.toLowerCase(),
                  f = !n && !v,
                  p = !1;
                if (l) {
                  if (y) {
                    for (; u; ) {
                      for (o = e; (o = o[u]); )
                        if (v ? b(o, c) : 1 === o.nodeType) return !1;
                      a = u = "only" === d && !a && "nextSibling";
                    }
                    return !0;
                  }
                  if (((a = [m ? l.firstChild : l.lastChild]), m && f)) {
                    for (
                      p =
                        (s =
                          (r = (i = l[A] || (l[A] = {}))[d] || [])[0] === D &&
                          r[1]) && r[2],
                        o = s && l.childNodes[s];
                      (o = (++s && o && o[u]) || ((p = s = 0), a.pop()));

                    )
                      if (1 === o.nodeType && ++p && o === e) {
                        i[d] = [D, s, p];
                        break;
                      }
                  } else if (
                    !1 ===
                    (p = f
                      ? (s =
                          (r = (i = e[A] || (e[A] = {}))[d] || [])[0] === D &&
                          r[1])
                      : p)
                  )
                    for (
                      ;
                      (o = (++s && o && o[u]) || ((p = s = 0), a.pop())) &&
                      ((v ? !b(o, c) : 1 !== o.nodeType) ||
                        !++p ||
                        (f && ((i = o[A] || (o[A] = {}))[d] = [D, p]),
                        o !== e));

                    );
                  return (p -= g) === h || (p % h == 0 && 0 <= p / h);
                }
              };
        },
        PSEUDO: function (e, o) {
          var t,
            s =
              S.pseudos[e] ||
              S.setFilters[e.toLowerCase()] ||
              N.error("unsupported pseudo: " + e);
          return s[A]
            ? s(o)
            : 1 < s.length
            ? ((t = [e, e, "", o]),
              S.setFilters.hasOwnProperty(e.toLowerCase())
                ? u(function (e, t) {
                    for (var n, r = s(e, o), i = r.length; i--; )
                      e[(n = x.call(e, r[i]))] = !(t[n] = r[i]);
                  })
                : function (e) {
                    return s(e, 0, t);
                  })
            : s;
        },
      },
      pseudos: {
        not: u(function (e) {
          var r = [],
            i = [],
            a = _e(e.replace(ee, "$1"));
          return a[A]
            ? u(function (e, t, n, r) {
                for (var i, o = a(e, null, r, []), s = e.length; s--; )
                  (i = o[s]) && (e[s] = !(t[s] = i));
              })
            : function (e, t, n) {
                return (r[0] = e), a(r, null, n, i), (r[0] = null), !i.pop();
              };
        }),
        has: u(function (t) {
          return function (e) {
            return 0 < N(t, e).length;
          };
        }),
        contains: u(function (t) {
          return (
            (t = t.replace(f, d)),
            function (e) {
              return -1 < (e.textContent || C.text(e)).indexOf(t);
            }
          );
        }),
        lang: u(function (n) {
          return (
            we.test(n || "") || N.error("unsupported lang: " + n),
            (n = n.replace(f, d).toLowerCase()),
            function (e) {
              var t;
              do {
                if (
                  (t = k
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
          var t = w.location && w.location.hash;
          return t && t.slice(1) === e.id;
        },
        root: function (e) {
          return e === r;
        },
        focus: function (e) {
          return (
            e ===
              (() => {
                try {
                  return E.activeElement;
                } catch (e) {}
              })() &&
            E.hasFocus() &&
            !!(e.type || e.href || ~e.tabIndex)
          );
        },
        enabled: qe(!1),
        disabled: qe(!0),
        checked: function (e) {
          return (
            (b(e, "input") && !!e.checked) || (b(e, "option") && !!e.selected)
          );
        },
        selected: function (e) {
          return e.parentNode && e.parentNode.selectedIndex, !0 === e.selected;
        },
        empty: function (e) {
          for (e = e.firstChild; e; e = e.nextSibling)
            if (e.nodeType < 6) return !1;
          return !0;
        },
        parent: function (e) {
          return !S.pseudos.empty(e);
        },
        header: function (e) {
          return Se.test(e.nodeName);
        },
        input: function (e) {
          return Ce.test(e.nodeName);
        },
        button: function (e) {
          return (b(e, "input") && "button" === e.type) || b(e, "button");
        },
        text: function (e) {
          return (
            b(e, "input") &&
            "text" === e.type &&
            (null == (e = e.getAttribute("type")) || "text" === e.toLowerCase())
          );
        },
        first: Le(function () {
          return [0];
        }),
        last: Le(function (e, t) {
          return [t - 1];
        }),
        eq: Le(function (e, t, n) {
          return [n < 0 ? n + t : n];
        }),
        even: Le(function (e, t) {
          for (var n = 0; n < t; n += 2) e.push(n);
          return e;
        }),
        odd: Le(function (e, t) {
          for (var n = 1; n < t; n += 2) e.push(n);
          return e;
        }),
        lt: Le(function (e, t, n) {
          for (var r = n < 0 ? n + t : t < n ? t : n; 0 <= --r; ) e.push(r);
          return e;
        }),
        gt: Le(function (e, t, n) {
          for (var r = n < 0 ? n + t : n; ++r < t; ) e.push(r);
          return e;
        }),
      },
    }).pseudos.nth = S.pseudos.eq),
  { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 }))
    S.pseudos[re] = ((t) =>
      function (e) {
        return b(e, "input") && e.type === t;
      })(re);
  for (re in { submit: !0, reset: !0 })
    S.pseudos[re] = ((t) =>
      function (e) {
        return (b(e, "input") || b(e, "button")) && e.type === t;
      })(re);
  function Pe() {}
  function Me(e, t) {
    var n,
      r,
      i,
      o,
      s,
      a,
      u,
      l = fe[e + " "];
    if (l) return t ? 0 : l.slice(0);
    for (s = e, a = [], u = S.preFilter; s; ) {
      for (o in ((n && !(r = me.exec(s))) ||
        (r && (s = s.slice(r[0].length) || s), a.push((i = []))),
      (n = !1),
      (r = ve.exec(s)) &&
        ((n = r.shift()),
        i.push({ value: n, type: r[0].replace(ee, " ") }),
        (s = s.slice(n.length))),
      S.filter))
        !(r = Te[o].exec(s)) ||
          (u[o] && !(r = u[o](r))) ||
          ((n = r.shift()),
          i.push({ value: n, type: o, matches: r }),
          (s = s.slice(n.length)));
      if (!n) break;
    }
    return t ? s.length : s ? N.error(e) : fe(e, a).slice(0);
  }
  function Re(e) {
    for (var t = 0, n = e.length, r = ""; t < n; t++) r += e[t].value;
    return r;
  }
  function Ie(s, e, t) {
    var a = e.dir,
      u = e.next,
      l = u || a,
      c = t && "parentNode" === l,
      f = le++;
    return e.first
      ? function (e, t, n) {
          for (; (e = e[a]); ) if (1 === e.nodeType || c) return s(e, t, n);
          return !1;
        }
      : function (e, t, n) {
          var r,
            i,
            o = [D, f];
          if (n) {
            for (; (e = e[a]); )
              if ((1 === e.nodeType || c) && s(e, t, n)) return !0;
          } else
            for (; (e = e[a]); )
              if (1 === e.nodeType || c)
                if (((i = e[A] || (e[A] = {})), u && b(e, u))) e = e[a] || e;
                else {
                  if ((r = i[l]) && r[0] === D && r[1] === f)
                    return (o[2] = r[2]);
                  if (((i[l] = o)[2] = s(e, t, n))) return !0;
                }
          return !1;
        };
  }
  function We(i) {
    return 1 < i.length
      ? function (e, t, n) {
          for (var r = i.length; r--; ) if (!i[r](e, t, n)) return !1;
          return !0;
        }
      : i[0];
  }
  function Fe(e, t, n, r, i) {
    for (var o, s = [], a = 0, u = e.length, l = null != t; a < u; a++)
      !(o = e[a]) || (n && !n(o, r, i)) || (s.push(o), l && t.push(a));
    return s;
  }
  function $e(d, h, g, y, m, e) {
    return (
      y && !y[A] && (y = $e(y)),
      m && !m[A] && (m = $e(m, e)),
      u(function (e, t, n, r) {
        var i,
          o,
          s,
          a,
          u = [],
          l = [],
          c = t.length,
          f =
            e ||
            ((e, t, n) => {
              for (var r = 0, i = t.length; r < i; r++) N(e, t[r], n);
              return n;
            })(h || "*", n.nodeType ? [n] : n, []),
          p = !d || (!e && h) ? f : Fe(f, u, d, n, r);
        if ((g ? g(p, (a = m || (e ? d : c || y) ? [] : t), n, r) : (a = p), y))
          for (i = Fe(a, l), y(i, [], n, r), o = i.length; o--; )
            (s = i[o]) && (a[l[o]] = !(p[l[o]] = s));
        if (e) {
          if (m || d) {
            if (m) {
              for (i = [], o = a.length; o--; )
                (s = a[o]) && i.push((p[o] = s));
              m(null, (a = []), i, r);
            }
            for (o = a.length; o--; )
              (s = a[o]) &&
                -1 < (i = m ? x.call(e, s) : u[o]) &&
                (e[i] = !(t[i] = s));
          }
        } else (a = Fe(a === t ? a.splice(c, a.length) : a)), m ? m(null, t, a, r) : j.apply(t, a);
      })
    );
  }
  function Be(y, m) {
    function e(e, t, n, r, i) {
      var o,
        s,
        a,
        u = 0,
        l = "0",
        c = e && [],
        f = [],
        p = ie,
        d = e || (x && S.find.TAG("*", i)),
        h = (D += null == p ? 1 : Math.random() || 0.1),
        g = d.length;
      for (i && (ie = t == E || t || i); l !== g && null != (o = d[l]); l++) {
        if (x && o) {
          for (
            s = 0, t || o.ownerDocument == E || (Oe(o), (n = !k));
            (a = y[s++]);

          )
            if (a(o, t || E, n)) {
              j.call(r, o);
              break;
            }
          i && (D = h);
        }
        v && ((o = !a && o) && u--, e) && c.push(o);
      }
      if (((u += l), v && l !== u)) {
        for (s = 0; (a = m[s++]); ) a(c, f, t, n);
        if (e) {
          if (0 < u) for (; l--; ) c[l] || f[l] || (f[l] = J.call(r));
          f = Fe(f);
        }
        j.apply(r, f),
          i && !e && 0 < f.length && 1 < u + m.length && C.uniqueSort(r);
      }
      return i && ((D = h), (ie = p)), c;
    }
    var v = 0 < m.length,
      x = 0 < y.length;
    return v ? u(e) : e;
  }
  function _e(e, t) {
    var n,
      r = [],
      i = [],
      o = pe[e + " "];
    if (!o) {
      for (n = (t = t || Me(e)).length; n--; )
        ((o = (function e(t) {
          for (
            var r,
              n,
              i,
              o = t.length,
              s = S.relative[t[0].type],
              a = s || S.relative[" "],
              u = s ? 1 : 0,
              l = Ie(
                function (e) {
                  return e === r;
                },
                a,
                !0
              ),
              c = Ie(
                function (e) {
                  return -1 < x.call(r, e);
                },
                a,
                !0
              ),
              f = [
                function (e, t, n) {
                  return (
                    (e =
                      (!s && (n || t != ie)) ||
                      ((r = t).nodeType ? l : c)(e, t, n)),
                    (r = null),
                    e
                  );
                },
              ];
            u < o;
            u++
          )
            if ((n = S.relative[t[u].type])) f = [Ie(We(f), n)];
            else {
              if ((n = S.filter[t[u].type].apply(null, t[u].matches))[A]) {
                for (i = ++u; i < o && !S.relative[t[i].type]; i++);
                return $e(
                  1 < u && We(f),
                  1 < u &&
                    Re(
                      t
                        .slice(0, u - 1)
                        .concat({ value: " " === t[u - 2].type ? "*" : "" })
                    ).replace(ee, "$1"),
                  n,
                  u < i && e(t.slice(u, i)),
                  i < o && e((t = t.slice(i))),
                  i < o && Re(t)
                );
              }
              f.push(n);
            }
          return We(f);
        })(t[n]))[A]
          ? r
          : i
        ).push(o);
      (o = pe(e, Be(i, r))).selector = e;
    }
    return o;
  }
  function ze(e, t, n, r) {
    var i,
      o,
      s,
      a,
      u,
      l = "function" == typeof e && e,
      c = !r && Me((e = l.selector || e));
    if (((n = n || []), 1 === c.length)) {
      if (
        2 < (o = c[0] = c[0].slice(0)).length &&
        "ID" === (s = o[0]).type &&
        9 === t.nodeType &&
        k &&
        S.relative[o[1].type]
      ) {
        if (!(t = (S.find.ID(s.matches[0].replace(f, d), t) || [])[0]))
          return n;
        l && (t = t.parentNode), (e = e.slice(o.shift().value.length));
      }
      for (
        i = Te.needsContext.test(e) ? 0 : o.length;
        i-- && ((s = o[i]), !S.relative[(a = s.type)]);

      )
        if (
          (u = S.find[a]) &&
          (r = u(
            s.matches[0].replace(f, d),
            (ke.test(o[0].type) && He(t.parentNode)) || t
          ))
        ) {
          if ((o.splice(i, 1), (e = r.length && Re(o)))) break;
          return j.apply(n, r), n;
        }
    }
    return (
      (l || _e(e, c))(r, t, !k, n, !t || (ke.test(e) && He(t.parentNode)) || t),
      n
    );
  }
  (Pe.prototype = S.filters = S.pseudos),
    (S.setFilters = new Pe()),
    (g.sortStable = A.split("").sort(he).join("") === A),
    Oe(),
    (g.sortDetached = Ne(function (e) {
      return 1 & e.compareDocumentPosition(E.createElement("fieldset"));
    })),
    (C.find = N),
    (C.expr[":"] = C.expr.pseudos),
    (C.unique = C.uniqueSort),
    (N.compile = _e),
    (N.select = ze),
    (N.setDocument = Oe),
    (N.tokenize = Me),
    (N.escape = C.escapeSelector),
    (N.getText = C.text),
    (N.isXML = C.isXMLDoc),
    (N.selectors = C.expr),
    (N.support = C.support),
    (N.uniqueSort = C.uniqueSort);
  function Xe(e, t, n) {
    for (var r = [], i = void 0 !== n; (e = e[t]) && 9 !== e.nodeType; )
      if (1 === e.nodeType) {
        if (i && C(e).is(n)) break;
        r.push(e);
      }
    return r;
  }
  function Ue(e, t) {
    for (var n = []; e; e = e.nextSibling)
      1 === e.nodeType && e !== t && n.push(e);
    return n;
  }
  var Ve = C.expr.match.needsContext,
    Ge = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
  function Ye(e, n, r) {
    return v(n)
      ? C.grep(e, function (e, t) {
          return !!n.call(e, t, e) !== r;
        })
      : n.nodeType
      ? C.grep(e, function (e) {
          return (e === n) !== r;
        })
      : "string" != typeof n
      ? C.grep(e, function (e) {
          return -1 < x.call(n, e) !== r;
        })
      : C.filter(n, e, r);
  }
  (C.filter = function (e, t, n) {
    var r = t[0];
    return (
      n && (e = ":not(" + e + ")"),
      1 === t.length && 1 === r.nodeType
        ? C.find.matchesSelector(r, e)
          ? [r]
          : []
        : C.find.matches(
            e,
            C.grep(t, function (e) {
              return 1 === e.nodeType;
            })
          )
    );
  }),
    C.fn.extend({
      find: function (e) {
        var t,
          n,
          r = this.length,
          i = this;
        if ("string" != typeof e)
          return this.pushStack(
            C(e).filter(function () {
              for (t = 0; t < r; t++) if (C.contains(i[t], this)) return !0;
            })
          );
        for (n = this.pushStack([]), t = 0; t < r; t++) C.find(e, i[t], n);
        return 1 < r ? C.uniqueSort(n) : n;
      },
      filter: function (e) {
        return this.pushStack(Ye(this, e || [], !1));
      },
      not: function (e) {
        return this.pushStack(Ye(this, e || [], !0));
      },
      is: function (e) {
        return !!Ye(
          this,
          "string" == typeof e && Ve.test(e) ? C(e) : e || [],
          !1
        ).length;
      },
    });
  var Qe,
    Je = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,
    Ke =
      (((C.fn.init = function (e, t, n) {
        if (e) {
          if (((n = n || Qe), "string" != typeof e))
            return e.nodeType
              ? ((this[0] = e), (this.length = 1), this)
              : v(e)
              ? void 0 !== n.ready
                ? n.ready(e)
                : e(C)
              : C.makeArray(e, this);
          if (
            !(r =
              "<" === e[0] && ">" === e[e.length - 1] && 3 <= e.length
                ? [null, e, null]
                : Je.exec(e)) ||
            (!r[1] && t)
          )
            return (!t || t.jquery ? t || n : this.constructor(t)).find(e);
          if (r[1]) {
            if (
              ((t = t instanceof C ? t[0] : t),
              C.merge(
                this,
                C.parseHTML(
                  r[1],
                  t && t.nodeType ? t.ownerDocument || t : T,
                  !0
                )
              ),
              Ge.test(r[1]) && C.isPlainObject(t))
            )
              for (var r in t) v(this[r]) ? this[r](t[r]) : this.attr(r, t[r]);
          } else
            (n = T.getElementById(r[2])) && ((this[0] = n), (this.length = 1));
        }
        return this;
      }).prototype = C.fn),
      (Qe = C(T)),
      /^(?:parents|prev(?:Until|All))/),
    Ze = { children: !0, contents: !0, next: !0, prev: !0 };
  function et(e, t) {
    for (; (e = e[t]) && 1 !== e.nodeType; );
    return e;
  }
  C.fn.extend({
    has: function (e) {
      var t = C(e, this),
        n = t.length;
      return this.filter(function () {
        for (var e = 0; e < n; e++) if (C.contains(this, t[e])) return !0;
      });
    },
    closest: function (e, t) {
      var n,
        r = 0,
        i = this.length,
        o = [],
        s = "string" != typeof e && C(e);
      if (!Ve.test(e))
        for (; r < i; r++)
          for (n = this[r]; n && n !== t; n = n.parentNode)
            if (
              n.nodeType < 11 &&
              (s
                ? -1 < s.index(n)
                : 1 === n.nodeType && C.find.matchesSelector(n, e))
            ) {
              o.push(n);
              break;
            }
      return this.pushStack(1 < o.length ? C.uniqueSort(o) : o);
    },
    index: function (e) {
      return e
        ? "string" == typeof e
          ? x.call(C(e), this[0])
          : x.call(this, e.jquery ? e[0] : e)
        : this[0] && this[0].parentNode
        ? this.first().prevAll().length
        : -1;
    },
    add: function (e, t) {
      return this.pushStack(C.uniqueSort(C.merge(this.get(), C(e, t))));
    },
    addBack: function (e) {
      return this.add(null == e ? this.prevObject : this.prevObject.filter(e));
    },
  }),
    C.each(
      {
        parent: function (e) {
          e = e.parentNode;
          return e && 11 !== e.nodeType ? e : null;
        },
        parents: function (e) {
          return Xe(e, "parentNode");
        },
        parentsUntil: function (e, t, n) {
          return Xe(e, "parentNode", n);
        },
        next: function (e) {
          return et(e, "nextSibling");
        },
        prev: function (e) {
          return et(e, "previousSibling");
        },
        nextAll: function (e) {
          return Xe(e, "nextSibling");
        },
        prevAll: function (e) {
          return Xe(e, "previousSibling");
        },
        nextUntil: function (e, t, n) {
          return Xe(e, "nextSibling", n);
        },
        prevUntil: function (e, t, n) {
          return Xe(e, "previousSibling", n);
        },
        siblings: function (e) {
          return Ue((e.parentNode || {}).firstChild, e);
        },
        children: function (e) {
          return Ue(e.firstChild);
        },
        contents: function (e) {
          return null != e.contentDocument && I(e.contentDocument)
            ? e.contentDocument
            : (b(e, "template") && (e = e.content || e),
              C.merge([], e.childNodes));
        },
      },
      function (r, i) {
        C.fn[r] = function (e, t) {
          var n = C.map(this, i, e);
          return (
            (t = "Until" !== r.slice(-5) ? e : t) &&
              "string" == typeof t &&
              (n = C.filter(t, n)),
            1 < this.length &&
              (Ze[r] || C.uniqueSort(n), Ke.test(r)) &&
              n.reverse(),
            this.pushStack(n)
          );
        };
      }
    );
  var q = /[^\x20\t\r\n\f]+/g;
  function tt(e) {
    return e;
  }
  function nt(e) {
    throw e;
  }
  function rt(e, t, n, r) {
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
  (C.Callbacks = function (r) {
    var e, n;
    r =
      "string" == typeof r
        ? ((e = r),
          (n = {}),
          C.each(e.match(q) || [], function (e, t) {
            n[t] = !0;
          }),
          n)
        : C.extend({}, r);
    function i() {
      for (a = a || r.once, s = o = !0; l.length; c = -1)
        for (t = l.shift(); ++c < u.length; )
          !1 === u[c].apply(t[0], t[1]) &&
            r.stopOnFalse &&
            ((c = u.length), (t = !1));
      r.memory || (t = !1), (o = !1), a && (u = t ? [] : "");
    }
    var o,
      t,
      s,
      a,
      u = [],
      l = [],
      c = -1,
      f = {
        add: function () {
          return (
            u &&
              (t && !o && ((c = u.length - 1), l.push(t)),
              (function n(e) {
                C.each(e, function (e, t) {
                  v(t)
                    ? (r.unique && f.has(t)) || u.push(t)
                    : t && t.length && "string" !== G(t) && n(t);
                });
              })(arguments),
              t) &&
              !o &&
              i(),
            this
          );
        },
        remove: function () {
          return (
            C.each(arguments, function (e, t) {
              for (var n; -1 < (n = C.inArray(t, u, n)); )
                u.splice(n, 1), n <= c && c--;
            }),
            this
          );
        },
        has: function (e) {
          return e ? -1 < C.inArray(e, u) : 0 < u.length;
        },
        empty: function () {
          return (u = u && []), this;
        },
        disable: function () {
          return (a = l = []), (u = t = ""), this;
        },
        disabled: function () {
          return !u;
        },
        lock: function () {
          return (a = l = []), t || o || (u = t = ""), this;
        },
        locked: function () {
          return !!a;
        },
        fireWith: function (e, t) {
          return (
            a ||
              ((t = [e, (t = t || []).slice ? t.slice() : t]), l.push(t), o) ||
              i(),
            this
          );
        },
        fire: function () {
          return f.fireWith(this, arguments), this;
        },
        fired: function () {
          return !!s;
        },
      };
    return f;
  }),
    C.extend({
      Deferred: function (e) {
        var o = [
            [
              "notify",
              "progress",
              C.Callbacks("memory"),
              C.Callbacks("memory"),
              2,
            ],
            [
              "resolve",
              "done",
              C.Callbacks("once memory"),
              C.Callbacks("once memory"),
              0,
              "resolved",
            ],
            [
              "reject",
              "fail",
              C.Callbacks("once memory"),
              C.Callbacks("once memory"),
              1,
              "rejected",
            ],
          ],
          i = "pending",
          s = {
            state: function () {
              return i;
            },
            always: function () {
              return a.done(arguments).fail(arguments), this;
            },
            catch: function (e) {
              return s.then(null, e);
            },
            pipe: function () {
              var i = arguments;
              return C.Deferred(function (r) {
                C.each(o, function (e, t) {
                  var n = v(i[t[4]]) && i[t[4]];
                  a[t[1]](function () {
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
              }).promise();
            },
            then: function (t, n, r) {
              var u = 0;
              function l(i, o, s, a) {
                return function () {
                  function e() {
                    var e, t;
                    if (!(i < u)) {
                      if ((e = s.apply(n, r)) === o.promise())
                        throw new TypeError("Thenable self-resolution");
                      (t =
                        e &&
                        ("object" == typeof e || "function" == typeof e) &&
                        e.then),
                        v(t)
                          ? a
                            ? t.call(e, l(u, o, tt, a), l(u, o, nt, a))
                            : (u++,
                              t.call(
                                e,
                                l(u, o, tt, a),
                                l(u, o, nt, a),
                                l(u, o, tt, o.notifyWith)
                              ))
                          : (s !== tt && ((n = void 0), (r = [e])),
                            (a || o.resolveWith)(n, r));
                    }
                  }
                  var n = this,
                    r = arguments,
                    t = a
                      ? e
                      : function () {
                          try {
                            e();
                          } catch (e) {
                            C.Deferred.exceptionHook &&
                              C.Deferred.exceptionHook(e, t.error),
                              u <= i + 1 &&
                                (s !== nt && ((n = void 0), (r = [e])),
                                o.rejectWith(n, r));
                          }
                        };
                  i
                    ? t()
                    : (C.Deferred.getErrorHook
                        ? (t.error = C.Deferred.getErrorHook())
                        : C.Deferred.getStackHook &&
                          (t.error = C.Deferred.getStackHook()),
                      w.setTimeout(t));
                };
              }
              return C.Deferred(function (e) {
                o[0][3].add(l(0, e, v(r) ? r : tt, e.notifyWith)),
                  o[1][3].add(l(0, e, v(t) ? t : tt)),
                  o[2][3].add(l(0, e, v(n) ? n : nt));
              }).promise();
            },
            promise: function (e) {
              return null != e ? C.extend(e, s) : s;
            },
          },
          a = {};
        return (
          C.each(o, function (e, t) {
            var n = t[2],
              r = t[5];
            (s[t[1]] = n.add),
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
              (a[t[0]] = function () {
                return (
                  a[t[0] + "With"](this === a ? void 0 : this, arguments), this
                );
              }),
              (a[t[0] + "With"] = n.fireWith);
          }),
          s.promise(a),
          e && e.call(a, a),
          a
        );
      },
      when: function (e) {
        function t(t) {
          return function (e) {
            (i[t] = this),
              (o[t] = 1 < arguments.length ? a.call(arguments) : e),
              --n || s.resolveWith(i, o);
          };
        }
        var n = arguments.length,
          r = n,
          i = Array(r),
          o = a.call(arguments),
          s = C.Deferred();
        if (
          n <= 1 &&
          (rt(e, s.done(t(r)).resolve, s.reject, !n),
          "pending" === s.state() || v(o[r] && o[r].then))
        )
          return s.then();
        for (; r--; ) rt(o[r], t(r), s.reject);
        return s.promise();
      },
    });
  var it = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/,
    ot =
      ((C.Deferred.exceptionHook = function (e, t) {
        w.console &&
          w.console.warn &&
          e &&
          it.test(e.name) &&
          w.console.warn("jQuery.Deferred exception: " + e.message, e.stack, t);
      }),
      (C.readyException = function (e) {
        w.setTimeout(function () {
          throw e;
        });
      }),
      C.Deferred());
  function st() {
    T.removeEventListener("DOMContentLoaded", st),
      w.removeEventListener("load", st),
      C.ready();
  }
  (C.fn.ready = function (e) {
    return (
      ot.then(e).catch(function (e) {
        C.readyException(e);
      }),
      this
    );
  }),
    C.extend({
      isReady: !1,
      readyWait: 1,
      ready: function (e) {
        (!0 === e ? --C.readyWait : C.isReady) ||
          ((C.isReady = !0) !== e && 0 < --C.readyWait) ||
          ot.resolveWith(T, [C]);
      },
    }),
    (C.ready.then = ot.then),
    "complete" === T.readyState ||
    ("loading" !== T.readyState && !T.documentElement.doScroll)
      ? w.setTimeout(C.ready)
      : (T.addEventListener("DOMContentLoaded", st),
        w.addEventListener("load", st));
  function c(e, t, n, r, i, o, s) {
    var a = 0,
      u = e.length,
      l = null == n;
    if ("object" === G(n)) for (a in ((i = !0), n)) c(e, t, a, n[a], !0, o, s);
    else if (
      void 0 !== r &&
      ((i = !0),
      v(r) || (s = !0),
      (t = l
        ? s
          ? (t.call(e, r), null)
          : ((l = t),
            function (e, t, n) {
              return l.call(C(e), n);
            })
        : t))
    )
      for (; a < u; a++) t(e[a], n, s ? r : r.call(e[a], a, t(e[a], n)));
    return i ? e : l ? t.call(e) : u ? t(e[0], n) : o;
  }
  var at = /^-ms-/,
    ut = /-([a-z])/g;
  function lt(e, t) {
    return t.toUpperCase();
  }
  function L(e) {
    return e.replace(at, "ms-").replace(ut, lt);
  }
  function ct(e) {
    return 1 === e.nodeType || 9 === e.nodeType || !+e.nodeType;
  }
  function ft() {
    this.expando = C.expando + ft.uid++;
  }
  (ft.uid = 1),
    (ft.prototype = {
      cache: function (e) {
        var t = e[this.expando];
        return (
          t ||
            ((t = {}),
            ct(e) &&
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
        if ("string" == typeof t) i[L(t)] = n;
        else for (r in t) i[L(r)] = t[r];
        return i;
      },
      get: function (e, t) {
        return void 0 === t
          ? this.cache(e)
          : e[this.expando] && e[this.expando][L(t)];
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
              ? t.map(L)
              : (t = L(t)) in r
              ? [t]
              : t.match(q) || []).length;
            for (; n--; ) delete r[t[n]];
          }
          (void 0 !== t && !C.isEmptyObject(r)) ||
            (e.nodeType ? (e[this.expando] = void 0) : delete e[this.expando]);
        }
      },
      hasData: function (e) {
        e = e[this.expando];
        return void 0 !== e && !C.isEmptyObject(e);
      },
    });
  var m = new ft(),
    l = new ft(),
    pt = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    dt = /[A-Z]/g;
  function ht(e, t, n) {
    var r, i;
    if (void 0 === n && 1 === e.nodeType)
      if (
        ((r = "data-" + t.replace(dt, "-$&").toLowerCase()),
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
                : pt.test(i)
                ? JSON.parse(i)
                : i));
        } catch (e) {}
        l.set(e, t, n);
      } else n = void 0;
    return n;
  }
  C.extend({
    hasData: function (e) {
      return l.hasData(e) || m.hasData(e);
    },
    data: function (e, t, n) {
      return l.access(e, t, n);
    },
    removeData: function (e, t) {
      l.remove(e, t);
    },
    _data: function (e, t, n) {
      return m.access(e, t, n);
    },
    _removeData: function (e, t) {
      m.remove(e, t);
    },
  }),
    C.fn.extend({
      data: function (n, e) {
        var t,
          r,
          i,
          o = this[0],
          s = o && o.attributes;
        if (void 0 !== n)
          return "object" == typeof n
            ? this.each(function () {
                l.set(this, n);
              })
            : c(
                this,
                function (e) {
                  var t;
                  if (o && void 0 === e)
                    return void 0 !== (t = l.get(o, n)) ||
                      void 0 !== (t = ht(o, n))
                      ? t
                      : void 0;
                  this.each(function () {
                    l.set(this, n, e);
                  });
                },
                null,
                e,
                1 < arguments.length,
                null,
                !0
              );
        if (
          this.length &&
          ((i = l.get(o)), 1 === o.nodeType) &&
          !m.get(o, "hasDataAttrs")
        ) {
          for (t = s.length; t--; )
            s[t] &&
              0 === (r = s[t].name).indexOf("data-") &&
              ((r = L(r.slice(5))), ht(o, r, i[r]));
          m.set(o, "hasDataAttrs", !0);
        }
        return i;
      },
      removeData: function (e) {
        return this.each(function () {
          l.remove(this, e);
        });
      },
    }),
    C.extend({
      queue: function (e, t, n) {
        var r;
        if (e)
          return (
            (r = m.get(e, (t = (t || "fx") + "queue"))),
            n &&
              (!r || Array.isArray(n)
                ? (r = m.access(e, t, C.makeArray(n)))
                : r.push(n)),
            r || []
          );
      },
      dequeue: function (e, t) {
        t = t || "fx";
        var n = C.queue(e, t),
          r = n.length,
          i = n.shift(),
          o = C._queueHooks(e, t);
        "inprogress" === i && ((i = n.shift()), r--),
          i &&
            ("fx" === t && n.unshift("inprogress"),
            delete o.stop,
            i.call(
              e,
              function () {
                C.dequeue(e, t);
              },
              o
            )),
          !r && o && o.empty.fire();
      },
      _queueHooks: function (e, t) {
        var n = t + "queueHooks";
        return (
          m.get(e, n) ||
          m.access(e, n, {
            empty: C.Callbacks("once memory").add(function () {
              m.remove(e, [t + "queue", n]);
            }),
          })
        );
      },
    }),
    C.fn.extend({
      queue: function (t, n) {
        var e = 2;
        return (
          "string" != typeof t && ((n = t), (t = "fx"), e--),
          arguments.length < e
            ? C.queue(this[0], t)
            : void 0 === n
            ? this
            : this.each(function () {
                var e = C.queue(this, t, n);
                C._queueHooks(this, t),
                  "fx" === t && "inprogress" !== e[0] && C.dequeue(this, t);
              })
        );
      },
      dequeue: function (e) {
        return this.each(function () {
          C.dequeue(this, e);
        });
      },
      clearQueue: function (e) {
        return this.queue(e || "fx", []);
      },
      promise: function (e, t) {
        function n() {
          --i || o.resolveWith(s, [s]);
        }
        var r,
          i = 1,
          o = C.Deferred(),
          s = this,
          a = this.length;
        for (
          "string" != typeof e && ((t = e), (e = void 0)), e = e || "fx";
          a--;

        )
          (r = m.get(s[a], e + "queueHooks")) &&
            r.empty &&
            (i++, r.empty.add(n));
        return n(), o.promise(t);
      },
    });
  function gt(e, t) {
    return (
      "none" === (e = t || e).style.display ||
      ("" === e.style.display && xt(e) && "none" === C.css(e, "display"))
    );
  }
  var e = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
    yt = new RegExp("^(?:([+-])=|)(" + e + ")([a-z%]*)$", "i"),
    mt = ["Top", "Right", "Bottom", "Left"],
    vt = T.documentElement,
    xt = function (e) {
      return C.contains(e.ownerDocument, e);
    },
    bt = { composed: !0 };
  vt.getRootNode &&
    (xt = function (e) {
      return (
        C.contains(e.ownerDocument, e) || e.getRootNode(bt) === e.ownerDocument
      );
    });
  function wt(e, t, n, r) {
    var i,
      o,
      s = 20,
      a = r
        ? function () {
            return r.cur();
          }
        : function () {
            return C.css(e, t, "");
          },
      u = a(),
      l = (n && n[3]) || (C.cssNumber[t] ? "" : "px"),
      c =
        e.nodeType &&
        (C.cssNumber[t] || ("px" !== l && +u)) &&
        yt.exec(C.css(e, t));
    if (c && c[3] !== l) {
      for (l = l || c[3], c = +(u /= 2) || 1; s--; )
        C.style(e, t, c + l),
          (1 - o) * (1 - (o = a() / u || 0.5)) <= 0 && (s = 0),
          (c /= o);
      C.style(e, t, (c *= 2) + l), (n = n || []);
    }
    return (
      n &&
        ((c = +c || +u || 0), (i = n[1] ? c + (n[1] + 1) * n[2] : +n[2]), r) &&
        ((r.unit = l), (r.start = c), (r.end = i)),
      i
    );
  }
  var Tt = {};
  function Ct(e, t) {
    for (var n, r, i, o, s, a = [], u = 0, l = e.length; u < l; u++)
      (r = e[u]).style &&
        ((n = r.style.display),
        t
          ? ("none" === n &&
              ((a[u] = m.get(r, "display") || null),
              a[u] || (r.style.display = "")),
            "" === r.style.display &&
              gt(r) &&
              (a[u] =
                ((s = o = void 0),
                (o = (i = r).ownerDocument),
                (s = Tt[(i = i.nodeName)]) ||
                  ((o = o.body.appendChild(o.createElement(i))),
                  (s = C.css(o, "display")),
                  o.parentNode.removeChild(o),
                  (Tt[i] = s = "none" === s ? "block" : s)),
                s)))
          : "none" !== n && ((a[u] = "none"), m.set(r, "display", n)));
    for (u = 0; u < l; u++) null != a[u] && (e[u].style.display = a[u]);
    return e;
  }
  C.fn.extend({
    show: function () {
      return Ct(this, !0);
    },
    hide: function () {
      return Ct(this);
    },
    toggle: function (e) {
      return "boolean" == typeof e
        ? e
          ? this.show()
          : this.hide()
        : this.each(function () {
            gt(this) ? C(this).show() : C(this).hide();
          });
    },
  });
  var St = /^(?:checkbox|radio)$/i,
    Et = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i,
    kt = /^$|^module$|\/(?:java|ecma)script/i,
    h =
      ((o = T.createDocumentFragment().appendChild(T.createElement("div"))),
      (s = T.createElement("input")).setAttribute("type", "radio"),
      s.setAttribute("checked", "checked"),
      s.setAttribute("name", "t"),
      o.appendChild(s),
      (g.checkClone = o.cloneNode(!0).cloneNode(!0).lastChild.checked),
      (o.innerHTML = "<textarea>x</textarea>"),
      (g.noCloneChecked = !!o.cloneNode(!0).lastChild.defaultValue),
      (o.innerHTML = "<option></option>"),
      (g.option = !!o.lastChild),
      {
        thead: [1, "<table>", "</table>"],
        col: [2, "<table><colgroup>", "</colgroup></table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        _default: [0, "", ""],
      });
  function y(e, t) {
    var n =
      void 0 !== e.getElementsByTagName
        ? e.getElementsByTagName(t || "*")
        : void 0 !== e.querySelectorAll
        ? e.querySelectorAll(t || "*")
        : [];
    return void 0 === t || (t && b(e, t)) ? C.merge([e], n) : n;
  }
  function jt(e, t) {
    for (var n = 0, r = e.length; n < r; n++)
      m.set(e[n], "globalEval", !t || m.get(t[n], "globalEval"));
  }
  (h.tbody = h.tfoot = h.colgroup = h.caption = h.thead),
    (h.th = h.td),
    g.option ||
      (h.optgroup = h.option =
        [1, "<select multiple='multiple'>", "</select>"]);
  var At = /<|&#?\w+;/;
  function Dt(e, t, n, r, i) {
    for (
      var o,
        s,
        a,
        u,
        l,
        c = t.createDocumentFragment(),
        f = [],
        p = 0,
        d = e.length;
      p < d;
      p++
    )
      if ((o = e[p]) || 0 === o)
        if ("object" === G(o)) C.merge(f, o.nodeType ? [o] : o);
        else if (At.test(o)) {
          for (
            s = s || c.appendChild(t.createElement("div")),
              a = (Et.exec(o) || ["", ""])[1].toLowerCase(),
              a = h[a] || h._default,
              s.innerHTML = a[1] + C.htmlPrefilter(o) + a[2],
              l = a[0];
            l--;

          )
            s = s.lastChild;
          C.merge(f, s.childNodes), ((s = c.firstChild).textContent = "");
        } else f.push(t.createTextNode(o));
    for (c.textContent = "", p = 0; (o = f[p++]); )
      if (r && -1 < C.inArray(o, r)) i && i.push(o);
      else if (
        ((u = xt(o)), (s = y(c.appendChild(o), "script")), u && jt(s), n)
      )
        for (l = 0; (o = s[l++]); ) kt.test(o.type || "") && n.push(o);
    return c;
  }
  var Nt = /^([^.]*)(?:\.(.+)|)/;
  function qt() {
    return !0;
  }
  function Lt() {
    return !1;
  }
  function Ht(e, t, n, r, i, o) {
    var s, a;
    if ("object" == typeof t) {
      for (a in ("string" != typeof n && ((r = r || n), (n = void 0)), t))
        Ht(e, a, n, r, t[a], o);
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
      i = Lt;
    else if (!i) return e;
    return (
      1 === o &&
        ((s = i),
        ((i = function (e) {
          return C().off(e), s.apply(this, arguments);
        }).guid = s.guid || (s.guid = C.guid++))),
      e.each(function () {
        C.event.add(this, t, i, r, n);
      })
    );
  }
  function Ot(e, r, t) {
    t
      ? (m.set(e, r, !1),
        C.event.add(e, r, {
          namespace: !1,
          handler: function (e) {
            var t,
              n = m.get(this, r);
            if (1 & e.isTrigger && this[r]) {
              if (n)
                (C.event.special[r] || {}).delegateType && e.stopPropagation();
              else if (
                ((n = a.call(arguments)),
                m.set(this, r, n),
                this[r](),
                (t = m.get(this, r)),
                m.set(this, r, !1),
                n !== t)
              )
                return e.stopImmediatePropagation(), e.preventDefault(), t;
            } else
              n &&
                (m.set(this, r, C.event.trigger(n[0], n.slice(1), this)),
                e.stopPropagation(),
                (e.isImmediatePropagationStopped = qt));
          },
        }))
      : void 0 === m.get(e, r) && C.event.add(e, r, qt);
  }
  (C.event = {
    global: {},
    add: function (t, e, n, r, i) {
      var o,
        s,
        a,
        u,
        l,
        c,
        f,
        p,
        d,
        h = m.get(t);
      if (ct(t))
        for (
          n.handler && ((n = (o = n).handler), (i = o.selector)),
            i && C.find.matchesSelector(vt, i),
            n.guid || (n.guid = C.guid++),
            a = (a = h.events) || (h.events = Object.create(null)),
            s =
              (s = h.handle) ||
              (h.handle = function (e) {
                return void 0 !== C && C.event.triggered !== e.type
                  ? C.event.dispatch.apply(t, arguments)
                  : void 0;
              }),
            u = (e = (e || "").match(q) || [""]).length;
          u--;

        )
          (f = d = (p = Nt.exec(e[u]) || [])[1]),
            (p = (p[2] || "").split(".").sort()),
            f &&
              ((l = C.event.special[f] || {}),
              (f = (i ? l.delegateType : l.bindType) || f),
              (l = C.event.special[f] || {}),
              (d = C.extend(
                {
                  type: f,
                  origType: d,
                  data: r,
                  handler: n,
                  guid: n.guid,
                  selector: i,
                  needsContext: i && C.expr.match.needsContext.test(i),
                  namespace: p.join("."),
                },
                o
              )),
              (c = a[f]) ||
                (((c = a[f] = []).delegateCount = 0),
                l.setup && !1 !== l.setup.call(t, r, p, s)) ||
                (t.addEventListener && t.addEventListener(f, s)),
              l.add &&
                (l.add.call(t, d), d.handler.guid || (d.handler.guid = n.guid)),
              i ? c.splice(c.delegateCount++, 0, d) : c.push(d),
              (C.event.global[f] = !0));
    },
    remove: function (e, t, n, r, i) {
      var o,
        s,
        a,
        u,
        l,
        c,
        f,
        p,
        d,
        h,
        g,
        y = m.hasData(e) && m.get(e);
      if (y && (u = y.events)) {
        for (l = (t = (t || "").match(q) || [""]).length; l--; )
          if (
            ((d = g = (a = Nt.exec(t[l]) || [])[1]),
            (h = (a[2] || "").split(".").sort()),
            d)
          ) {
            for (
              f = C.event.special[d] || {},
                p = u[(d = (r ? f.delegateType : f.bindType) || d)] || [],
                a =
                  a[2] &&
                  new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)"),
                s = o = p.length;
              o--;

            )
              (c = p[o]),
                (!i && g !== c.origType) ||
                  (n && n.guid !== c.guid) ||
                  (a && !a.test(c.namespace)) ||
                  (r && r !== c.selector && ("**" !== r || !c.selector)) ||
                  (p.splice(o, 1),
                  c.selector && p.delegateCount--,
                  f.remove && f.remove.call(e, c));
            s &&
              !p.length &&
              ((f.teardown && !1 !== f.teardown.call(e, h, y.handle)) ||
                C.removeEvent(e, d, y.handle),
              delete u[d]);
          } else for (d in u) C.event.remove(e, d + t[l], n, r, !0);
        C.isEmptyObject(u) && m.remove(e, "handle events");
      }
    },
    dispatch: function (e) {
      var t,
        n,
        r,
        i,
        o,
        s = new Array(arguments.length),
        a = C.event.fix(e),
        e = (m.get(this, "events") || Object.create(null))[a.type] || [],
        u = C.event.special[a.type] || {};
      for (s[0] = a, t = 1; t < arguments.length; t++) s[t] = arguments[t];
      if (
        ((a.delegateTarget = this),
        !u.preDispatch || !1 !== u.preDispatch.call(this, a))
      ) {
        for (
          o = C.event.handlers.call(this, a, e), t = 0;
          (r = o[t++]) && !a.isPropagationStopped();

        )
          for (
            a.currentTarget = r.elem, n = 0;
            (i = r.handlers[n++]) && !a.isImmediatePropagationStopped();

          )
            (a.rnamespace &&
              !1 !== i.namespace &&
              !a.rnamespace.test(i.namespace)) ||
              ((a.handleObj = i),
              (a.data = i.data),
              void 0 !==
                (i = (
                  (C.event.special[i.origType] || {}).handle || i.handler
                ).apply(r.elem, s)) &&
                !1 === (a.result = i) &&
                (a.preventDefault(), a.stopPropagation()));
        return u.postDispatch && u.postDispatch.call(this, a), a.result;
      }
    },
    handlers: function (e, t) {
      var n,
        r,
        i,
        o,
        s,
        a = [],
        u = t.delegateCount,
        l = e.target;
      if (u && l.nodeType && !("click" === e.type && 1 <= e.button))
        for (; l !== this; l = l.parentNode || this)
          if (1 === l.nodeType && ("click" !== e.type || !0 !== l.disabled)) {
            for (o = [], s = {}, n = 0; n < u; n++)
              void 0 === s[(i = (r = t[n]).selector + " ")] &&
                (s[i] = r.needsContext
                  ? -1 < C(i, this).index(l)
                  : C.find(i, this, null, [l]).length),
                s[i] && o.push(r);
            o.length && a.push({ elem: l, handlers: o });
          }
      return (
        (l = this), u < t.length && a.push({ elem: l, handlers: t.slice(u) }), a
      );
    },
    addProp: function (t, e) {
      Object.defineProperty(C.Event.prototype, t, {
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
      return e[C.expando] ? e : new C.Event(e);
    },
    special: {
      load: { noBubble: !0 },
      click: {
        setup: function (e) {
          e = this || e;
          return (
            St.test(e.type) && e.click && b(e, "input") && Ot(e, "click", !0),
            !1
          );
        },
        trigger: function (e) {
          e = this || e;
          return (
            St.test(e.type) && e.click && b(e, "input") && Ot(e, "click"), !0
          );
        },
        _default: function (e) {
          e = e.target;
          return (
            (St.test(e.type) &&
              e.click &&
              b(e, "input") &&
              m.get(e, "click")) ||
            b(e, "a")
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
    (C.removeEvent = function (e, t, n) {
      e.removeEventListener && e.removeEventListener(t, n);
    }),
    (C.Event = function (e, t) {
      if (!(this instanceof C.Event)) return new C.Event(e, t);
      e && e.type
        ? ((this.originalEvent = e),
          (this.type = e.type),
          (this.isDefaultPrevented =
            e.defaultPrevented ||
            (void 0 === e.defaultPrevented && !1 === e.returnValue)
              ? qt
              : Lt),
          (this.target =
            e.target && 3 === e.target.nodeType
              ? e.target.parentNode
              : e.target),
          (this.currentTarget = e.currentTarget),
          (this.relatedTarget = e.relatedTarget))
        : (this.type = e),
        t && C.extend(this, t),
        (this.timeStamp = (e && e.timeStamp) || Date.now()),
        (this[C.expando] = !0);
    }),
    (C.Event.prototype = {
      constructor: C.Event,
      isDefaultPrevented: Lt,
      isPropagationStopped: Lt,
      isImmediatePropagationStopped: Lt,
      isSimulated: !1,
      preventDefault: function () {
        var e = this.originalEvent;
        (this.isDefaultPrevented = qt),
          e && !this.isSimulated && e.preventDefault();
      },
      stopPropagation: function () {
        var e = this.originalEvent;
        (this.isPropagationStopped = qt),
          e && !this.isSimulated && e.stopPropagation();
      },
      stopImmediatePropagation: function () {
        var e = this.originalEvent;
        (this.isImmediatePropagationStopped = qt),
          e && !this.isSimulated && e.stopImmediatePropagation(),
          this.stopPropagation();
      },
    }),
    C.each(
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
      C.event.addProp
    ),
    C.each({ focus: "focusin", blur: "focusout" }, function (r, i) {
      function o(e) {
        var t, n;
        T.documentMode
          ? ((t = m.get(this, "handle")),
            ((n = C.event.fix(e)).type =
              "focusin" === e.type ? "focus" : "blur"),
            (n.isSimulated = !0),
            t(e),
            n.target === n.currentTarget && t(n))
          : C.event.simulate(i, e.target, C.event.fix(e));
      }
      (C.event.special[r] = {
        setup: function () {
          var e;
          if ((Ot(this, r, !0), !T.documentMode)) return !1;
          (e = m.get(this, i)) || this.addEventListener(i, o),
            m.set(this, i, (e || 0) + 1);
        },
        trigger: function () {
          return Ot(this, r), !0;
        },
        teardown: function () {
          var e;
          if (!T.documentMode) return !1;
          (e = m.get(this, i) - 1)
            ? m.set(this, i, e)
            : (this.removeEventListener(i, o), m.remove(this, i));
        },
        _default: function (e) {
          return m.get(e.target, r);
        },
        delegateType: i,
      }),
        (C.event.special[i] = {
          setup: function () {
            var e = this.ownerDocument || this.document || this,
              t = T.documentMode ? this : e,
              n = m.get(t, i);
            n ||
              (T.documentMode
                ? this.addEventListener(i, o)
                : e.addEventListener(r, o, !0)),
              m.set(t, i, (n || 0) + 1);
          },
          teardown: function () {
            var e = this.ownerDocument || this.document || this,
              t = T.documentMode ? this : e,
              n = m.get(t, i) - 1;
            n
              ? m.set(t, i, n)
              : (T.documentMode
                  ? this.removeEventListener(i, o)
                  : e.removeEventListener(r, o, !0),
                m.remove(t, i));
          },
        });
    }),
    C.each(
      {
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout",
      },
      function (e, i) {
        C.event.special[e] = {
          delegateType: i,
          bindType: i,
          handle: function (e) {
            var t,
              n = e.relatedTarget,
              r = e.handleObj;
            return (
              (n && (n === this || C.contains(this, n))) ||
                ((e.type = r.origType),
                (t = r.handler.apply(this, arguments)),
                (e.type = i)),
              t
            );
          },
        };
      }
    ),
    C.fn.extend({
      on: function (e, t, n, r) {
        return Ht(this, e, t, n, r);
      },
      one: function (e, t, n, r) {
        return Ht(this, e, t, n, r, 1);
      },
      off: function (e, t, n) {
        var r, i;
        if (e && e.preventDefault && e.handleObj)
          (r = e.handleObj),
            C(e.delegateTarget).off(
              r.namespace ? r.origType + "." + r.namespace : r.origType,
              r.selector,
              r.handler
            );
        else {
          if ("object" != typeof e)
            return (
              (!1 !== t && "function" != typeof t) || ((n = t), (t = void 0)),
              !1 === n && (n = Lt),
              this.each(function () {
                C.event.remove(this, e, n, t);
              })
            );
          for (i in e) this.off(i, t, e[i]);
        }
        return this;
      },
    });
  var Pt = /<script|<style|<link/i,
    Mt = /checked\s*(?:[^=]|=\s*.checked.)/i,
    Rt = /^\s*<!\[CDATA\[|\]\]>\s*$/g;
  function It(e, t) {
    return (
      (b(e, "table") &&
        b(11 !== t.nodeType ? t : t.firstChild, "tr") &&
        C(e).children("tbody")[0]) ||
      e
    );
  }
  function Wt(e) {
    return (e.type = (null !== e.getAttribute("type")) + "/" + e.type), e;
  }
  function Ft(e) {
    return (
      "true/" === (e.type || "").slice(0, 5)
        ? (e.type = e.type.slice(5))
        : e.removeAttribute("type"),
      e
    );
  }
  function $t(e, t) {
    var n, r, i, o;
    if (1 === t.nodeType) {
      if (m.hasData(e) && (o = m.get(e).events))
        for (i in (m.remove(t, "handle events"), o))
          for (n = 0, r = o[i].length; n < r; n++) C.event.add(t, i, o[i][n]);
      l.hasData(e) && ((e = l.access(e)), (e = C.extend({}, e)), l.set(t, e));
    }
  }
  function Bt(n, r, i, o) {
    r = W(r);
    var e,
      t,
      s,
      a,
      u,
      l,
      c = 0,
      f = n.length,
      p = f - 1,
      d = r[0],
      h = v(d);
    if (h || (1 < f && "string" == typeof d && !g.checkClone && Mt.test(d)))
      return n.each(function (e) {
        var t = n.eq(e);
        h && (r[0] = d.call(this, e, t.html())), Bt(t, r, i, o);
      });
    if (
      f &&
      ((t = (e = Dt(r, n[0].ownerDocument, !1, n, o)).firstChild),
      1 === e.childNodes.length && (e = t),
      t || o)
    ) {
      for (a = (s = C.map(y(e, "script"), Wt)).length; c < f; c++)
        (u = e),
          c !== p &&
            ((u = C.clone(u, !0, !0)), a) &&
            C.merge(s, y(u, "script")),
          i.call(n[c], u, c);
      if (a)
        for (l = s[s.length - 1].ownerDocument, C.map(s, Ft), c = 0; c < a; c++)
          (u = s[c]),
            kt.test(u.type || "") &&
              !m.access(u, "globalEval") &&
              C.contains(l, u) &&
              (u.src && "module" !== (u.type || "").toLowerCase()
                ? C._evalUrl &&
                  !u.noModule &&
                  C._evalUrl(
                    u.src,
                    { nonce: u.nonce || u.getAttribute("nonce") },
                    l
                  )
                : V(u.textContent.replace(Rt, ""), u, l));
    }
    return n;
  }
  function _t(e, t, n) {
    for (var r, i = t ? C.filter(t, e) : e, o = 0; null != (r = i[o]); o++)
      n || 1 !== r.nodeType || C.cleanData(y(r)),
        r.parentNode &&
          (n && xt(r) && jt(y(r, "script")), r.parentNode.removeChild(r));
    return e;
  }
  C.extend({
    htmlPrefilter: function (e) {
      return e;
    },
    clone: function (e, t, n) {
      var r,
        i,
        o,
        s,
        a,
        u,
        l,
        c = e.cloneNode(!0),
        f = xt(e);
      if (
        !(
          g.noCloneChecked ||
          (1 !== e.nodeType && 11 !== e.nodeType) ||
          C.isXMLDoc(e)
        )
      )
        for (s = y(c), r = 0, i = (o = y(e)).length; r < i; r++)
          (a = o[r]),
            (u = s[r]),
            (l = void 0),
            "input" === (l = u.nodeName.toLowerCase()) && St.test(a.type)
              ? (u.checked = a.checked)
              : ("input" !== l && "textarea" !== l) ||
                (u.defaultValue = a.defaultValue);
      if (t)
        if (n)
          for (o = o || y(e), s = s || y(c), r = 0, i = o.length; r < i; r++)
            $t(o[r], s[r]);
        else $t(e, c);
      return 0 < (s = y(c, "script")).length && jt(s, !f && y(e, "script")), c;
    },
    cleanData: function (e) {
      for (var t, n, r, i = C.event.special, o = 0; void 0 !== (n = e[o]); o++)
        if (ct(n)) {
          if ((t = n[m.expando])) {
            if (t.events)
              for (r in t.events)
                i[r] ? C.event.remove(n, r) : C.removeEvent(n, r, t.handle);
            n[m.expando] = void 0;
          }
          n[l.expando] && (n[l.expando] = void 0);
        }
    },
  }),
    C.fn.extend({
      detach: function (e) {
        return _t(this, e, !0);
      },
      remove: function (e) {
        return _t(this, e);
      },
      text: function (e) {
        return c(
          this,
          function (e) {
            return void 0 === e
              ? C.text(this)
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
        return Bt(this, arguments, function (e) {
          (1 !== this.nodeType &&
            11 !== this.nodeType &&
            9 !== this.nodeType) ||
            It(this, e).appendChild(e);
        });
      },
      prepend: function () {
        return Bt(this, arguments, function (e) {
          var t;
          (1 !== this.nodeType &&
            11 !== this.nodeType &&
            9 !== this.nodeType) ||
            (t = It(this, e)).insertBefore(e, t.firstChild);
        });
      },
      before: function () {
        return Bt(this, arguments, function (e) {
          this.parentNode && this.parentNode.insertBefore(e, this);
        });
      },
      after: function () {
        return Bt(this, arguments, function (e) {
          this.parentNode && this.parentNode.insertBefore(e, this.nextSibling);
        });
      },
      empty: function () {
        for (var e, t = 0; null != (e = this[t]); t++)
          1 === e.nodeType && (C.cleanData(y(e, !1)), (e.textContent = ""));
        return this;
      },
      clone: function (e, t) {
        return (
          (e = null != e && e),
          (t = null == t ? e : t),
          this.map(function () {
            return C.clone(this, e, t);
          })
        );
      },
      html: function (e) {
        return c(
          this,
          function (e) {
            var t = this[0] || {},
              n = 0,
              r = this.length;
            if (void 0 === e && 1 === t.nodeType) return t.innerHTML;
            if (
              "string" == typeof e &&
              !Pt.test(e) &&
              !h[(Et.exec(e) || ["", ""])[1].toLowerCase()]
            ) {
              e = C.htmlPrefilter(e);
              try {
                for (; n < r; n++)
                  1 === (t = this[n] || {}).nodeType &&
                    (C.cleanData(y(t, !1)), (t.innerHTML = e));
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
        return Bt(
          this,
          arguments,
          function (e) {
            var t = this.parentNode;
            C.inArray(this, n) < 0 &&
              (C.cleanData(y(this)), t) &&
              t.replaceChild(e, this);
          },
          n
        );
      },
    }),
    C.each(
      {
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith",
      },
      function (e, s) {
        C.fn[e] = function (e) {
          for (var t, n = [], r = C(e), i = r.length - 1, o = 0; o <= i; o++)
            (t = o === i ? this : this.clone(!0)),
              C(r[o])[s](t),
              F.apply(n, t.get());
          return this.pushStack(n);
        };
      }
    );
  function zt(e) {
    var t = e.ownerDocument.defaultView;
    return (t = t && t.opener ? t : w).getComputedStyle(e);
  }
  function Xt(e, t, n) {
    var r,
      i = {};
    for (r in t) (i[r] = e.style[r]), (e.style[r] = t[r]);
    for (r in ((n = n.call(e)), t)) e.style[r] = i[r];
    return n;
  }
  var Ut,
    Vt,
    Gt,
    Yt,
    Qt,
    Jt,
    Kt,
    H,
    Zt = new RegExp("^(" + e + ")(?!px)[a-z%]+$", "i"),
    en = /^--/,
    tn = new RegExp(mt.join("|"), "i");
  function nn() {
    var e;
    H &&
      ((Kt.style.cssText =
        "position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0"),
      (H.style.cssText =
        "position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%"),
      vt.appendChild(Kt).appendChild(H),
      (e = w.getComputedStyle(H)),
      (Ut = "1%" !== e.top),
      (Jt = 12 === rn(e.marginLeft)),
      (H.style.right = "60%"),
      (Yt = 36 === rn(e.right)),
      (Vt = 36 === rn(e.width)),
      (H.style.position = "absolute"),
      (Gt = 12 === rn(H.offsetWidth / 3)),
      vt.removeChild(Kt),
      (H = null));
  }
  function rn(e) {
    return Math.round(parseFloat(e));
  }
  function on(e, t, n) {
    var r,
      i = en.test(t),
      o = e.style;
    return (
      (n = n || zt(e)) &&
        ((r = n.getPropertyValue(t) || n[t]),
        "" !== (r = i ? r && (r.replace(ee, "$1") || void 0) : r) ||
          xt(e) ||
          (r = C.style(e, t)),
        !g.pixelBoxStyles()) &&
        Zt.test(r) &&
        tn.test(t) &&
        ((i = o.width),
        (e = o.minWidth),
        (t = o.maxWidth),
        (o.minWidth = o.maxWidth = o.width = r),
        (r = n.width),
        (o.width = i),
        (o.minWidth = e),
        (o.maxWidth = t)),
      void 0 !== r ? r + "" : r
    );
  }
  function sn(e, t) {
    return {
      get: function () {
        if (!e()) return (this.get = t).apply(this, arguments);
        delete this.get;
      },
    };
  }
  (Kt = T.createElement("div")),
    (H = T.createElement("div")).style &&
      ((H.style.backgroundClip = "content-box"),
      (H.cloneNode(!0).style.backgroundClip = ""),
      (g.clearCloneStyle = "content-box" === H.style.backgroundClip),
      C.extend(g, {
        boxSizingReliable: function () {
          return nn(), Vt;
        },
        pixelBoxStyles: function () {
          return nn(), Yt;
        },
        pixelPosition: function () {
          return nn(), Ut;
        },
        reliableMarginLeft: function () {
          return nn(), Jt;
        },
        scrollboxSize: function () {
          return nn(), Gt;
        },
        reliableTrDimensions: function () {
          var e, t, n;
          return (
            null == Qt &&
              ((e = T.createElement("table")),
              (t = T.createElement("tr")),
              (n = T.createElement("div")),
              (e.style.cssText =
                "position:absolute;left:-11111px;border-collapse:separate"),
              (t.style.cssText = "box-sizing:content-box;border:1px solid"),
              (t.style.height = "1px"),
              (n.style.height = "9px"),
              (n.style.display = "block"),
              vt.appendChild(e).appendChild(t).appendChild(n),
              (n = w.getComputedStyle(t)),
              (Qt =
                parseInt(n.height, 10) +
                  parseInt(n.borderTopWidth, 10) +
                  parseInt(n.borderBottomWidth, 10) ===
                t.offsetHeight),
              vt.removeChild(e)),
            Qt
          );
        },
      }));
  var an = ["Webkit", "Moz", "ms"],
    un = T.createElement("div").style,
    ln = {};
  function cn(e) {
    var t = C.cssProps[e] || ln[e];
    return (
      t ||
      (e in un
        ? e
        : (ln[e] =
            ((e) => {
              for (
                var t = e[0].toUpperCase() + e.slice(1), n = an.length;
                n--;

              )
                if ((e = an[n] + t) in un) return e;
            })(e) || e))
    );
  }
  var fn = /^(none|table(?!-c[ea]).+)/,
    pn = { position: "absolute", visibility: "hidden", display: "block" },
    dn = { letterSpacing: "0", fontWeight: "400" };
  function hn(e, t, n) {
    var r = yt.exec(t);
    return r ? Math.max(0, r[2] - (n || 0)) + (r[3] || "px") : t;
  }
  function gn(e, t, n, r, i, o) {
    var s = "width" === t ? 1 : 0,
      a = 0,
      u = 0,
      l = 0;
    if (n === (r ? "border" : "content")) return 0;
    for (; s < 4; s += 2)
      "margin" === n && (l += C.css(e, n + mt[s], !0, i)),
        r
          ? ("content" === n && (u -= C.css(e, "padding" + mt[s], !0, i)),
            "margin" !== n &&
              (u -= C.css(e, "border" + mt[s] + "Width", !0, i)))
          : ((u += C.css(e, "padding" + mt[s], !0, i)),
            "padding" !== n
              ? (u += C.css(e, "border" + mt[s] + "Width", !0, i))
              : (a += C.css(e, "border" + mt[s] + "Width", !0, i)));
    return (
      !r &&
        0 <= o &&
        (u +=
          Math.max(
            0,
            Math.ceil(
              e["offset" + t[0].toUpperCase() + t.slice(1)] - o - u - a - 0.5
            )
          ) || 0),
      u + l
    );
  }
  function yn(e, t, n) {
    var r = zt(e),
      i =
        (!g.boxSizingReliable() || n) &&
        "border-box" === C.css(e, "boxSizing", !1, r),
      o = i,
      s = on(e, t, r),
      a = "offset" + t[0].toUpperCase() + t.slice(1);
    if (Zt.test(s)) {
      if (!n) return s;
      s = "auto";
    }
    return (
      ((!g.boxSizingReliable() && i) ||
        (!g.reliableTrDimensions() && b(e, "tr")) ||
        "auto" === s ||
        (!parseFloat(s) && "inline" === C.css(e, "display", !1, r))) &&
        e.getClientRects().length &&
        ((i = "border-box" === C.css(e, "boxSizing", !1, r)), (o = a in e)) &&
        (s = e[a]),
      (s = parseFloat(s) || 0) +
        gn(e, t, n || (i ? "border" : "content"), o, r, s) +
        "px"
    );
  }
  function O(e, t, n, r, i) {
    return new O.prototype.init(e, t, n, r, i);
  }
  C.extend({
    cssHooks: {
      opacity: {
        get: function (e, t) {
          if (t) return "" === (t = on(e, "opacity")) ? "1" : t;
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
          s,
          a = L(t),
          u = en.test(t),
          l = e.style;
        if (
          (u || (t = cn(a)), (s = C.cssHooks[t] || C.cssHooks[a]), void 0 === n)
        )
          return s && "get" in s && void 0 !== (i = s.get(e, !1, r)) ? i : l[t];
        "string" === (o = typeof n) &&
          (i = yt.exec(n)) &&
          i[1] &&
          ((n = wt(e, t, i)), (o = "number")),
          null == n ||
            n != n ||
            ("number" !== o ||
              u ||
              (n += (i && i[3]) || (C.cssNumber[a] ? "" : "px")),
            g.clearCloneStyle ||
              "" !== n ||
              0 !== t.indexOf("background") ||
              (l[t] = "inherit"),
            s && "set" in s && void 0 === (n = s.set(e, n, r))) ||
            (u ? l.setProperty(t, n) : (l[t] = n));
      }
    },
    css: function (e, t, n, r) {
      var i,
        o = L(t);
      return (
        en.test(t) || (t = cn(o)),
        "normal" ===
          (i =
            void 0 ===
            (i =
              (o = C.cssHooks[t] || C.cssHooks[o]) && "get" in o
                ? o.get(e, !0, n)
                : i)
              ? on(e, t, r)
              : i) &&
          t in dn &&
          (i = dn[t]),
        ("" === n || n) && ((o = parseFloat(i)), !0 === n || isFinite(o))
          ? o || 0
          : i
      );
    },
  }),
    C.each(["height", "width"], function (e, s) {
      C.cssHooks[s] = {
        get: function (e, t, n) {
          if (t)
            return !fn.test(C.css(e, "display")) ||
              (e.getClientRects().length && e.getBoundingClientRect().width)
              ? yn(e, s, n)
              : Xt(e, pn, function () {
                  return yn(e, s, n);
                });
        },
        set: function (e, t, n) {
          var r = zt(e),
            i = !g.scrollboxSize() && "absolute" === r.position,
            o = (i || n) && "border-box" === C.css(e, "boxSizing", !1, r),
            n = n ? gn(e, s, n, o, r) : 0;
          return (
            o &&
              i &&
              (n -= Math.ceil(
                e["offset" + s[0].toUpperCase() + s.slice(1)] -
                  parseFloat(r[s]) -
                  gn(e, s, "border", !1, r) -
                  0.5
              )),
            n &&
              (o = yt.exec(t)) &&
              "px" !== (o[3] || "px") &&
              ((e.style[s] = t), (t = C.css(e, s))),
            hn(0, t, n)
          );
        },
      };
    }),
    (C.cssHooks.marginLeft = sn(g.reliableMarginLeft, function (e, t) {
      if (t)
        return (
          (parseFloat(on(e, "marginLeft")) ||
            e.getBoundingClientRect().left -
              Xt(e, { marginLeft: 0 }, function () {
                return e.getBoundingClientRect().left;
              })) + "px"
        );
    })),
    C.each({ margin: "", padding: "", border: "Width" }, function (i, o) {
      (C.cssHooks[i + o] = {
        expand: function (e) {
          for (
            var t = 0, n = {}, r = "string" == typeof e ? e.split(" ") : [e];
            t < 4;
            t++
          )
            n[i + mt[t] + o] = r[t] || r[t - 2] || r[0];
          return n;
        },
      }),
        "margin" !== i && (C.cssHooks[i + o].set = hn);
    }),
    C.fn.extend({
      css: function (e, t) {
        return c(
          this,
          function (e, t, n) {
            var r,
              i,
              o = {},
              s = 0;
            if (Array.isArray(t)) {
              for (r = zt(e), i = t.length; s < i; s++)
                o[t[s]] = C.css(e, t[s], !1, r);
              return o;
            }
            return void 0 !== n ? C.style(e, t, n) : C.css(e, t);
          },
          e,
          t,
          1 < arguments.length
        );
      },
    }),
    (((C.Tween = O).prototype = {
      constructor: O,
      init: function (e, t, n, r, i, o) {
        (this.elem = e),
          (this.prop = n),
          (this.easing = i || C.easing._default),
          (this.options = t),
          (this.start = this.now = this.cur()),
          (this.end = r),
          (this.unit = o || (C.cssNumber[n] ? "" : "px"));
      },
      cur: function () {
        var e = O.propHooks[this.prop];
        return (e && e.get ? e : O.propHooks._default).get(this);
      },
      run: function (e) {
        var t,
          n = O.propHooks[this.prop];
        return (
          this.options.duration
            ? (this.pos = t =
                C.easing[this.easing](
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
          (n && n.set ? n : O.propHooks._default).set(this),
          this
        );
      },
    }).init.prototype = O.prototype),
    ((O.propHooks = {
      _default: {
        get: function (e) {
          return 1 !== e.elem.nodeType ||
            (null != e.elem[e.prop] && null == e.elem.style[e.prop])
            ? e.elem[e.prop]
            : (e = C.css(e.elem, e.prop, "")) && "auto" !== e
            ? e
            : 0;
        },
        set: function (e) {
          C.fx.step[e.prop]
            ? C.fx.step[e.prop](e)
            : 1 !== e.elem.nodeType ||
              (!C.cssHooks[e.prop] && null == e.elem.style[cn(e.prop)])
            ? (e.elem[e.prop] = e.now)
            : C.style(e.elem, e.prop, e.now + e.unit);
        },
      },
    }).scrollTop = O.propHooks.scrollLeft =
      {
        set: function (e) {
          e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now);
        },
      }),
    (C.easing = {
      linear: function (e) {
        return e;
      },
      swing: function (e) {
        return 0.5 - Math.cos(e * Math.PI) / 2;
      },
      _default: "swing",
    }),
    (C.fx = O.prototype.init),
    (C.fx.step = {});
  var mn,
    vn,
    xn = /^(?:toggle|show|hide)$/,
    bn = /queueHooks$/;
  function wn() {
    vn &&
      (!1 === T.hidden && w.requestAnimationFrame
        ? w.requestAnimationFrame(wn)
        : w.setTimeout(wn, C.fx.interval),
      C.fx.tick());
  }
  function Tn() {
    return (
      w.setTimeout(function () {
        mn = void 0;
      }),
      (mn = Date.now())
    );
  }
  function Cn(e, t) {
    var n,
      r = 0,
      i = { height: e };
    for (t = t ? 1 : 0; r < 4; r += 2 - t)
      i["margin" + (n = mt[r])] = i["padding" + n] = e;
    return t && (i.opacity = i.width = e), i;
  }
  function Sn(e, t, n) {
    for (
      var r,
        i = (P.tweeners[t] || []).concat(P.tweeners["*"]),
        o = 0,
        s = i.length;
      o < s;
      o++
    )
      if ((r = i[o].call(n, t, e))) return r;
  }
  function P(i, e, t) {
    var n,
      o,
      r,
      s,
      a,
      u,
      l,
      c = 0,
      f = P.prefilters.length,
      p = C.Deferred().always(function () {
        delete d.elem;
      }),
      d = function () {
        if (!o) {
          for (
            var e = mn || Tn(),
              e = Math.max(0, h.startTime + h.duration - e),
              t = 1 - (e / h.duration || 0),
              n = 0,
              r = h.tweens.length;
            n < r;
            n++
          )
            h.tweens[n].run(t);
          if ((p.notifyWith(i, [h, t, e]), t < 1 && r)) return e;
          r || p.notifyWith(i, [h, 1, 0]), p.resolveWith(i, [h]);
        }
        return !1;
      },
      h = p.promise({
        elem: i,
        props: C.extend({}, e),
        opts: C.extend(!0, { specialEasing: {}, easing: C.easing._default }, t),
        originalProperties: e,
        originalOptions: t,
        startTime: mn || Tn(),
        duration: t.duration,
        tweens: [],
        createTween: function (e, t) {
          t = C.Tween(
            i,
            h.opts,
            e,
            t,
            h.opts.specialEasing[e] || h.opts.easing
          );
          return h.tweens.push(t), t;
        },
        stop: function (e) {
          var t = 0,
            n = e ? h.tweens.length : 0;
          if (!o) {
            for (o = !0; t < n; t++) h.tweens[t].run(1);
            e
              ? (p.notifyWith(i, [h, 1, 0]), p.resolveWith(i, [h, e]))
              : p.rejectWith(i, [h, e]);
          }
          return this;
        },
      }),
      g = h.props,
      y = g,
      m = h.opts.specialEasing;
    for (r in y)
      if (
        ((a = m[(s = L(r))]),
        (u = y[r]),
        Array.isArray(u) && ((a = u[1]), (u = y[r] = u[0])),
        r !== s && ((y[s] = u), delete y[r]),
        (l = C.cssHooks[s]) && "expand" in l)
      )
        for (r in ((u = l.expand(u)), delete y[s], u))
          r in y || ((y[r] = u[r]), (m[r] = a));
      else m[s] = a;
    for (; c < f; c++)
      if ((n = P.prefilters[c].call(h, i, g, h.opts)))
        return (
          v(n.stop) &&
            (C._queueHooks(h.elem, h.opts.queue).stop = n.stop.bind(n)),
          n
        );
    return (
      C.map(g, Sn, h),
      v(h.opts.start) && h.opts.start.call(i, h),
      h
        .progress(h.opts.progress)
        .done(h.opts.done, h.opts.complete)
        .fail(h.opts.fail)
        .always(h.opts.always),
      C.fx.timer(C.extend(d, { elem: i, anim: h, queue: h.opts.queue })),
      h
    );
  }
  (C.Animation = C.extend(P, {
    tweeners: {
      "*": [
        function (e, t) {
          var n = this.createTween(e, t);
          return wt(n.elem, e, yt.exec(t), n), n;
        },
      ],
    },
    tweener: function (e, t) {
      for (
        var n, r = 0, i = (e = v(e) ? ((t = e), ["*"]) : e.match(q)).length;
        r < i;
        r++
      )
        (n = e[r]),
          (P.tweeners[n] = P.tweeners[n] || []),
          P.tweeners[n].unshift(t);
    },
    prefilters: [
      function (e, t, n) {
        var r,
          i,
          o,
          s,
          a,
          u,
          l,
          c = "width" in t || "height" in t,
          f = this,
          p = {},
          d = e.style,
          h = e.nodeType && gt(e),
          g = m.get(e, "fxshow");
        for (r in (n.queue ||
          (null == (s = C._queueHooks(e, "fx")).unqueued &&
            ((s.unqueued = 0),
            (a = s.empty.fire),
            (s.empty.fire = function () {
              s.unqueued || a();
            })),
          s.unqueued++,
          f.always(function () {
            f.always(function () {
              s.unqueued--, C.queue(e, "fx").length || s.empty.fire();
            });
          })),
        t))
          if (((i = t[r]), xn.test(i))) {
            if (
              (delete t[r],
              (o = o || "toggle" === i),
              i === (h ? "hide" : "show"))
            ) {
              if ("show" !== i || !g || void 0 === g[r]) continue;
              h = !0;
            }
            p[r] = (g && g[r]) || C.style(e, r);
          }
        if ((u = !C.isEmptyObject(t)) || !C.isEmptyObject(p))
          for (r in (c &&
            1 === e.nodeType &&
            ((n.overflow = [d.overflow, d.overflowX, d.overflowY]),
            null == (l = g && g.display) && (l = m.get(e, "display")),
            "none" === (c = C.css(e, "display")) &&
              (l
                ? (c = l)
                : (Ct([e], !0),
                  (l = e.style.display || l),
                  (c = C.css(e, "display")),
                  Ct([e]))),
            "inline" === c || ("inline-block" === c && null != l)) &&
            "none" === C.css(e, "float") &&
            (u ||
              (f.done(function () {
                d.display = l;
              }),
              null == l && ((c = d.display), (l = "none" === c ? "" : c))),
            (d.display = "inline-block")),
          n.overflow &&
            ((d.overflow = "hidden"),
            f.always(function () {
              (d.overflow = n.overflow[0]),
                (d.overflowX = n.overflow[1]),
                (d.overflowY = n.overflow[2]);
            })),
          (u = !1),
          p))
            u ||
              (g
                ? "hidden" in g && (h = g.hidden)
                : (g = m.access(e, "fxshow", { display: l })),
              o && (g.hidden = !h),
              h && Ct([e], !0),
              f.done(function () {
                for (r in (h || Ct([e]), m.remove(e, "fxshow"), p))
                  C.style(e, r, p[r]);
              })),
              (u = Sn(h ? g[r] : 0, r, f)),
              r in g ||
                ((g[r] = u.start), h && ((u.end = u.start), (u.start = 0)));
      },
    ],
    prefilter: function (e, t) {
      t ? P.prefilters.unshift(e) : P.prefilters.push(e);
    },
  })),
    (C.speed = function (e, t, n) {
      var r =
        e && "object" == typeof e
          ? C.extend({}, e)
          : {
              complete: n || (!n && t) || (v(e) && e),
              duration: e,
              easing: (n && t) || (t && !v(t) && t),
            };
      return (
        C.fx.off
          ? (r.duration = 0)
          : "number" != typeof r.duration &&
            (r.duration in C.fx.speeds
              ? (r.duration = C.fx.speeds[r.duration])
              : (r.duration = C.fx.speeds._default)),
        (null != r.queue && !0 !== r.queue) || (r.queue = "fx"),
        (r.old = r.complete),
        (r.complete = function () {
          v(r.old) && r.old.call(this), r.queue && C.dequeue(this, r.queue);
        }),
        r
      );
    }),
    C.fn.extend({
      fadeTo: function (e, t, n, r) {
        return this.filter(gt)
          .css("opacity", 0)
          .show()
          .end()
          .animate({ opacity: t }, e, n, r);
      },
      animate: function (t, e, n, r) {
        function i() {
          var e = P(this, C.extend({}, t), s);
          (o || m.get(this, "finish")) && e.stop(!0);
        }
        var o = C.isEmptyObject(t),
          s = C.speed(e, n, r);
        return (
          (i.finish = i),
          o || !1 === s.queue ? this.each(i) : this.queue(s.queue, i)
        );
      },
      stop: function (i, e, o) {
        function s(e) {
          var t = e.stop;
          delete e.stop, t(o);
        }
        return (
          "string" != typeof i && ((o = e), (e = i), (i = void 0)),
          e && this.queue(i || "fx", []),
          this.each(function () {
            var e = !0,
              t = null != i && i + "queueHooks",
              n = C.timers,
              r = m.get(this);
            if (t) r[t] && r[t].stop && s(r[t]);
            else for (t in r) r[t] && r[t].stop && bn.test(t) && s(r[t]);
            for (t = n.length; t--; )
              n[t].elem !== this ||
                (null != i && n[t].queue !== i) ||
                (n[t].anim.stop(o), (e = !1), n.splice(t, 1));
            (!e && o) || C.dequeue(this, i);
          })
        );
      },
      finish: function (s) {
        return (
          !1 !== s && (s = s || "fx"),
          this.each(function () {
            var e,
              t = m.get(this),
              n = t[s + "queue"],
              r = t[s + "queueHooks"],
              i = C.timers,
              o = n ? n.length : 0;
            for (
              t.finish = !0,
                C.queue(this, s, []),
                r && r.stop && r.stop.call(this, !0),
                e = i.length;
              e--;

            )
              i[e].elem === this &&
                i[e].queue === s &&
                (i[e].anim.stop(!0), i.splice(e, 1));
            for (e = 0; e < o; e++)
              n[e] && n[e].finish && n[e].finish.call(this);
            delete t.finish;
          })
        );
      },
    }),
    C.each(["toggle", "show", "hide"], function (e, r) {
      var i = C.fn[r];
      C.fn[r] = function (e, t, n) {
        return null == e || "boolean" == typeof e
          ? i.apply(this, arguments)
          : this.animate(Cn(r, !0), e, t, n);
      };
    }),
    C.each(
      {
        slideDown: Cn("show"),
        slideUp: Cn("hide"),
        slideToggle: Cn("toggle"),
        fadeIn: { opacity: "show" },
        fadeOut: { opacity: "hide" },
        fadeToggle: { opacity: "toggle" },
      },
      function (e, r) {
        C.fn[e] = function (e, t, n) {
          return this.animate(r, e, t, n);
        };
      }
    ),
    (C.timers = []),
    (C.fx.tick = function () {
      var e,
        t = 0,
        n = C.timers;
      for (mn = Date.now(); t < n.length; t++)
        (e = n[t])() || n[t] !== e || n.splice(t--, 1);
      n.length || C.fx.stop(), (mn = void 0);
    }),
    (C.fx.timer = function (e) {
      C.timers.push(e), C.fx.start();
    }),
    (C.fx.interval = 13),
    (C.fx.start = function () {
      vn || ((vn = !0), wn());
    }),
    (C.fx.stop = function () {
      vn = null;
    }),
    (C.fx.speeds = { slow: 600, fast: 200, _default: 400 }),
    (C.fn.delay = function (r, e) {
      return (
        (r = (C.fx && C.fx.speeds[r]) || r),
        this.queue((e = e || "fx"), function (e, t) {
          var n = w.setTimeout(e, r);
          t.stop = function () {
            w.clearTimeout(n);
          };
        })
      );
    }),
    (s = T.createElement("input")),
    (o = T.createElement("select").appendChild(T.createElement("option"))),
    (s.type = "checkbox"),
    (g.checkOn = "" !== s.value),
    (g.optSelected = o.selected),
    ((s = T.createElement("input")).value = "t"),
    (s.type = "radio"),
    (g.radioValue = "t" === s.value);
  var En,
    kn = C.expr.attrHandle,
    jn =
      (C.fn.extend({
        attr: function (e, t) {
          return c(this, C.attr, e, t, 1 < arguments.length);
        },
        removeAttr: function (e) {
          return this.each(function () {
            C.removeAttr(this, e);
          });
        },
      }),
      C.extend({
        attr: function (e, t, n) {
          var r,
            i,
            o = e.nodeType;
          if (3 !== o && 8 !== o && 2 !== o)
            return void 0 === e.getAttribute
              ? C.prop(e, t, n)
              : ((1 === o && C.isXMLDoc(e)) ||
                  (i =
                    C.attrHooks[t.toLowerCase()] ||
                    (C.expr.match.bool.test(t) ? En : void 0)),
                void 0 !== n
                  ? null === n
                    ? void C.removeAttr(e, t)
                    : i && "set" in i && void 0 !== (r = i.set(e, n, t))
                    ? r
                    : (e.setAttribute(t, n + ""), n)
                  : !(i && "get" in i && null !== (r = i.get(e, t))) &&
                    null == (r = C.find.attr(e, t))
                  ? void 0
                  : r);
        },
        attrHooks: {
          type: {
            set: function (e, t) {
              var n;
              if (!g.radioValue && "radio" === t && b(e, "input"))
                return (
                  (n = e.value),
                  e.setAttribute("type", t),
                  n && (e.value = n),
                  t
                );
            },
          },
        },
        removeAttr: function (e, t) {
          var n,
            r = 0,
            i = t && t.match(q);
          if (i && 1 === e.nodeType)
            for (; (n = i[r++]); ) e.removeAttribute(n);
        },
      }),
      (En = {
        set: function (e, t, n) {
          return !1 === t ? C.removeAttr(e, n) : e.setAttribute(n, n), n;
        },
      }),
      C.each(C.expr.match.bool.source.match(/\w+/g), function (e, t) {
        var s = kn[t] || C.find.attr;
        kn[t] = function (e, t, n) {
          var r,
            i,
            o = t.toLowerCase();
          return (
            n ||
              ((i = kn[o]),
              (kn[o] = r),
              (r = null != s(e, t, n) ? o : null),
              (kn[o] = i)),
            r
          );
        };
      }),
      /^(?:input|select|textarea|button)$/i),
    An = /^(?:a|area)$/i;
  function Dn(e) {
    return (e.match(q) || []).join(" ");
  }
  function Nn(e) {
    return (e.getAttribute && e.getAttribute("class")) || "";
  }
  function qn(e) {
    return Array.isArray(e) ? e : ("string" == typeof e && e.match(q)) || [];
  }
  C.fn.extend({
    prop: function (e, t) {
      return c(this, C.prop, e, t, 1 < arguments.length);
    },
    removeProp: function (e) {
      return this.each(function () {
        delete this[C.propFix[e] || e];
      });
    },
  }),
    C.extend({
      prop: function (e, t, n) {
        var r,
          i,
          o = e.nodeType;
        if (3 !== o && 8 !== o && 2 !== o)
          return (
            (1 === o && C.isXMLDoc(e)) ||
              ((t = C.propFix[t] || t), (i = C.propHooks[t])),
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
            var t = C.find.attr(e, "tabindex");
            return t
              ? parseInt(t, 10)
              : jn.test(e.nodeName) || (An.test(e.nodeName) && e.href)
              ? 0
              : -1;
          },
        },
      },
      propFix: { for: "htmlFor", class: "className" },
    }),
    g.optSelected ||
      (C.propHooks.selected = {
        get: function (e) {
          e = e.parentNode;
          return e && e.parentNode && e.parentNode.selectedIndex, null;
        },
        set: function (e) {
          e = e.parentNode;
          e && (e.selectedIndex, e.parentNode) && e.parentNode.selectedIndex;
        },
      }),
    C.each(
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
        C.propFix[this.toLowerCase()] = this;
      }
    ),
    C.fn.extend({
      addClass: function (t) {
        var e, n, r, i, o, s;
        return v(t)
          ? this.each(function (e) {
              C(this).addClass(t.call(this, e, Nn(this)));
            })
          : (e = qn(t)).length
          ? this.each(function () {
              if (
                ((r = Nn(this)), (n = 1 === this.nodeType && " " + Dn(r) + " "))
              ) {
                for (o = 0; o < e.length; o++)
                  (i = e[o]), n.indexOf(" " + i + " ") < 0 && (n += i + " ");
                (s = Dn(n)), r !== s && this.setAttribute("class", s);
              }
            })
          : this;
      },
      removeClass: function (t) {
        var e, n, r, i, o, s;
        return v(t)
          ? this.each(function (e) {
              C(this).removeClass(t.call(this, e, Nn(this)));
            })
          : arguments.length
          ? (e = qn(t)).length
            ? this.each(function () {
                if (
                  ((r = Nn(this)),
                  (n = 1 === this.nodeType && " " + Dn(r) + " "))
                ) {
                  for (o = 0; o < e.length; o++)
                    for (i = e[o]; -1 < n.indexOf(" " + i + " "); )
                      n = n.replace(" " + i + " ", " ");
                  (s = Dn(n)), r !== s && this.setAttribute("class", s);
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
          s = typeof t,
          a = "string" == s || Array.isArray(t);
        return v(t)
          ? this.each(function (e) {
              C(this).toggleClass(t.call(this, e, Nn(this), n), n);
            })
          : "boolean" == typeof n && a
          ? n
            ? this.addClass(t)
            : this.removeClass(t)
          : ((e = qn(t)),
            this.each(function () {
              if (a)
                for (o = C(this), i = 0; i < e.length; i++)
                  (r = e[i]), o.hasClass(r) ? o.removeClass(r) : o.addClass(r);
              else
                (void 0 !== t && "boolean" != s) ||
                  ((r = Nn(this)) && m.set(this, "__className__", r),
                  this.setAttribute &&
                    this.setAttribute(
                      "class",
                      (!r && !1 !== t && m.get(this, "__className__")) || ""
                    ));
            }));
      },
      hasClass: function (e) {
        for (var t, n = 0, r = " " + e + " "; (t = this[n++]); )
          if (1 === t.nodeType && -1 < (" " + Dn(Nn(t)) + " ").indexOf(r))
            return !0;
        return !1;
      },
    });
  function Ln(e) {
    e.stopPropagation();
  }
  var Hn = /\r/g,
    On =
      (C.fn.extend({
        val: function (t) {
          var n,
            e,
            r,
            i = this[0];
          return arguments.length
            ? ((r = v(t)),
              this.each(function (e) {
                1 !== this.nodeType ||
                  (null == (e = r ? t.call(this, e, C(this).val()) : t)
                    ? (e = "")
                    : "number" == typeof e
                    ? (e += "")
                    : Array.isArray(e) &&
                      (e = C.map(e, function (e) {
                        return null == e ? "" : e + "";
                      })),
                  (n =
                    C.valHooks[this.type] ||
                    C.valHooks[this.nodeName.toLowerCase()]) &&
                    "set" in n &&
                    void 0 !== n.set(this, e, "value")) ||
                  (this.value = e);
              }))
            : i
            ? (n =
                C.valHooks[i.type] || C.valHooks[i.nodeName.toLowerCase()]) &&
              "get" in n &&
              void 0 !== (e = n.get(i, "value"))
              ? e
              : "string" == typeof (e = i.value)
              ? e.replace(Hn, "")
              : null == e
              ? ""
              : e
            : void 0;
        },
      }),
      C.extend({
        valHooks: {
          option: {
            get: function (e) {
              var t = C.find.attr(e, "value");
              return null != t ? t : Dn(C.text(e));
            },
          },
          select: {
            get: function (e) {
              for (
                var t,
                  n = e.options,
                  r = e.selectedIndex,
                  i = "select-one" === e.type,
                  o = i ? null : [],
                  s = i ? r + 1 : n.length,
                  a = r < 0 ? s : i ? r : 0;
                a < s;
                a++
              )
                if (
                  ((t = n[a]).selected || a === r) &&
                  !t.disabled &&
                  (!t.parentNode.disabled || !b(t.parentNode, "optgroup"))
                ) {
                  if (((t = C(t).val()), i)) return t;
                  o.push(t);
                }
              return o;
            },
            set: function (e, t) {
              for (
                var n, r, i = e.options, o = C.makeArray(t), s = i.length;
                s--;

              )
                ((r = i[s]).selected =
                  -1 < C.inArray(C.valHooks.option.get(r), o)) && (n = !0);
              return n || (e.selectedIndex = -1), o;
            },
          },
        },
      }),
      C.each(["radio", "checkbox"], function () {
        (C.valHooks[this] = {
          set: function (e, t) {
            if (Array.isArray(t))
              return (e.checked = -1 < C.inArray(C(e).val(), t));
          },
        }),
          g.checkOn ||
            (C.valHooks[this].get = function (e) {
              return null === e.getAttribute("value") ? "on" : e.value;
            });
      }),
      w.location),
    Pn = { guid: Date.now() },
    Mn = /\?/,
    Rn =
      ((C.parseXML = function (e) {
        var t, n;
        if (!e || "string" != typeof e) return null;
        try {
          t = new w.DOMParser().parseFromString(e, "text/xml");
        } catch (e) {}
        return (
          (n = t && t.getElementsByTagName("parsererror")[0]),
          (t && !n) ||
            C.error(
              "Invalid XML: " +
                (n
                  ? C.map(n.childNodes, function (e) {
                      return e.textContent;
                    }).join("\n")
                  : e)
            ),
          t
        );
      }),
      /^(?:focusinfocus|focusoutblur)$/),
    In =
      (C.extend(C.event, {
        trigger: function (e, t, n, r) {
          var i,
            o,
            s,
            a,
            u,
            l,
            c,
            f = [n || T],
            p = _.call(e, "type") ? e.type : e,
            d = _.call(e, "namespace") ? e.namespace.split(".") : [],
            h = (c = o = n = n || T);
          if (
            3 !== n.nodeType &&
            8 !== n.nodeType &&
            !Rn.test(p + C.event.triggered) &&
            (-1 < p.indexOf(".") &&
              ((p = (d = p.split(".")).shift()), d.sort()),
            (a = p.indexOf(":") < 0 && "on" + p),
            ((e = e[C.expando]
              ? e
              : new C.Event(p, "object" == typeof e && e)).isTrigger = r
              ? 2
              : 3),
            (e.namespace = d.join(".")),
            (e.rnamespace = e.namespace
              ? new RegExp("(^|\\.)" + d.join("\\.(?:.*\\.|)") + "(\\.|$)")
              : null),
            (e.result = void 0),
            e.target || (e.target = n),
            (t = null == t ? [e] : C.makeArray(t, [e])),
            (l = C.event.special[p] || {}),
            r || !l.trigger || !1 !== l.trigger.apply(n, t))
          ) {
            if (!r && !l.noBubble && !R(n)) {
              for (
                s = l.delegateType || p, Rn.test(s + p) || (h = h.parentNode);
                h;
                h = h.parentNode
              )
                f.push(h), (o = h);
              o === (n.ownerDocument || T) &&
                f.push(o.defaultView || o.parentWindow || w);
            }
            for (i = 0; (h = f[i++]) && !e.isPropagationStopped(); )
              (c = h),
                (e.type = 1 < i ? s : l.bindType || p),
                (u =
                  (m.get(h, "events") || Object.create(null))[e.type] &&
                  m.get(h, "handle")) && u.apply(h, t),
                (u = a && h[a]) &&
                  u.apply &&
                  ct(h) &&
                  ((e.result = u.apply(h, t)), !1 === e.result) &&
                  e.preventDefault();
            return (
              (e.type = p),
              r ||
                e.isDefaultPrevented() ||
                (l._default && !1 !== l._default.apply(f.pop(), t)) ||
                !ct(n) ||
                (a &&
                  v(n[p]) &&
                  !R(n) &&
                  ((o = n[a]) && (n[a] = null),
                  (C.event.triggered = p),
                  e.isPropagationStopped() && c.addEventListener(p, Ln),
                  n[p](),
                  e.isPropagationStopped() && c.removeEventListener(p, Ln),
                  (C.event.triggered = void 0),
                  o) &&
                  (n[a] = o)),
              e.result
            );
          }
        },
        simulate: function (e, t, n) {
          n = C.extend(new C.Event(), n, { type: e, isSimulated: !0 });
          C.event.trigger(n, null, t);
        },
      }),
      C.fn.extend({
        trigger: function (e, t) {
          return this.each(function () {
            C.event.trigger(e, t, this);
          });
        },
        triggerHandler: function (e, t) {
          var n = this[0];
          if (n) return C.event.trigger(e, t, n, !0);
        },
      }),
      /\[\]$/),
    Wn = /\r?\n/g,
    Fn = /^(?:submit|button|image|reset|file)$/i,
    $n = /^(?:input|select|textarea|keygen)/i;
  (C.param = function (e, t) {
    function n(e, t) {
      (t = v(t) ? t() : t),
        (i[i.length] =
          encodeURIComponent(e) + "=" + encodeURIComponent(null == t ? "" : t));
    }
    var r,
      i = [];
    if (null == e) return "";
    if (Array.isArray(e) || (e.jquery && !C.isPlainObject(e)))
      C.each(e, function () {
        n(this.name, this.value);
      });
    else
      for (r in e)
        !(function n(r, e, i, o) {
          if (Array.isArray(e))
            C.each(e, function (e, t) {
              i || In.test(r)
                ? o(r, t)
                : n(
                    r +
                      "[" +
                      ("object" == typeof t && null != t ? e : "") +
                      "]",
                    t,
                    i,
                    o
                  );
            });
          else if (i || "object" !== G(e)) o(r, e);
          else for (var t in e) n(r + "[" + t + "]", e[t], i, o);
        })(r, e[r], t, n);
    return i.join("&");
  }),
    C.fn.extend({
      serialize: function () {
        return C.param(this.serializeArray());
      },
      serializeArray: function () {
        return this.map(function () {
          var e = C.prop(this, "elements");
          return e ? C.makeArray(e) : this;
        })
          .filter(function () {
            var e = this.type;
            return (
              this.name &&
              !C(this).is(":disabled") &&
              $n.test(this.nodeName) &&
              !Fn.test(e) &&
              (this.checked || !St.test(e))
            );
          })
          .map(function (e, t) {
            var n = C(this).val();
            return null == n
              ? null
              : Array.isArray(n)
              ? C.map(n, function (e) {
                  return { name: t.name, value: e.replace(Wn, "\r\n") };
                })
              : { name: t.name, value: n.replace(Wn, "\r\n") };
          })
          .get();
      },
    });
  var Bn = /%20/g,
    _n = /#.*$/,
    zn = /([?&])_=[^&]*/,
    Xn = /^(.*?):[ \t]*([^\r\n]*)$/gm,
    Un = /^(?:GET|HEAD)$/,
    Vn = /^\/\//,
    Gn = {},
    Yn = {},
    Qn = "*/".concat("*"),
    Jn = T.createElement("a");
  function Kn(o) {
    return function (e, t) {
      "string" != typeof e && ((t = e), (e = "*"));
      var n,
        r = 0,
        i = e.toLowerCase().match(q) || [];
      if (v(t))
        for (; (n = i[r++]); )
          "+" === n[0]
            ? ((n = n.slice(1) || "*"), (o[n] = o[n] || []).unshift(t))
            : (o[n] = o[n] || []).push(t);
    };
  }
  function Zn(t, r, i, o) {
    var s = {},
      a = t === Yn;
    function u(e) {
      var n;
      return (
        (s[e] = !0),
        C.each(t[e] || [], function (e, t) {
          t = t(r, i, o);
          return "string" != typeof t || a || s[t]
            ? a
              ? !(n = t)
              : void 0
            : (r.dataTypes.unshift(t), u(t), !1);
        }),
        n
      );
    }
    return u(r.dataTypes[0]) || (!s["*"] && u("*"));
  }
  function er(e, t) {
    var n,
      r,
      i = C.ajaxSettings.flatOptions || {};
    for (n in t) void 0 !== t[n] && ((i[n] ? e : (r = r || {}))[n] = t[n]);
    return r && C.extend(!0, e, r), e;
  }
  (Jn.href = On.href),
    C.extend({
      active: 0,
      lastModified: {},
      etag: {},
      ajaxSettings: {
        url: On.href,
        type: "GET",
        isLocal:
          /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(
            On.protocol
          ),
        global: !0,
        processData: !0,
        async: !0,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        accepts: {
          "*": Qn,
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
          "text xml": C.parseXML,
        },
        flatOptions: { url: !0, context: !0 },
      },
      ajaxSetup: function (e, t) {
        return t ? er(er(e, C.ajaxSettings), t) : er(C.ajaxSettings, e);
      },
      ajaxPrefilter: Kn(Gn),
      ajaxTransport: Kn(Yn),
      ajax: function (e, t) {
        "object" == typeof e && ((t = e), (e = void 0));
        var u,
          l,
          c,
          n,
          f,
          p,
          d,
          r,
          h = C.ajaxSetup({}, (t = t || {})),
          g = h.context || h,
          y = h.context && (g.nodeType || g.jquery) ? C(g) : C.event,
          m = C.Deferred(),
          v = C.Callbacks("once memory"),
          x = h.statusCode || {},
          i = {},
          o = {},
          s = "canceled",
          b = {
            readyState: 0,
            getResponseHeader: function (e) {
              var t;
              if (p) {
                if (!n)
                  for (n = {}; (t = Xn.exec(c)); )
                    n[t[1].toLowerCase() + " "] = (
                      n[t[1].toLowerCase() + " "] || []
                    ).concat(t[2]);
                t = n[e.toLowerCase() + " "];
              }
              return null == t ? null : t.join(", ");
            },
            getAllResponseHeaders: function () {
              return p ? c : null;
            },
            setRequestHeader: function (e, t) {
              return (
                null == p &&
                  ((e = o[e.toLowerCase()] = o[e.toLowerCase()] || e),
                  (i[e] = t)),
                this
              );
            },
            overrideMimeType: function (e) {
              return null == p && (h.mimeType = e), this;
            },
            statusCode: function (e) {
              if (e)
                if (p) b.always(e[b.status]);
                else for (var t in e) x[t] = [x[t], e[t]];
              return this;
            },
            abort: function (e) {
              e = e || s;
              return u && u.abort(e), a(0, e), this;
            },
          };
        if (
          (m.promise(b),
          (h.url = ((e || h.url || On.href) + "").replace(
            Vn,
            On.protocol + "//"
          )),
          (h.type = t.method || t.type || h.method || h.type),
          (h.dataTypes = (h.dataType || "*").toLowerCase().match(q) || [""]),
          null == h.crossDomain)
        ) {
          e = T.createElement("a");
          try {
            (e.href = h.url),
              (e.href = e.href),
              (h.crossDomain =
                Jn.protocol + "//" + Jn.host != e.protocol + "//" + e.host);
          } catch (e) {
            h.crossDomain = !0;
          }
        }
        if (
          (h.data &&
            h.processData &&
            "string" != typeof h.data &&
            (h.data = C.param(h.data, h.traditional)),
          Zn(Gn, h, t, b),
          !p)
        ) {
          for (r in ((d = C.event && h.global) &&
            0 == C.active++ &&
            C.event.trigger("ajaxStart"),
          (h.type = h.type.toUpperCase()),
          (h.hasContent = !Un.test(h.type)),
          (l = h.url.replace(_n, "")),
          h.hasContent
            ? h.data &&
              h.processData &&
              0 ===
                (h.contentType || "").indexOf(
                  "application/x-www-form-urlencoded"
                ) &&
              (h.data = h.data.replace(Bn, "+"))
            : ((e = h.url.slice(l.length)),
              h.data &&
                (h.processData || "string" == typeof h.data) &&
                ((l += (Mn.test(l) ? "&" : "?") + h.data), delete h.data),
              !1 === h.cache &&
                ((l = l.replace(zn, "$1")),
                (e = (Mn.test(l) ? "&" : "?") + "_=" + Pn.guid++ + e)),
              (h.url = l + e)),
          h.ifModified &&
            (C.lastModified[l] &&
              b.setRequestHeader("If-Modified-Since", C.lastModified[l]),
            C.etag[l]) &&
            b.setRequestHeader("If-None-Match", C.etag[l]),
          ((h.data && h.hasContent && !1 !== h.contentType) || t.contentType) &&
            b.setRequestHeader("Content-Type", h.contentType),
          b.setRequestHeader(
            "Accept",
            h.dataTypes[0] && h.accepts[h.dataTypes[0]]
              ? h.accepts[h.dataTypes[0]] +
                  ("*" !== h.dataTypes[0] ? ", " + Qn + "; q=0.01" : "")
              : h.accepts["*"]
          ),
          h.headers))
            b.setRequestHeader(r, h.headers[r]);
          if (h.beforeSend && (!1 === h.beforeSend.call(g, b, h) || p))
            return b.abort();
          if (
            ((s = "abort"),
            v.add(h.complete),
            b.done(h.success),
            b.fail(h.error),
            (u = Zn(Yn, h, t, b)))
          ) {
            if (((b.readyState = 1), d && y.trigger("ajaxSend", [b, h]), p))
              return b;
            h.async &&
              0 < h.timeout &&
              (f = w.setTimeout(function () {
                b.abort("timeout");
              }, h.timeout));
            try {
              (p = !1), u.send(i, a);
            } catch (e) {
              if (p) throw e;
              a(-1, e);
            }
          } else a(-1, "No Transport");
        }
        return b;
        function a(e, t, n, r) {
          var i,
            o,
            s,
            a = t;
          p ||
            ((p = !0),
            f && w.clearTimeout(f),
            (u = void 0),
            (c = r || ""),
            (b.readyState = 0 < e ? 4 : 0),
            (r = (200 <= e && e < 300) || 304 === e),
            n &&
              (s = ((e, t, n) => {
                for (
                  var r, i, o, s, a = e.contents, u = e.dataTypes;
                  "*" === u[0];

                )
                  u.shift(),
                    void 0 === r &&
                      (r = e.mimeType || t.getResponseHeader("Content-Type"));
                if (r)
                  for (i in a)
                    if (a[i] && a[i].test(r)) {
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
                    s = s || i;
                  }
                  o = o || s;
                }
                if (o) return o !== u[0] && u.unshift(o), n[o];
              })(h, b, n)),
            !r &&
              -1 < C.inArray("script", h.dataTypes) &&
              C.inArray("json", h.dataTypes) < 0 &&
              (h.converters["text script"] = function () {}),
            (s = ((e, t, n, r) => {
              var i,
                o,
                s,
                a,
                u,
                l = {},
                c = e.dataTypes.slice();
              if (c[1])
                for (s in e.converters) l[s.toLowerCase()] = e.converters[s];
              for (o = c.shift(); o; )
                if (
                  (e.responseFields[o] && (n[e.responseFields[o]] = t),
                  !u && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)),
                  (u = o),
                  (o = c.shift()))
                )
                  if ("*" === o) o = u;
                  else if ("*" !== u && u !== o) {
                    if (!(s = l[u + " " + o] || l["* " + o]))
                      for (i in l)
                        if (
                          (a = i.split(" "))[1] === o &&
                          (s = l[u + " " + a[0]] || l["* " + a[0]])
                        ) {
                          !0 === s
                            ? (s = l[i])
                            : !0 !== l[i] && ((o = a[0]), c.unshift(a[1]));
                          break;
                        }
                    if (!0 !== s)
                      if (s && e.throws) t = s(t);
                      else
                        try {
                          t = s(t);
                        } catch (e) {
                          return {
                            state: "parsererror",
                            error: s
                              ? e
                              : "No conversion from " + u + " to " + o,
                          };
                        }
                  }
              return { state: "success", data: t };
            })(h, s, b, r)),
            r
              ? (h.ifModified &&
                  ((n = b.getResponseHeader("Last-Modified")) &&
                    (C.lastModified[l] = n),
                  (n = b.getResponseHeader("etag"))) &&
                  (C.etag[l] = n),
                204 === e || "HEAD" === h.type
                  ? (a = "nocontent")
                  : 304 === e
                  ? (a = "notmodified")
                  : ((a = s.state), (i = s.data), (r = !(o = s.error))))
              : ((o = a), (!e && a) || ((a = "error"), e < 0 && (e = 0))),
            (b.status = e),
            (b.statusText = (t || a) + ""),
            r ? m.resolveWith(g, [i, a, b]) : m.rejectWith(g, [b, a, o]),
            b.statusCode(x),
            (x = void 0),
            d && y.trigger(r ? "ajaxSuccess" : "ajaxError", [b, h, r ? i : o]),
            v.fireWith(g, [b, a]),
            d &&
              (y.trigger("ajaxComplete", [b, h]),
              --C.active || C.event.trigger("ajaxStop")));
        }
      },
      getJSON: function (e, t, n) {
        return C.get(e, t, n, "json");
      },
      getScript: function (e, t) {
        return C.get(e, void 0, t, "script");
      },
    }),
    C.each(["get", "post"], function (e, i) {
      C[i] = function (e, t, n, r) {
        return (
          v(t) && ((r = r || n), (n = t), (t = void 0)),
          C.ajax(
            C.extend(
              { url: e, type: i, dataType: r, data: t, success: n },
              C.isPlainObject(e) && e
            )
          )
        );
      };
    }),
    C.ajaxPrefilter(function (e) {
      for (var t in e.headers)
        "content-type" === t.toLowerCase() &&
          (e.contentType = e.headers[t] || "");
    }),
    (C._evalUrl = function (e, t, n) {
      return C.ajax({
        url: e,
        type: "GET",
        dataType: "script",
        cache: !0,
        async: !1,
        global: !1,
        converters: { "text script": function () {} },
        dataFilter: function (e) {
          C.globalEval(e, t, n);
        },
      });
    }),
    C.fn.extend({
      wrapAll: function (e) {
        return (
          this[0] &&
            (v(e) && (e = e.call(this[0])),
            (e = C(e, this[0].ownerDocument).eq(0).clone(!0)),
            this[0].parentNode && e.insertBefore(this[0]),
            e
              .map(function () {
                for (var e = this; e.firstElementChild; )
                  e = e.firstElementChild;
                return e;
              })
              .append(this)),
          this
        );
      },
      wrapInner: function (n) {
        return v(n)
          ? this.each(function (e) {
              C(this).wrapInner(n.call(this, e));
            })
          : this.each(function () {
              var e = C(this),
                t = e.contents();
              t.length ? t.wrapAll(n) : e.append(n);
            });
      },
      wrap: function (t) {
        var n = v(t);
        return this.each(function (e) {
          C(this).wrapAll(n ? t.call(this, e) : t);
        });
      },
      unwrap: function (e) {
        return (
          this.parent(e)
            .not("body")
            .each(function () {
              C(this).replaceWith(this.childNodes);
            }),
          this
        );
      },
    }),
    (C.expr.pseudos.hidden = function (e) {
      return !C.expr.pseudos.visible(e);
    }),
    (C.expr.pseudos.visible = function (e) {
      return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
    }),
    (C.ajaxSettings.xhr = function () {
      try {
        return new w.XMLHttpRequest();
      } catch (e) {}
    });
  var tr = { 0: 200, 1223: 204 },
    nr = C.ajaxSettings.xhr(),
    rr =
      ((g.cors = !!nr && "withCredentials" in nr),
      (g.ajax = nr = !!nr),
      C.ajaxTransport(function (i) {
        var o, s;
        if (g.cors || (nr && !i.crossDomain))
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
                      s =
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
                          tr[r.status] || r.status,
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
                (s = r.onerror = r.ontimeout = o("error")),
                void 0 !== r.onabort
                  ? (r.onabort = s)
                  : (r.onreadystatechange = function () {
                      4 === r.readyState &&
                        w.setTimeout(function () {
                          o && s();
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
      C.ajaxPrefilter(function (e) {
        e.crossDomain && (e.contents.script = !1);
      }),
      C.ajaxSetup({
        accepts: {
          script:
            "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
        },
        contents: { script: /\b(?:java|ecma)script\b/ },
        converters: {
          "text script": function (e) {
            return C.globalEval(e), e;
          },
        },
      }),
      C.ajaxPrefilter("script", function (e) {
        void 0 === e.cache && (e.cache = !1), e.crossDomain && (e.type = "GET");
      }),
      C.ajaxTransport("script", function (n) {
        var r, i;
        if (n.crossDomain || n.scriptAttrs)
          return {
            send: function (e, t) {
              (r = C("<script>")
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
                T.head.appendChild(r[0]);
            },
            abort: function () {
              i && i();
            },
          };
      }),
      []),
    ir = /(=)\?(?=&|$)|\?\?/,
    or =
      (C.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function () {
          var e = rr.pop() || C.expando + "_" + Pn.guid++;
          return (this[e] = !0), e;
        },
      }),
      C.ajaxPrefilter("json jsonp", function (e, t, n) {
        var r,
          i,
          o,
          s =
            !1 !== e.jsonp &&
            (ir.test(e.url)
              ? "url"
              : "string" == typeof e.data &&
                0 ===
                  (e.contentType || "").indexOf(
                    "application/x-www-form-urlencoded"
                  ) &&
                ir.test(e.data) &&
                "data");
        if (s || "jsonp" === e.dataTypes[0])
          return (
            (r = e.jsonpCallback =
              v(e.jsonpCallback) ? e.jsonpCallback() : e.jsonpCallback),
            s
              ? (e[s] = e[s].replace(ir, "$1" + r))
              : !1 !== e.jsonp &&
                (e.url += (Mn.test(e.url) ? "&" : "?") + e.jsonp + "=" + r),
            (e.converters["script json"] = function () {
              return o || C.error(r + " was not called"), o[0];
            }),
            (e.dataTypes[0] = "json"),
            (i = w[r]),
            (w[r] = function () {
              o = arguments;
            }),
            n.always(function () {
              void 0 === i ? C(w).removeProp(r) : (w[r] = i),
                e[r] && ((e.jsonpCallback = t.jsonpCallback), rr.push(r)),
                o && v(i) && i(o[0]),
                (o = i = void 0);
            }),
            "script"
          );
      }),
      (g.createHTMLDocument =
        (((e = T.implementation.createHTMLDocument("").body).innerHTML =
          "<form></form><form></form>"),
        2 === e.childNodes.length)),
      (C.parseHTML = function (e, t, n) {
        var r;
        return "string" != typeof e
          ? []
          : ("boolean" == typeof t && ((n = t), (t = !1)),
            t ||
              (g.createHTMLDocument
                ? (((r = (t =
                    T.implementation.createHTMLDocument("")).createElement(
                    "base"
                  )).href = T.location.href),
                  t.head.appendChild(r))
                : (t = T)),
            (r = !n && []),
            (n = Ge.exec(e))
              ? [t.createElement(n[1])]
              : ((n = Dt([e], t, r)),
                r && r.length && C(r).remove(),
                C.merge([], n.childNodes)));
      }),
      (C.fn.load = function (e, t, n) {
        var r,
          i,
          o,
          s = this,
          a = e.indexOf(" ");
        return (
          -1 < a && ((r = Dn(e.slice(a))), (e = e.slice(0, a))),
          v(t)
            ? ((n = t), (t = void 0))
            : t && "object" == typeof t && (i = "POST"),
          0 < s.length &&
            C.ajax({ url: e, type: i || "GET", dataType: "html", data: t })
              .done(function (e) {
                (o = arguments),
                  s.html(r ? C("<div>").append(C.parseHTML(e)).find(r) : e);
              })
              .always(
                n &&
                  function (e, t) {
                    s.each(function () {
                      n.apply(this, o || [e.responseText, t, e]);
                    });
                  }
              ),
          this
        );
      }),
      (C.expr.pseudos.animated = function (t) {
        return C.grep(C.timers, function (e) {
          return t === e.elem;
        }).length;
      }),
      (C.offset = {
        setOffset: function (e, t, n) {
          var r,
            i,
            o,
            s,
            a = C.css(e, "position"),
            u = C(e),
            l = {};
          "static" === a && (e.style.position = "relative"),
            (o = u.offset()),
            (r = C.css(e, "top")),
            (s = C.css(e, "left")),
            (a =
              ("absolute" === a || "fixed" === a) &&
              -1 < (r + s).indexOf("auto")
                ? ((i = (a = u.position()).top), a.left)
                : ((i = parseFloat(r) || 0), parseFloat(s) || 0)),
            null != (t = v(t) ? t.call(e, n, C.extend({}, o)) : t).top &&
              (l.top = t.top - o.top + i),
            null != t.left && (l.left = t.left - o.left + a),
            "using" in t ? t.using.call(e, l) : u.css(l);
        },
      }),
      C.fn.extend({
        offset: function (t) {
          var e, n;
          return arguments.length
            ? void 0 === t
              ? this
              : this.each(function (e) {
                  C.offset.setOffset(this, t, e);
                })
            : (n = this[0])
            ? n.getClientRects().length
              ? ((e = n.getBoundingClientRect()),
                (n = n.ownerDocument.defaultView),
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
            if ("fixed" === C.css(r, "position")) t = r.getBoundingClientRect();
            else {
              for (
                t = this.offset(),
                  n = r.ownerDocument,
                  e = r.offsetParent || n.documentElement;
                e &&
                (e === n.body || e === n.documentElement) &&
                "static" === C.css(e, "position");

              )
                e = e.parentNode;
              e &&
                e !== r &&
                1 === e.nodeType &&
                (((i = C(e).offset()).top += C.css(e, "borderTopWidth", !0)),
                (i.left += C.css(e, "borderLeftWidth", !0)));
            }
            return {
              top: t.top - i.top - C.css(r, "marginTop", !0),
              left: t.left - i.left - C.css(r, "marginLeft", !0),
            };
          }
        },
        offsetParent: function () {
          return this.map(function () {
            for (
              var e = this.offsetParent;
              e && "static" === C.css(e, "position");

            )
              e = e.offsetParent;
            return e || vt;
          });
        },
      }),
      C.each(
        { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" },
        function (t, i) {
          var o = "pageYOffset" === i;
          C.fn[t] = function (e) {
            return c(
              this,
              function (e, t, n) {
                var r;
                if (
                  (R(e) ? (r = e) : 9 === e.nodeType && (r = e.defaultView),
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
      C.each(["top", "left"], function (e, n) {
        C.cssHooks[n] = sn(g.pixelPosition, function (e, t) {
          if (t)
            return (t = on(e, n)), Zt.test(t) ? C(e).position()[n] + "px" : t;
        });
      }),
      C.each({ Height: "height", Width: "width" }, function (s, a) {
        C.each(
          { padding: "inner" + s, content: a, "": "outer" + s },
          function (r, o) {
            C.fn[o] = function (e, t) {
              var n = arguments.length && (r || "boolean" != typeof e),
                i = r || (!0 === e || !0 === t ? "margin" : "border");
              return c(
                this,
                function (e, t, n) {
                  var r;
                  return R(e)
                    ? 0 === o.indexOf("outer")
                      ? e["inner" + s]
                      : e.document.documentElement["client" + s]
                    : 9 === e.nodeType
                    ? ((r = e.documentElement),
                      Math.max(
                        e.body["scroll" + s],
                        r["scroll" + s],
                        e.body["offset" + s],
                        r["offset" + s],
                        r["client" + s]
                      ))
                    : void 0 === n
                    ? C.css(e, t, i)
                    : C.style(e, t, n, i);
                },
                a,
                n ? e : void 0,
                n
              );
            };
          }
        );
      }),
      C.each(
        [
          "ajaxStart",
          "ajaxStop",
          "ajaxComplete",
          "ajaxError",
          "ajaxSuccess",
          "ajaxSend",
        ],
        function (e, t) {
          C.fn[t] = function (e) {
            return this.on(t, e);
          };
        }
      ),
      C.fn.extend({
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
      C.each(
        "blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(
          " "
        ),
        function (e, n) {
          C.fn[n] = function (e, t) {
            return 0 < arguments.length
              ? this.on(n, null, e, t)
              : this.trigger(n);
          };
        }
      ),
      /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g),
    sr =
      ((C.proxy = function (e, t) {
        var n, r;
        if (("string" == typeof t && ((r = e[t]), (t = e), (e = r)), v(e)))
          return (
            (n = a.call(arguments, 2)),
            ((r = function () {
              return e.apply(t || this, n.concat(a.call(arguments)));
            }).guid = e.guid =
              e.guid || C.guid++),
            r
          );
      }),
      (C.holdReady = function (e) {
        e ? C.readyWait++ : C.ready(!0);
      }),
      (C.isArray = Array.isArray),
      (C.parseJSON = JSON.parse),
      (C.nodeName = b),
      (C.isFunction = v),
      (C.isWindow = R),
      (C.camelCase = L),
      (C.type = G),
      (C.now = Date.now),
      (C.isNumeric = function (e) {
        var t = C.type(e);
        return ("number" === t || "string" === t) && !isNaN(e - parseFloat(e));
      }),
      (C.trim = function (e) {
        return null == e ? "" : (e + "").replace(or, "$1");
      }),
      "function" == typeof define &&
        define.amd &&
        define("jquery", [], function () {
          return C;
        }),
      w.jQuery),
    ar = w.$;
  return (
    (C.noConflict = function (e) {
      return w.$ === C && (w.$ = ar), e && w.jQuery === C && (w.jQuery = sr), C;
    }),
    void 0 === M && (w.jQuery = w.$ = C),
    C
  );
});

// dataTables.js
((n) => {
  var a;
  "function" == typeof define && define.amd
    ? define(["jquery"], function (e) {
        return n(e, window, document);
      })
    : "object" == typeof exports
    ? ((a = require("jquery")),
      (module.exports =
        "undefined" == typeof window
          ? function (e, t) {
              return (e ||= window), (t ||= a(e)), n(t, e, e.document);
            }
          : n(a, window, window.document)))
    : (window.DataTable = n(jQuery, window, document));
})(function (P, k, D) {
  function m(t, e) {
    e &&
      e.split(" ").forEach(function (e) {
        e && t.classList.add(e);
      });
  }
  function i(t) {
    var n,
      a,
      r = {};
    P.each(t, function (e) {
      (n = e.match(/^([^A-Z]+?)([A-Z])/)) &&
        -1 !== "a aa ai ao as b fn i m o s ".indexOf(n[1] + " ") &&
        ((a = e.replace(n[0], n[2].toLowerCase())), (r[a] = e), "o" === n[1]) &&
        i(t[e]);
    }),
      (t._hungarianMap = r);
  }
  function E(t, n, a) {
    var r;
    t._hungarianMap || i(t),
      P.each(n, function (e) {
        void 0 === (r = t._hungarianMap[e]) ||
          (!a && void 0 !== n[r]) ||
          ("o" === r.charAt(0)
            ? (n[r] || (n[r] = {}), P.extend(!0, n[r], n[e]), E(t[r], n[r], a))
            : (n[r] = n[e]));
      });
  }
  function z(e) {
    r(e, "ordering", "bSort"),
      r(e, "orderMulti", "bSortMulti"),
      r(e, "orderClasses", "bSortClasses"),
      r(e, "orderCellsTop", "bSortCellsTop"),
      r(e, "order", "aaSorting"),
      r(e, "orderFixed", "aaSortingFixed"),
      r(e, "paging", "bPaginate"),
      r(e, "pagingType", "sPaginationType"),
      r(e, "pageLength", "iDisplayLength"),
      r(e, "searching", "bFilter"),
      "boolean" == typeof e.sScrollX && (e.sScrollX = e.sScrollX ? "100%" : ""),
      "boolean" == typeof e.scrollX && (e.scrollX = e.scrollX ? "100%" : "");
    var t = e.aoSearchCols;
    if (t)
      for (var n = 0, a = t.length; n < a; n++)
        t[n] && E(q.models.oSearch, t[n]);
    e.serverSide && !e.searchDelay && (e.searchDelay = 400);
  }
  function Y(e) {
    r(e, "orderable", "bSortable"),
      r(e, "orderData", "aDataSort"),
      r(e, "orderSequence", "asSorting"),
      r(e, "orderDataType", "sortDataType");
    var t = e.aDataSort;
    "number" != typeof t || Array.isArray(t) || (e.aDataSort = [t]);
  }
  function G(e) {
    var t = q.defaults.column,
      n = e.aoColumns.length,
      t = P.extend({}, q.models.oColumn, t, {
        aDataSort: t.aDataSort || [n],
        mData: t.mData || n,
        idx: n,
        searchFixed: {},
        colEl: P("<col>").attr("data-dt-column", n),
      });
    e.aoColumns.push(t),
      ((e = e.aoPreSearchCols)[n] = P.extend({}, q.models.oSearch, e[n]));
  }
  function J(e, t, n) {
    var r = e.aoColumns[t],
      a =
        (null != n &&
          (Y(n),
          E(q.defaults.column, n, !0),
          void 0 === n.mDataProp || n.mData || (n.mData = n.mDataProp),
          n.sType && (r._sManualType = n.sType),
          n.className && !n.sClass && (n.sClass = n.className),
          (t = r.sClass),
          P.extend(r, n),
          W(r, n, "sWidth", "sWidthOrig"),
          t !== r.sClass && (r.sClass = t + " " + r.sClass),
          void 0 !== n.iDataSort && (r.aDataSort = [n.iDataSort]),
          W(r, n, "aDataSort")),
        r.mData),
      o = U(a);
    r.mRender &&
      Array.isArray(r.mRender) &&
      ((t = (n = r.mRender.slice()).shift()),
      (r.mRender = q.render[t].apply(k, n))),
      (r._render = r.mRender ? U(r.mRender) : null),
      (n = function (e) {
        return "string" == typeof e && -1 !== e.indexOf("@");
      }),
      (r._bAttrSrc =
        P.isPlainObject(a) && (n(a.sort) || n(a.type) || n(a.filter))),
      (r._setter = null),
      (r.fnGetData = function (e, t, n) {
        var a = o(e, t, void 0, n);
        return r._render && t ? r._render(a, t, e, n) : a;
      }),
      (r.fnSetData = function (e, t, n) {
        return g(a)(e, t, n);
      }),
      "number" == typeof a || r._isArrayHost || (e._rowReadObject = !0),
      e.oFeatures.bSort || (r.bSortable = !1);
  }
  function L(e) {
    var t = e;
    if (t.oFeatures.bAutoWidth) {
      var n = t.nTable,
        a = t.aoColumns,
        r = t.oScroll,
        o = r.sY,
        i = r.sX,
        l = r.sXInner,
        s = ((r = F(t, "bVisible")), n.getAttribute("width")),
        u = n.parentNode,
        c = n.style.width,
        d =
          ((c = c || s ? c : (n.style.width = "100%")) &&
            -1 !== c.indexOf("%") &&
            (s = c),
          V(t, null, "column-calc", { visible: r }, !1),
          P(n.cloneNode()).css("visibility", "hidden").removeAttr("id")),
        f = (d.append("<tbody>"), P("<tr/>").appendTo(d.find("tbody")));
      for (
        d.append(P(t.nTHead).clone()).append(P(t.nTFoot).clone()),
          d.find("tfoot th, tfoot td").css("width", ""),
          d.find("thead th, thead td").each(function () {
            var e = O(t, this, !0, !1);
            e
              ? ((this.style.width = e),
                i &&
                  P(this).append(
                    P("<div/>").css({
                      width: e,
                      margin: 0,
                      padding: 0,
                      border: 0,
                      height: 1,
                    })
                  ))
              : (this.style.width = "");
          }),
          c = 0;
        c < r.length;
        c++
      ) {
        var h = r[c],
          p = a[h],
          g = ((e, t) => {
            var n = e.aoColumns[t];
            if (!n.maxLenString) {
              for (
                var a, r = "", o = -1, i = 0, l = e.aiDisplayMaster.length;
                i < l;
                i++
              ) {
                var s =
                  (a = ae(e, e.aiDisplayMaster[i])[t]) &&
                  "object" == typeof a &&
                  a.nodeType
                    ? a.innerHTML
                    : a + "";
                (s = s.replace(/id=".*?"/g, "").replace(/name=".*?"/g, "")),
                  (a = _(s).replace(/&nbsp;/g, " ")).length > o &&
                    ((r = s), (o = a.length));
              }
              n.maxLenString = r;
            }
            return n.maxLenString;
          })(t, h),
          m = ((h = S.type.className[p.sType]), g + p.sContentPadding);
        (g = -1 === g.indexOf("<") ? D.createTextNode(m) : m),
          P("<td/>").addClass(h).addClass(p.sClass).append(g).appendTo(f);
      }
      for (
        P("[name]", d).removeAttr("name"),
          p = P("<div/>")
            .css(
              i || o
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
            .append(d)
            .appendTo(u),
          i && l
            ? d.width(l)
            : i
            ? (d.css("width", "auto"),
              d.removeAttr("width"),
              d.width() < u.clientWidth && s && d.width(u.clientWidth))
            : o
            ? d.width(u.clientWidth)
            : s && d.width(s),
          o = 0,
          l = d.find("tbody tr").eq(0).children(),
          c = 0;
        c < r.length;
        c++
      )
        (u = l[c].getBoundingClientRect().width),
          (o += u),
          (a[r[c]].sWidth = x(u));
      (n.style.width = x(o)),
        p.remove(),
        s && (n.style.width = x(s)),
        (!s && !i) ||
          t._reszEvt ||
          (P(k).on(
            "resize.DT-" + t.sInstance,
            q.util.throttle(function () {
              t.bDestroying || L(t);
            })
          ),
          (t._reszEvt = !0));
    }
    for (var v = e.aoColumns, b = 0; b < v.length; b++) {
      var y = O(e, [b], !1, !1);
      v[b].colEl.css("width", y);
    }
    ("" === (v = e.oScroll).sY && "" === v.sX) || Te(e),
      V(e, null, "column-sizing", [e]);
  }
  function I(e, t) {
    return "number" == typeof (e = F(e, "bVisible"))[t] ? e[t] : null;
  }
  function A(e, t) {
    return -1 !== (e = F(e, "bVisible").indexOf(t)) ? e : null;
  }
  function s(e) {
    var t = e.aoHeader,
      n = ((e = e.aoColumns), 0);
    if (t.length)
      for (var a = 0, r = t[0].length; a < r; a++)
        e[a].bVisible && "none" !== P(t[0][a].cell).css("display") && n++;
    return n;
  }
  function F(e, n) {
    var a = [];
    return (
      e.aoColumns.map(function (e, t) {
        e[n] && a.push(t);
      }),
      a
    );
  }
  function N(e, t) {
    return !0 === t ? e._name : t;
  }
  function j(e) {
    for (
      var t,
        n = e.aoColumns,
        a = e.aoData,
        r = q.ext.type.detect,
        o = 0,
        i = n.length;
      o < i;
      o++
    ) {
      var l = n[o],
        s = [];
      if (!l.sType && l._sManualType) l.sType = l._sManualType;
      else if (!l.sType) {
        if (!e.typeDetect) break;
        for (var u = 0, c = r.length; u < c; u++) {
          var d = r[u],
            f = d.oneOf,
            h = d.allOf || d,
            p = d.init,
            g = !1,
            m = null;
          if (p && (m = N(d, p(e, l, o)))) {
            l.sType = m;
            break;
          }
          for (p = 0, t = a.length; p < t; p++)
            if (a[p]) {
              if (
                (void 0 === s[p] && (s[p] = M(e, p, o, "type")),
                f && !g && (g = N(d, f(s[p], e))),
                !(m = N(d, h(s[p], e))) && u !== r.length - 3)
              )
                break;
              if ("html" === m && !w(s[p])) break;
            }
          if ((f && g && m) || (!f && m)) {
            l.sType = m;
            break;
          }
        }
        l.sType || (l.sType = "string");
      }
      if (
        ((u = S.type.className[l.sType]) &&
          (R(e.aoHeader, o, u), R(e.aoFooter, o, u)),
        (u = S.type.render[l.sType]) && !l._render)
      )
        for (
          l._render = q.util.get(u), u = o, c = (l = e).aoData, m = 0;
          m < c.length;
          m++
        )
          c[m].nTr &&
            ((s = M(l, m, u, "display")),
            (c[m].displayData[u] = s),
            K(c[m].anCells[u], s));
    }
  }
  function R(e, t, n) {
    e.forEach(function (e) {
      e[t] && e[t].unique && m(e[t].cell, n);
    });
  }
  function O(e, t, n, a) {
    Array.isArray(t) || (t = Z(t));
    var r = 0;
    e = e.aoColumns;
    for (var o = 0, i = t.length; o < i; o++) {
      var l,
        s = e[t[o]],
        u = n ? s.sWidthOrig : s.sWidth;
      if (a || !1 !== s.bVisible) {
        if (null == u) return null;
        "number" == typeof u
          ? ((l = "px"), (r += u))
          : (s = u.match(/([\d\.]+)([^\d]*)/)) &&
            ((r += +s[1]), (l = 3 === s.length ? s[2] : "px"));
      }
    }
    return r + l;
  }
  function Z(e) {
    return (e = P(e).closest("[data-dt-column]").attr("data-dt-column"))
      ? e.split(",").map(function (e) {
          return +e;
        })
      : [];
  }
  function v(e, t, n, a) {
    var r = e.aoData.length,
      o = P.extend(!0, {}, q.models.oRow, { src: n ? "dom" : "data", idx: r });
    (o._aData = t), e.aoData.push(o);
    for (var i = e.aoColumns, l = 0, s = i.length; l < s; l++)
      i[l].sType = null;
    return (
      e.aiDisplayMaster.push(r),
      void 0 !== (t = e.rowIdFn(t)) && (e.aIds[t] = o),
      (!n && e.oFeatures.bDeferRender) || re(e, r, n, a),
      r
    );
  }
  function Q(n, e) {
    var a;
    return (e = e instanceof P ? e : P(e)).map(function (e, t) {
      return (a = ne(n, t)), v(n, a.data, t, a.cells);
    });
  }
  function M(e, t, n, a) {
    if (
      ("search" === a ? (a = "filter") : "order" === a && (a = "sort"),
      (s = e.aoData[t]))
    ) {
      var r = e.iDraw,
        o = e.aoColumns[n],
        i = s._aData,
        l = o.sDefaultContent,
        s = o.fnGetData(i, a, { settings: e, row: t, col: n });
      if (
        void 0 ===
        (s =
          "display" !== a && s && "object" == typeof s && s.nodeName
            ? s.innerHTML
            : s)
      )
        return (
          e.iDrawError != r &&
            null === l &&
            (H(
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
        : (s =
            "filter" === a && (e = q.ext.type.search)[o.sType]
              ? e[o.sType](s)
              : s);
    }
  }
  function K(e, t) {
    t && "object" == typeof t && t.nodeName
      ? P(e).empty().append(t)
      : (e.innerHTML = t);
  }
  function ee(e) {
    return (e.match(/(\\.|[^.])+/g) || [""]).map(function (e) {
      return e.replace(/\\\./g, ".");
    });
  }
  function te(e) {
    (e.aoData.length = 0),
      (e.aiDisplayMaster.length = 0),
      (e.aiDisplay.length = 0),
      (e.aIds = {});
  }
  function l(e, t, n, a) {
    var r = e.aoData[t];
    if (
      ((r._aSortData = null),
      (r._aFilterData = null),
      (r.displayData = null),
      "dom" !== n && ((n && "auto" !== n) || "dom" !== r.src))
    ) {
      var o = r.anCells,
        i = ae(e, t);
      if (o)
        if (void 0 !== a) K(o[a], i[a]);
        else for (t = 0, n = o.length; t < n; t++) K(o[t], i[t]);
    } else r._aData = ne(e, r, a, void 0 === a ? void 0 : r._aData).data;
    if (((o = e.aoColumns), void 0 !== a))
      (o[a].sType = null), (o[a].maxLenString = null);
    else {
      for (t = 0, n = o.length; t < n; t++)
        (o[t].sType = null), (o[t].maxLenString = null);
      oe(e, r);
    }
  }
  function ne(e, t, n, a) {
    function r(e, t) {
      var n;
      "string" == typeof e &&
        -1 !== (n = e.indexOf("@")) &&
        ((n = e.substring(n + 1)), g(e)(a, t.getAttribute(n)));
    }
    function o(e) {
      (void 0 !== n && n !== c) ||
        ((i = d[c]),
        (l = e.innerHTML.trim()),
        i && i._bAttrSrc
          ? (g(i.mData._)(a, l),
            r(i.mData.sort, e),
            r(i.mData.type, e),
            r(i.mData.filter, e))
          : f
          ? (i._setter || (i._setter = g(i.mData)), i._setter(a, l))
          : (a[c] = l)),
        c++;
    }
    var i,
      l,
      s = [],
      u = t.firstChild,
      c = 0,
      d = e.aoColumns,
      f = e._rowReadObject;
    a = void 0 !== a ? a : f ? {} : [];
    if (u)
      for (; u; ) {
        var h = u.nodeName.toUpperCase();
        ("TD" != h && "TH" != h) || (o(u), s.push(u)), (u = u.nextSibling);
      }
    else for (u = 0, h = (s = t.anCells).length; u < h; u++) o(s[u]);
    return (
      (t = (t = t.firstChild ? t : t.nTr) && t.getAttribute("id")) &&
        g(e.rowId)(a, t),
      { data: a, cells: s }
    );
  }
  function ae(e, t) {
    var n = e.aoData[t],
      a = e.aoColumns;
    if (!n.displayData) {
      n.displayData = [];
      for (var r = 0, a = a.length; r < a; r++)
        n.displayData.push(M(e, t, r, "display"));
    }
    return n.displayData;
  }
  function re(e, t, n, a) {
    var r,
      o = e.aoData[t],
      i = o._aData,
      l = [],
      s = e.oClasses.tbody.row;
    if (null === o.nTr) {
      for (
        var u = n || D.createElement("tr"),
          c =
            ((o.nTr = u),
            (o.anCells = l),
            m(u, s),
            (u._DT_RowIndex = t),
            oe(e, o),
            0),
          d = e.aoColumns.length;
        c < d;
        c++
      ) {
        (s = e.aoColumns[c]),
          (o = (r = !n || !a[c]) ? D.createElement(s.sCellType) : a[c]) ||
            H(e, 0, "Incorrect column count", 18),
          (o._DT_CellIndex = { row: t, column: c }),
          l.push(o);
        var f = ae(e, t);
        (!r &&
          ((!s.mRender && s.mData === c) ||
            (P.isPlainObject(s.mData) && s.mData._ === c + ".display"))) ||
          K(o, f[c]),
          m(o, s.sClass),
          s.bVisible && r
            ? u.appendChild(o)
            : s.bVisible || r || o.parentNode.removeChild(o),
          s.fnCreatedCell &&
            s.fnCreatedCell.call(e.oInstance, o, M(e, t, c), i, t, c);
      }
      V(e, "aoRowCreatedCallback", "row-created", [u, i, t, l]);
    } else m(o.nTr, s);
  }
  function oe(e, t) {
    var n = t.nTr,
      a = t._aData;
    n &&
      ((e = e.rowIdFn(a)) && (n.id = e),
      a.DT_RowClass &&
        ((e = a.DT_RowClass.split(" ")),
        (t.__rowc = t.__rowc ? C(t.__rowc.concat(e)) : e),
        P(n).removeClass(t.__rowc.join(" ")).addClass(a.DT_RowClass)),
      a.DT_RowAttr && P(n).attr(a.DT_RowAttr),
      a.DT_RowData) &&
      P(n).data(a.DT_RowData);
  }
  function ie(e, t) {
    var n = e.oClasses,
      a = e.aoColumns,
      r = "header" === t ? e.nTHead : e.nTFoot,
      o = "header" === t ? "sTitle" : t;
    if (r) {
      if ("header" === t || T(e.aoColumns, o).join("")) {
        var i = P("tr", r);
        if (1 === (i = i.length ? i : P("<tr/>").appendTo(r)).length)
          for (var l = P("td, th", i).length, s = a.length; l < s; l++)
            P("<th/>")
              .html(a[l][o] || "")
              .appendTo(i);
      }
      (a = fe(e, r, !0)),
        "header" === t ? (e.aoHeader = a) : (e.aoFooter = a),
        P(r)
          .children("tr")
          .children("th, td")
          .each(function () {
            Ee(e, t)(e, P(this), n);
          });
    }
  }
  function le(e, t, n) {
    var a,
      r,
      o = [],
      i = [],
      l = e.aoColumns;
    if (((e = l.length), t)) {
      for (
        n ||= d(e).filter(function (e) {
          return l[e].bVisible;
        }),
          e = 0;
        e < t.length;
        e++
      )
        (o[e] = t[e].slice().filter(function (e, t) {
          return n.includes(t);
        })),
          i.push([]);
      for (e = 0; e < o.length; e++)
        for (t = 0; t < o[e].length; t++) {
          var s = (r = 1);
          if (void 0 === i[e][t]) {
            for (
              a = o[e][t].cell;
              void 0 !== o[e + r] && o[e][t].cell == o[e + r][t].cell;

            )
              (i[e + r][t] = null), r++;
            for (
              ;
              void 0 !== o[e][t + s] && o[e][t].cell == o[e][t + s].cell;

            ) {
              for (var u = 0; u < r; u++) i[e + u][t + s] = null;
              s++;
            }
            (u = P("span.dt-column-title", a)),
              (i[e][t] = {
                cell: a,
                colspan: s,
                rowspan: r,
                title: (u.length ? u : P(a)).html(),
              });
          }
        }
      return i;
    }
  }
  function se(e, t) {
    e = le(e, t);
    for (var n, a, r = 0; r < t.length; r++) {
      if ((n = t[r].row)) for (; (a = n.firstChild); ) n.removeChild(a);
      for (a = 0; a < e[r].length; a++) {
        var o = e[r][a];
        o &&
          P(o.cell)
            .appendTo(n)
            .attr("rowspan", o.rowspan)
            .attr("colspan", o.colspan);
      }
    }
  }
  function b(e, t) {
    var r,
      n = "ssp" == B(e);
    if (
      (void 0 !== (a = e.iInitDisplayStart) &&
        -1 !== a &&
        ((e._iDisplayStart = !n && a >= e.fnRecordsDisplay() ? 0 : a),
        (e.iInitDisplayStart = -1)),
      -1 !== V(e, "aoPreDrawCallback", "preDraw", [e]).indexOf(!1))
    )
      y(e, !1);
    else {
      var n = [],
        a = 0,
        o = "ssp" == B(e),
        i = e.aiDisplay,
        l = e._iDisplayStart,
        s = e.fnDisplayEnd(),
        u = e.aoColumns,
        c = P(e.nTBody);
      if (((e.bDrawing = !0), e.deferLoading))
        (e.deferLoading = !1), e.iDraw++, y(e, !1);
      else if (o) {
        if (!e.bDestroying && !t)
          return (
            0 === e.iDraw && c.empty().append(ue(e)),
            (r = e).iDraw++,
            y(r, !0),
            void he(
              r,
              ((t) => {
                function n(e, t) {
                  return "function" == typeof a[e][t] ? "function" : a[e][t];
                }
                var a = t.aoColumns,
                  e = t.oFeatures,
                  r = t.oPreviousSearch,
                  o = t.aoPreSearchCols;
                return {
                  draw: t.iDraw,
                  columns: a.map(function (t, e) {
                    return {
                      data: n(e, "mData"),
                      name: t.sName,
                      searchable: t.bSearchable,
                      orderable: t.bSortable,
                      search: {
                        value: o[e].search,
                        regex: o[e].regex,
                        fixed: Object.keys(t.searchFixed).map(function (e) {
                          return { name: e, term: t.searchFixed[e].toString() };
                        }),
                      },
                    };
                  }),
                  order: Ae(t).map(function (e) {
                    return {
                      column: e.col,
                      dir: e.dir,
                      name: n(e.col, "sName"),
                    };
                  }),
                  start: t._iDisplayStart,
                  length: e.bPaginate ? t._iDisplayLength : -1,
                  search: {
                    value: r.search,
                    regex: r.regex,
                    fixed: Object.keys(t.searchFixed).map(function (e) {
                      return { name: e, term: t.searchFixed[e].toString() };
                    }),
                  },
                };
              })(r),
              function (e) {
                e: {
                  var t = pe(r, e),
                    n = ge(r, "draw", e),
                    a = ge(r, "recordsTotal", e);
                  if (((e = ge(r, "recordsFiltered", e)), void 0 !== n)) {
                    if (+n < r.iDraw) break e;
                    r.iDraw = +n;
                  }
                  for (
                    t ||= [],
                      te(r),
                      r._iRecordsTotal = parseInt(a, 10),
                      r._iRecordsDisplay = parseInt(e, 10),
                      n = 0,
                      a = t.length;
                    n < a;
                    n++
                  )
                    v(r, t[n]);
                  (r.aiDisplay = r.aiDisplayMaster.slice()),
                    j(r),
                    b(r, !0),
                    ye(r),
                    y(r, !1);
                }
              }
            )
          );
      } else e.iDraw++;
      if (0 !== i.length)
        for (t = o ? e.aoData.length : s, o = o ? 0 : l; o < t; o++) {
          var d = i[o],
            f = e.aoData[d];
          null === f.nTr && re(e, d);
          for (var h = f.nTr, p = 0; p < u.length; p++) {
            var g = f.anCells[p];
            m(g, S.type.className[u[p].sType]), m(g, e.oClasses.tbody.cell);
          }
          V(e, "aoRowCallback", null, [h, f._aData, a, o, d]), n.push(h), a++;
        }
      else n[0] = ue(e);
      V(e, "aoHeaderCallback", "header", [
        P(e.nTHead).children("tr")[0],
        T(e.aoData, "_aData"),
        l,
        s,
        i,
      ]),
        V(e, "aoFooterCallback", "footer", [
          P(e.nTFoot).children("tr")[0],
          T(e.aoData, "_aData"),
          l,
          s,
          i,
        ]),
        c[0].replaceChildren
          ? c[0].replaceChildren.apply(c[0], n)
          : (c.children().detach(), c.append(P(n))),
        P(e.nTableWrapper).toggleClass(
          "dt-empty-footer",
          0 === P("tr", e.nTFoot).length
        ),
        V(e, "aoDrawCallback", "draw", [e], !0),
        (e.bSorted = !1),
        (e.bFiltered = !1),
        (e.bDrawing = !1);
    }
  }
  function c(e, t, n) {
    var a = (r = e.oFeatures).bSort,
      r = r.bFilter;
    (void 0 !== n && !0 !== n) ||
      (j(e),
      a && Fe(e),
      r ? me(e, e.oPreviousSearch) : (e.aiDisplay = e.aiDisplayMaster.slice())),
      !0 !== t && (e._iDisplayStart = 0),
      (e._drawHold = t),
      b(e),
      (e._drawHold = !1);
  }
  function ue(e) {
    var t = e.oLanguage,
      n = t.sZeroRecords,
      a = B(e);
    return (
      (e.iDraw < 1 && "ssp" === a) || (e.iDraw <= 1 && "ajax" === a)
        ? (n = t.sLoadingRecords)
        : t.sEmptyTable && 0 === e.fnRecordsTotal() && (n = t.sEmptyTable),
      P("<tr/>").append(
        P("<td />", { colSpan: s(e), class: e.oClasses.empty.row }).html(n)
      )[0]
    );
  }
  function ce(e, t, o) {
    var i = [];
    for (
      P.each(t, function (e, t) {
        if (null !== t) {
          var n = e.match(/^([a-z]+)([0-9]*)([A-Za-z]*)$/),
            a = n[2] ? +n[2] : 0;
          if (((e = n[3] ? n[3].toLowerCase() : "full"), n[1] === o)) {
            e: {
              for (var r = 0; r < i.length; r++)
                if (
                  (n = i[r]).rowNum === a &&
                  (("full" === e && n.full) ||
                    (("start" === e || "end" === e) && (n.start || n.end)))
                ) {
                  n[e] || (n[e] = { contents: [] }), (a = n);
                  break e;
                }
              ((n = { rowNum: a })[e] = { contents: [] }), i.push(n), (a = n);
            }
            !(function e(t, n, a) {
              if (Array.isArray(a))
                for (var r = 0; r < a.length; r++) e(t, n, a[r]);
              else {
                var o = t[n];
                P.isPlainObject(a)
                  ? a.features
                    ? (a.rowId && (t.id = a.rowId),
                      a.rowClass && (t.className = a.rowClass),
                      (o.id = a.id),
                      (o.className = a.className),
                      e(t, n, a.features))
                    : Object.keys(a).map(function (e) {
                        o.contents.push({ feature: e, opts: a[e] });
                      })
                  : o.contents.push(a);
              }
            })(a, e, t);
          }
        }
      }),
        i.sort(function (e, t) {
          var n = e.rowNum,
            a = t.rowNum;
          return n === a
            ? ((e = e.full && !t.full ? -1 : 1), "bottom" === o ? -1 * e : e)
            : a - n;
        }),
        "bottom" === o && i.reverse(),
        t = 0;
      t < i.length;
      t++
    )
      delete i[t].rowNum,
        ((r, o) => {
          function i(e, t) {
            return (
              S.features[e] || H(r, 0, "Unknown feature: " + e),
              S.features[e].apply(this, [r, t])
            );
          }
          function e(e) {
            if (o[e])
              for (var t, n = 0, a = (e = o[e].contents).length; n < a; n++)
                e[n] &&
                  ("string" == typeof e[n]
                    ? (e[n] = i(e[n], null))
                    : P.isPlainObject(e[n])
                    ? (e[n] = i(e[n].feature, e[n].opts))
                    : "function" == typeof e[n].node
                    ? (e[n] = e[n].node(r))
                    : "function" == typeof e[n] &&
                      ((t = e[n](r)),
                      (e[n] = "function" == typeof t.node ? t.node() : t)));
          }
          e("start"), e("end"), e("full");
        })(e, i[t]);
    return i;
  }
  function de(t) {
    var n,
      e = t.oClasses,
      a = P(t.nTable),
      r = P("<div/>")
        .attr({ id: t.sTableId + "_wrapper", class: e.container })
        .insertBefore(a);
    if (((t.nTableWrapper = r[0]), t.sDom)) {
      var o = t,
        i = t.sDom,
        l = r;
      i = i.match(/(".*?")|('.*?')|./g);
      for (var s, u, c, d, f, h, p = 0; p < i.length; p++)
        (s = null),
          "<" == (u = i[p])
            ? ((c = P("<div/>")),
              ("'" != (d = i[p + 1])[0] && '"' != d[0]) ||
                ((f = d.replace(/['"]/g, "")),
                (d = ""),
                -1 != f.indexOf(".")
                  ? ((h = f.split(".")), (d = h[0]), (h = h[1]))
                  : "#" == f[0]
                  ? (d = f)
                  : (h = f),
                c.attr("id", d.substring(1)).addClass(h),
                p++),
              l.append(c),
              (l = c))
            : ">" == u
            ? (l = l.parent())
            : "t" == u
            ? (s = we(o))
            : q.ext.feature.forEach(function (e) {
                u == e.cFeature && (s = e.fnInit(o));
              }),
          s && l.append(s);
    } else
      (e = ce(t, t.layout, "top")),
        (a = ce(t, t.layout, "bottom")),
        (n = Ee(t, "layout")),
        e.forEach(function (e) {
          n(t, r, e);
        }),
        n(t, r, { full: { table: !0, contents: [we(t)] } }),
        a.forEach(function (e) {
          n(t, r, e);
        });
    var g,
      e = t,
      a = e.nTable,
      m = "" !== e.oScroll.sX || "" !== e.oScroll.sY;
    e.oFeatures.bProcessing &&
      ((g = P("<div/>", {
        id: e.sTableId + "_processing",
        class: e.oClasses.processing.container,
        role: "status",
      })
        .html(e.oLanguage.sProcessing)
        .append("<div><div></div><div></div><div></div><div></div></div>")),
      m ? g.prependTo(P("div.dt-scroll", e.nTableWrapper)) : g.insertBefore(a),
      P(a).on("processing.dt.DT", function (e, t, n) {
        g.css("display", n ? "block" : "none");
      }));
  }
  function fe(e, t, n) {
    for (
      var a,
        r = e.aoColumns,
        o = P(t).children("tr"),
        i = t && "thead" === t.nodeName.toLowerCase(),
        l = [],
        s = 0,
        u = o.length;
      s < u;
      s++
    )
      l.push([]);
    for (s = 0, u = o.length; s < u; s++)
      for (a = (t = o[s]).firstChild; a; ) {
        if (
          "TD" == a.nodeName.toUpperCase() ||
          "TH" == a.nodeName.toUpperCase()
        ) {
          for (
            var c,
              d,
              f,
              h = [],
              p = (p = +a.getAttribute("colspan")) && 0 != p && 1 != p ? p : 1,
              g = (g = +a.getAttribute("rowspan")) && 0 != g && 1 != g ? g : 1,
              m = 0,
              v = l[s];
            v[m];

          )
            m++;
          for (
            v = 1 == p,
              n &&
                (v &&
                  (J(e, m, P(a).data()),
                  (c = r[m]),
                  (d = a.getAttribute("width") || null),
                  (f = a.style.width.match(/width:\s*(\d+[pxem%]+)/)) &&
                    (d = f[1]),
                  (c.sWidthOrig = c.sWidth || d),
                  i
                    ? (null === c.sTitle ||
                        c.autoTitle ||
                        (a.innerHTML = c.sTitle),
                      !c.sTitle &&
                        v &&
                        ((c.sTitle = _(a.innerHTML)), (c.autoTitle = !0)))
                    : c.footer && (a.innerHTML = c.footer),
                  c.ariaTitle ||
                    (c.ariaTitle = P(a).attr("aria-label") || c.sTitle),
                  c.className) &&
                  P(a).addClass(c.className),
                0 === P("span.dt-column-title", a).length &&
                  P("<span>")
                    .addClass("dt-column-title")
                    .append(a.childNodes)
                    .appendTo(a),
                i) &&
                0 === P("span.dt-column-order", a).length &&
                P("<span>").addClass("dt-column-order").appendTo(a),
              d = 0;
            d < p;
            d++
          ) {
            for (c = 0; c < g; c++)
              (l[s + c][m + d] = { cell: a, unique: v }), (l[s + c].row = t);
            h.push(m + d);
          }
          a.setAttribute("data-dt-column", C(h).join(","));
        }
        a = a.nextSibling;
      }
    return l;
  }
  function he(n, e, a) {
    function t(e) {
      var t = n.jqXHR ? n.jqXHR.status : null;
      if (
        ((null === e || ("number" == typeof t && 204 == t)) &&
          pe(n, (e = {}), []),
        (t = e.error || e.sError) && H(n, 0, t),
        e.d && "string" == typeof e.d)
      )
        try {
          e = JSON.parse(e.d);
        } catch (e) {}
      (n.json = e), V(n, null, "xhr", [n, e, n.jqXHR], !0), a(e);
    }
    var r,
      o,
      i = n.ajax,
      l = n.oInstance;
    P.isPlainObject(i) &&
      i.data &&
      ((o = "function" == typeof (r = i.data) ? r(e, n) : r),
      (e = "function" == typeof r && o ? o : P.extend(!0, e, o)),
      delete i.data),
      (o = {
        url: "string" == typeof i ? i : "",
        data: e,
        success: t,
        dataType: "json",
        cache: !1,
        type: n.sServerMethod,
        error: function (e, t) {
          -1 === V(n, null, "xhr", [n, null, n.jqXHR], !0).indexOf(!0) &&
            ("parsererror" == t
              ? H(n, 0, "Invalid JSON response", 1)
              : 4 === e.readyState && H(n, 0, "Ajax error", 7)),
            y(n, !1);
        },
      }),
      P.isPlainObject(i) && P.extend(o, i),
      (n.oAjaxData = e),
      V(n, null, "preXhr", [n, e, o], !0),
      "function" == typeof i
        ? (n.jqXHR = i.call(l, e, t, n))
        : "" === i.url
        ? ((e = {}), q.util.set(i.dataSrc)(e, []), t(e))
        : (n.jqXHR = P.ajax(o)),
      r && (i.data = r);
  }
  function pe(e, t, n) {
    var a = "data";
    if (
      (P.isPlainObject(e.ajax) &&
        void 0 !== e.ajax.dataSrc &&
        ("string" == typeof (e = e.ajax.dataSrc) || "function" == typeof e
          ? (a = e)
          : void 0 !== e.data && (a = e.data)),
      !n)
    )
      return "data" === a ? t.aaData || t[a] : "" !== a ? U(a)(t) : t;
    g(a)(t, n);
  }
  function ge(e, t, n) {
    return (e = P.isPlainObject(e.ajax) ? e.ajax.dataSrc : null) && e[t]
      ? U(e[t])(n)
      : ((e = ""),
        "draw" === t
          ? (e = "sEcho")
          : "recordsTotal" === t
          ? (e = "iTotalRecords")
          : "recordsFiltered" === t && (e = "iTotalDisplayRecords"),
        void 0 !== n[e] ? n[e] : n[t]);
  }
  function me(n, e) {
    var t = n.aoPreSearchCols;
    if ("ssp" != B(n)) {
      for (
        var a, r = n, o = r.aoColumns, i = r.aoData, l = !1, s = 0;
        s < i.length;
        s++
      )
        if (i[s]) {
          var u = i[s];
          if (!u._aFilterData) {
            var c = [];
            for (l = 0, a = o.length; l < a; l++) {
              var d = o[l];
              d.bSearchable
                ? "string" !=
                    typeof (d = null === (d = M(r, s, l, "filter")) ? "" : d) &&
                  d.toString &&
                  (d = d.toString())
                : (d = ""),
                d.indexOf &&
                  -1 !== d.indexOf("&") &&
                  ((vt.innerHTML = d),
                  (d = bt ? vt.textContent : vt.innerText)),
                d.replace && (d = d.replace(/[\r\n\u2028]/g, "")),
                c.push(d);
            }
            (u._aFilterData = c), (u._sFilterRow = c.join("  ")), (l = !0);
          }
        }
      (n.aiDisplay = n.aiDisplayMaster.slice()),
        ve(n.aiDisplay, n, e.search, e),
        P.each(n.searchFixed, function (e, t) {
          ve(n.aiDisplay, n, t, {});
        });
      for (var f = 0; f < t.length; f++)
        (e = t[f]),
          ve(n.aiDisplay, n, e.search, e, f),
          P.each(n.aoColumns[f].searchFixed, function (e, t) {
            ve(n.aiDisplay, n, t, {}, f);
          });
      for (
        var h, p, g = n, m = q.ext.search, v = g.aiDisplay, b = 0, y = m.length;
        b < y;
        b++
      ) {
        for (var D = [], x = 0, S = v.length; x < S; x++)
          (p = v[x]),
            (h = g.aoData[p]),
            m[b](g, h._aFilterData, p, h._aData, x) && D.push(p);
        (v.length = 0), v.push.apply(v, D);
      }
    }
    (n.bFiltered = !0), V(n, null, "search", [n]);
  }
  function ve(e, t, n, a, r) {
    if ("" !== n) {
      var o = [],
        i = "function" == typeof n ? n : null;
      for (
        a =
          n instanceof RegExp
            ? n
            : i
            ? null
            : ((e, t) => {
                var n,
                  a,
                  r = [];
                return (
                  (t = P.extend(
                    {},
                    {
                      boundary: !1,
                      caseInsensitive: !0,
                      exact: !1,
                      regex: !1,
                      smart: !0,
                    },
                    t
                  )),
                  "string" != typeof e && (e = e.toString()),
                  (e = ht(e)),
                  t.exact
                    ? new RegExp(
                        "^" + mt(e) + "$",
                        t.caseInsensitive ? "i" : ""
                      )
                    : ((e = t.regex ? e : mt(e)),
                      t.smart &&
                        ((e = (
                          e.match(/!?["\u201C][^"\u201D]+["\u201D]|[^ ]+/g) || [
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
                              (1 < e.length && r.push("(?!" + e + ")"),
                              (e = "")),
                            e.replace(/"/g, "")
                          );
                        })),
                        (n = r.length ? r.join("") : ""),
                        (a = t.boundary ? "\\b" : ""),
                        (e =
                          "^(?=.*?" +
                          a +
                          e.join(")(?=.*?" + a) +
                          ")(" +
                          n +
                          ".)*$")),
                      new RegExp(e, t.caseInsensitive ? "i" : ""))
                );
              })(n, a),
          n = 0;
        n < e.length;
        n++
      ) {
        var l = t.aoData[e[n]],
          s = void 0 === r ? l._sFilterRow : l._aFilterData[r];
        ((i && i(s, l._aData, e[n], r)) || (a && a.test(s))) && o.push(e[n]);
      }
      for (e.length = o.length, n = 0; n < o.length; n++) e[n] = o[n];
    }
  }
  function be(o) {
    var i,
      t,
      e,
      n,
      l = o.oInit,
      s = o.deferLoading,
      u = B(o);
    o.bInitialised
      ? (ie(o, "header"),
        ie(o, "footer"),
        (e = l),
        (n = function () {
          se(o, o.aoHeader), se(o, o.aoFooter);
          var e,
            t,
            n,
            a,
            r = o.iInitDisplayStart;
          if (l.aaData) for (i = 0; i < l.aaData.length; i++) v(o, l.aaData[i]);
          else (!s && "dom" != u) || Q(o, P(o.nTBody).children("tr"));
          (o.aiDisplay = o.aiDisplayMaster.slice()),
            de(o),
            (t = (e = o).nTHead),
            (n = t.querySelectorAll("tr")),
            !0 === (a = e.bSortCellsTop)
              ? (t = n[0])
              : !1 === a && (t = n[n.length - 1]),
            Ce(
              e,
              t,
              t === e.nTHead
                ? 'tr:not([data-dt-order="disable"]):not([data-dt-order="icon-only"]) th:not([data-dt-order="disable"]):not([data-dt-order="icon-only"]), tr:not([data-dt-order="disable"]):not([data-dt-order="icon-only"]) td:not([data-dt-order="disable"]):not([data-dt-order="icon-only"])'
                : 'th:not([data-dt-order="disable"]):not([data-dt-order="icon-only"]), td:not([data-dt-order="disable"]):not([data-dt-order="icon-only"])'
            ),
            Ie(e, (t = []), e.aaSorting),
            (e.aaSorting = t),
            _e(o),
            y(o, !0),
            V(o, null, "preInit", [o], !0),
            c(o),
            ("ssp" == u && !s) ||
              ("ajax" == u
                ? he(o, {}, function (e) {
                    for (e = pe(o, e), i = 0; i < e.length; i++) v(o, e[i]);
                    (o.iInitDisplayStart = r), c(o), y(o, !1), ye(o);
                  })
                : (ye(o), y(o, !1)));
        }),
        (t = o).oFeatures.bStateSave
          ? void 0 !==
              (e = t.fnStateLoadCallback.call(t.oInstance, t, function (e) {
                Re(t, e, n);
              })) && Re(t, e, n)
          : n())
      : setTimeout(function () {
          be(o);
        }, 200);
  }
  function ye(e) {
    var t;
    e._bInitComplete ||
      ((t = [e, e.json]),
      (e._bInitComplete = !0),
      L(e),
      V(e, null, "plugin-init", t, !0),
      V(e, "aoInitComplete", "init", t, !0));
  }
  function De(e, t) {
    (t = parseInt(t, 10)),
      (e._iDisplayLength = t),
      ke(e),
      V(e, null, "length", [e, t]);
  }
  function xe(e, t, n) {
    var a = e._iDisplayStart,
      r = e._iDisplayLength,
      o = e.fnRecordsDisplay();
    if (0 === o || -1 === r) a = 0;
    else if ("number" == typeof t) o < (a = t * r) && (a = 0);
    else if ("first" == t) a = 0;
    else if ("previous" == t) (a = 0 <= r ? a - r : 0) < 0 && (a = 0);
    else if ("next" == t) a + r < o && (a += r);
    else if ("last" == t) a = Math.floor((o - 1) / r) * r;
    else {
      if ("ellipsis" === t) return;
      H(e, 0, "Unknown paging action: " + t, 5);
    }
    (t = e._iDisplayStart !== a),
      (e._iDisplayStart = a),
      V(e, null, t ? "page" : "page-nc", [e]),
      t && n && b(e);
  }
  function y(e, t) {
    (e.bDrawing && !1 === t) || V(e, null, "processing", [e, t]);
  }
  function Se(e, t, n) {
    t
      ? (y(e, !0),
        setTimeout(function () {
          n(), y(e, !1);
        }, 0))
      : n();
  }
  function we(e) {
    var t,
      n,
      a,
      r,
      o,
      i,
      l,
      s,
      u,
      c,
      d,
      f = P(e.nTable),
      h = e.oScroll;
    return "" === h.sX && "" === h.sY
      ? e.nTable
      : ((t = h.sX),
        (n = h.sY),
        (a = e.oClasses.scrolling),
        (o = (r = e.captionNode) ? r._captionSide : null),
        (i = P(f[0].cloneNode(!1))),
        (l = P(f[0].cloneNode(!1))),
        (s = f.children("tfoot")).length || (s = null),
        (i = P("<div/>", { class: a.container })
          .append(
            P("<div/>", { class: a.header.self })
              .css({
                overflow: "hidden",
                position: "relative",
                border: 0,
                width: t ? x(t) : "100%",
              })
              .append(
                P("<div/>", { class: a.header.inner })
                  .css({
                    "box-sizing": "content-box",
                    width: h.sXInner || "100%",
                  })
                  .append(
                    i
                      .removeAttr("id")
                      .css("margin-left", 0)
                      .append("top" === o ? r : null)
                      .append(f.children("thead"))
                  )
              )
          )
          .append(
            P("<div/>", { class: a.body })
              .css({
                position: "relative",
                overflow: "auto",
                width: t ? x(t) : null,
              })
              .append(f)
          )),
        s &&
          i.append(
            P("<div/>", { class: a.footer.self })
              .css({ overflow: "hidden", border: 0, width: t ? x(t) : "100%" })
              .append(
                P("<div/>", { class: a.footer.inner }).append(
                  l
                    .removeAttr("id")
                    .css("margin-left", 0)
                    .append("bottom" === o ? r : null)
                    .append(f.children("tfoot"))
                )
              )
          ),
        (u = (f = i.children())[0]),
        (c = f[1]),
        (d = s ? f[2] : null),
        P(c).on("scroll.DT", function () {
          var e = this.scrollLeft;
          (u.scrollLeft = e), s && (d.scrollLeft = e);
        }),
        P("th, td", u).on("focus", function () {
          var e = u.scrollLeft;
          (c.scrollLeft = e), s && (c.scrollLeft = e);
        }),
        P(c).css("max-height", n),
        h.bCollapse || P(c).css("height", n),
        (e.nScrollHead = u),
        (e.nScrollBody = c),
        (e.nScrollFoot = d),
        e.aoDrawCallback.push(Te),
        i[0]);
  }
  function Te(t) {
    var e,
      n = t.oScroll.iBarWidth,
      a = P(t.nScrollHead).children("div"),
      r = a.children("table"),
      o = t.nScrollBody,
      i = P(o),
      l = P(t.nScrollFoot).children("div"),
      s = l.children("table"),
      u = P(t.nTHead),
      c = P(t.nTable),
      d = t.nTFoot && P("th, td", t.nTFoot).length ? P(t.nTFoot) : null,
      f = t.oBrowser,
      h = o.scrollHeight > o.clientHeight;
    if (t.scrollBarVis !== h && void 0 !== t.scrollBarVis)
      (t.scrollBarVis = h), L(t);
    else {
      if (
        ((t.scrollBarVis = h),
        c.children("thead, tfoot").remove(),
        (u = u.clone().prependTo(c)).find("th, td").removeAttr("tabindex"),
        u.find("[id]").removeAttr("id"),
        d && (e = d.clone().prependTo(c)).find("[id]").removeAttr("id"),
        t.aiDisplay.length)
      ) {
        for (var p = null, h = t._iDisplayStart; h < t.aiDisplay.length; h++) {
          var g = t.aoData[t.aiDisplay[h]].nTr;
          if (g) {
            p = g;
            break;
          }
        }
        if (p)
          for (
            p = P(p)
              .children("th, td")
              .map(function (e) {
                return { idx: I(t, e), width: P(this).outerWidth() };
              }),
              h = 0;
            h < p.length;
            h++
          )
            (g = t.aoColumns[p[h].idx].colEl[0]).style.width.replace(
              "px",
              ""
            ) !== p[h].width && (g.style.width = p[h].width + "px");
      }
      r.find("colgroup").remove(),
        r.append(t.colgroup.clone()),
        d && (s.find("colgroup").remove(), s.append(t.colgroup.clone())),
        P("th, td", u).each(function () {
          P(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
        }),
        d &&
          P("th, td", e).each(function () {
            P(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
          }),
        (e =
          Math.floor(c.height()) > o.clientHeight ||
          "scroll" == i.css("overflow-y")),
        (f = "padding" + (f.bScrollbarLeft ? "Left" : "Right")),
        (u = c.outerWidth()),
        r.css("width", x(u)),
        a.css("width", x(u)).css(f, e ? n + "px" : "0px"),
        d &&
          (s.css("width", x(u)),
          l.css("width", x(u)).css(f, e ? n + "px" : "0px")),
        c.children("colgroup").prependTo(c),
        i.trigger("scroll"),
        (!t.bSorted && !t.bFiltered) || t._drawHold || (o.scrollTop = 0);
    }
  }
  function x(e) {
    return null === e
      ? "0px"
      : "number" == typeof e
      ? e < 0
        ? "0px"
        : e + "px"
      : e.match(/\d$/)
      ? e + "px"
      : e;
  }
  function _e(e) {
    var t = e.aoColumns;
    for (e.colgroup.empty(), a = 0; a < t.length; a++)
      t[a].bVisible && e.colgroup.append(t[a].colEl);
  }
  function Ce(o, e, t, i, l) {
    Pe(e, t, function (e) {
      var t = !1,
        n = void 0 === i ? Z(e.target) : [i];
      if (n.length) {
        for (
          var a = 0, r = n.length;
          a < r &&
          (!1 !==
            ((e, t, n, a) => {
              function r(e, t) {
                var n = e._idx;
                return (n = void 0 === n ? l.indexOf(e[1]) : n) + 1 < l.length
                  ? n + 1
                  : t
                  ? null
                  : 0;
              }
              var o = e.aoColumns[t],
                i = e.aaSorting,
                l = o.asSorting;
              if (!o.bSortable) return !1;
              "number" == typeof i[0] && (i = e.aaSorting = [i]),
                (a || n) && e.oFeatures.bSortMulti
                  ? -1 !== (e = T(i, "0").indexOf(t))
                    ? null ===
                      (t = null === (t = r(i[e], !0)) && 1 === i.length ? 0 : t)
                      ? i.splice(e, 1)
                      : ((i[e][1] = l[t]), (i[e]._idx = t))
                    : (a ? i.push([t, l[0], 0]) : i.push([t, i[0][1], 0]),
                      (i[i.length - 1]._idx = 0))
                  : i.length && i[0][0] == t
                  ? ((t = r(i[0])),
                    (i.length = 1),
                    (i[0][1] = l[t]),
                    (i[0]._idx = t))
                  : ((i.length = 0), i.push([t, l[0]]), (i[0]._idx = 0));
            })(o, n[a], a, e.shiftKey) && (t = !0),
          1 !== o.aaSorting.length || "" !== o.aaSorting[0][1]);
          a++
        );
        t &&
          Se(o, !0, function () {
            Fe(o), Le(o, o.aiDisplay), c(o, !1, !1), l && l();
          });
      }
    });
  }
  function Le(e, t) {
    if (!(t.length < 2)) {
      e = e.aiDisplayMaster;
      for (var n = {}, a = {}, r = 0; r < e.length; r++) n[e[r]] = r;
      for (r = 0; r < t.length; r++) a[t[r]] = n[t[r]];
      t.sort(function (e, t) {
        return a[e] - a[t];
      });
    }
  }
  function Ie(n, a, e) {
    function t(e) {
      var t;
      P.isPlainObject(e)
        ? void 0 !== e.idx
          ? a.push([e.idx, e.dir])
          : e.name &&
            -1 !== (t = T(n.aoColumns, "sName").indexOf(e.name)) &&
            a.push([t, e.dir])
        : a.push(e);
    }
    if (P.isPlainObject(e)) t(e);
    else if (e.length && "number" == typeof e[0]) t(e);
    else if (e.length) for (var r = 0; r < e.length; r++) t(e[r]);
  }
  function Ae(e) {
    var t = [],
      n = q.ext.type.order,
      a = e.aoColumns,
      r = e.aaSortingFixed,
      o = P.isPlainObject(r),
      i = [];
    if (e.oFeatures.bSort)
      for (
        Array.isArray(r) && Ie(e, i, r),
          o && r.pre && Ie(e, i, r.pre),
          Ie(e, i, e.aaSorting),
          o && r.post && Ie(e, i, r.post),
          e = 0;
        e < i.length;
        e++
      ) {
        var l = i[e][0];
        if (a[l])
          for (var s = a[l].aDataSort, r = 0, o = s.length; r < o; r++) {
            var u = s[r],
              c = a[u].sType || "string";
            void 0 === i[e]._idx &&
              (i[e]._idx = a[u].asSorting.indexOf(i[e][1])),
              i[e][1] &&
                t.push({
                  src: l,
                  col: u,
                  dir: i[e][1],
                  index: i[e]._idx,
                  type: c,
                  formatter: n[c + "-pre"],
                  sorter: n[c + "-" + i[e][1]],
                });
          }
      }
    return t;
  }
  function Fe(e, t, n) {
    var a,
      u,
      c = [],
      r = q.ext.type.order,
      d = e.aoData,
      o = e.aiDisplayMaster;
    for (
      void 0 !== t
        ? ((a = e.aoColumns[t]),
          (u = [
            {
              src: t,
              col: t,
              dir: n,
              index: 0,
              type: a.sType,
              formatter: r[a.sType + "-pre"],
              sorter: r[a.sType + "-" + n],
            },
          ]),
          (o = o.slice()))
        : (u = Ae(e)),
        n = 0,
        r = u.length;
      n < r;
      n++
    ) {
      a = u[n];
      {
        i = void 0;
        l = void 0;
        f = void 0;
        h = void 0;
        s = void 0;
        p = void 0;
        g = void 0;
        m = void 0;
        v = void 0;
        var i = e;
        var l = a.col;
        var s,
          f = i.aoColumns[l],
          h = q.ext.order[f.sSortDataType];
        h && (s = h.call(i.oInstance, i, l, A(i, l)));
        for (
          var p, g = q.ext.type.order[f.sType + "-pre"], m = i.aoData, v = 0;
          v < m.length;
          v++
        )
          m[v] &&
            ((f = m[v])._aSortData || (f._aSortData = []),
            !f._aSortData[l] || h) &&
            ((p = h ? s[v] : M(i, v, l, "sort")),
            (f._aSortData[l] = g ? g(p, i) : p));
      }
    }
    if ("ssp" != B(e) && 0 !== u.length) {
      for (n = 0, r = o.length; n < r; n++) c[n] = n;
      u.length && "desc" === u[0].dir && e.orderDescReverse && c.reverse(),
        o.sort(function (e, t) {
          for (
            var n = u.length, a = d[e]._aSortData, r = d[t]._aSortData, o = 0;
            o < n;
            o++
          ) {
            var i = u[o],
              l = a[i.col],
              s = r[i.col];
            if (i.sorter) {
              if (0 !== (l = i.sorter(l, s))) return l;
            } else if (0 !== (l = l < s ? -1 : s < l ? 1 : 0))
              return "asc" === i.dir ? l : -l;
          }
          return (l = c[e]) < (s = c[t]) ? -1 : s < l ? 1 : 0;
        });
    } else
      0 === u.length &&
        o.sort(function (e, t) {
          return e < t ? -1 : t < e ? 1 : 0;
        });
    return (
      void 0 === t &&
        ((e.bSorted = !0), (e.sortDetails = u), V(e, null, "order", [e, u])),
      o
    );
  }
  function Ne(e) {
    var t,
      n = e.aLastSort,
      a = e.oClasses.order.position,
      r = Ae(e),
      o = e.oFeatures;
    if (o.bSort && o.bSortClasses) {
      for (o = 0, t = n.length; o < t; o++) {
        var i = n[o].src;
        P(T(e.aoData, "anCells", i)).removeClass(a + (o < 2 ? o + 1 : 3));
      }
      for (o = 0, t = r.length; o < t; o++)
        (i = r[o].src),
          P(T(e.aoData, "anCells", i)).addClass(a + (o < 2 ? o + 1 : 3));
    }
    e.aLastSort = r;
  }
  function je(n) {
    var e;
    n._bLoadingState ||
      ((e = {
        time: +new Date(),
        start: n._iDisplayStart,
        length: n._iDisplayLength,
        order: P.extend(!0, [], n.aaSorting),
        search: P.extend({}, n.oPreviousSearch),
        columns: n.aoColumns.map(function (e, t) {
          return {
            visible: e.bVisible,
            search: P.extend({}, n.aoPreSearchCols[t]),
          };
        }),
      }),
      (n.oSavedState = e),
      V(n, "aoStateSaveParams", "stateSaveParams", [n, e]),
      n.oFeatures.bStateSave &&
        !n.bDestroying &&
        n.fnStateSaveCallback.call(n.oInstance, n, e));
  }
  function Re(n, e, t) {
    var a,
      r = n.aoColumns,
      o = ((n._bLoadingState = !0), n._bInitComplete ? new q.Api(n) : null);
    if (e && e.time) {
      var i = n.iStateDuration;
      if (0 < i && e.time < +new Date() - 1e3 * i) n._bLoadingState = !1;
      else if (
        -1 !== V(n, "aoStateLoadParams", "stateLoadParams", [n, e]).indexOf(!1)
      )
        n._bLoadingState = !1;
      else if (e.columns && r.length !== e.columns.length)
        n._bLoadingState = !1;
      else {
        if (
          ((n.oLoadedState = P.extend(!0, {}, e)),
          V(n, null, "stateLoadInit", [n, e], !0),
          void 0 !== e.length &&
            (o ? o.page.len(e.length) : (n._iDisplayLength = e.length)),
          void 0 !== e.start &&
            (null === o
              ? ((n._iDisplayStart = e.start), (n.iInitDisplayStart = e.start))
              : xe(n, e.start / n._iDisplayLength)),
          void 0 !== e.order &&
            ((n.aaSorting = []),
            P.each(e.order, function (e, t) {
              n.aaSorting.push(t[0] >= r.length ? [0, t[1]] : t);
            })),
          void 0 !== e.search && P.extend(n.oPreviousSearch, e.search),
          e.columns)
        ) {
          for (i = 0, a = e.columns.length; i < a; i++) {
            var l = e.columns[i];
            void 0 !== l.visible &&
              (o
                ? o.column(i).visible(l.visible, !1)
                : (r[i].bVisible = l.visible)),
              void 0 !== l.search && P.extend(n.aoPreSearchCols[i], l.search);
          }
          o && o.columns.adjust();
        }
        (n._bLoadingState = !1), V(n, "aoStateLoaded", "stateLoaded", [n, e]);
      }
    } else n._bLoadingState = !1;
    t();
  }
  function H(e, t, n, a) {
    if (
      ((n =
        "DataTables warning: " +
        (e ? "table id=" + e.sTableId + " - " : "") +
        n),
      a &&
        (n +=
          ". For more information about this error, please see https://datatables.net/tn/" +
          a),
      t)
    )
      k.console && console.log && console.log(n);
    else if (
      ((t = (t = q.ext).sErrMode || t.errMode),
      e && V(e, null, "dt-error", [e, a, n], !0),
      "alert" == t)
    )
      alert(n);
    else {
      if ("throw" == t) throw Error(n);
      "function" == typeof t && t(e, a, n);
    }
  }
  function W(n, a, e, t) {
    Array.isArray(e)
      ? P.each(e, function (e, t) {
          Array.isArray(t) ? W(n, a, t[0], t[1]) : W(n, a, t);
        })
      : (void 0 === t && (t = e), void 0 !== a[e] && (n[t] = a[e]));
  }
  function Oe(e, t, n) {
    var a, r;
    for (a in t)
      Object.prototype.hasOwnProperty.call(t, a) &&
        ((r = t[a]),
        P.isPlainObject(r)
          ? (P.isPlainObject(e[a]) || (e[a] = {}), P.extend(!0, e[a], r))
          : n && "data" !== a && "aaData" !== a && Array.isArray(r)
          ? (e[a] = r.slice())
          : (e[a] = r));
    return e;
  }
  function Pe(e, t, n) {
    P(e)
      .on("click.DT", t, function (e) {
        n(e);
      })
      .on("keypress.DT", t, function (e) {
        13 === e.which && (e.preventDefault(), n(e));
      })
      .on("selectstart.DT", t, function () {
        return !1;
      });
  }
  function X(e, t, n) {
    n && e[t].push(n);
  }
  function V(t, e, n, a, r) {
    var o = [];
    return (
      e &&
        (o = t[e]
          .slice()
          .reverse()
          .map(function (e) {
            return e.apply(t.oInstance, a);
          })),
      null !== n &&
        ((e = P.Event(n + ".dt")),
        (n = P(t.nTable)),
        (e.dt = t.api),
        n[r ? "trigger" : "triggerHandler"](e, a),
        r && 0 === n.parents("body").length && P("body").trigger(e, a),
        o.push(e.result)),
      o
    );
  }
  function ke(e) {
    var t = e._iDisplayStart,
      n = e.fnDisplayEnd(),
      a = e._iDisplayLength;
    n <= t && (t = n - a),
      (t -= t % a),
      (e._iDisplayStart = t = -1 === a || t < 0 ? 0 : t);
  }
  function Ee(e, t) {
    e = e.renderer;
    var n = q.ext.renderer[t];
    return P.isPlainObject(e) && e[t]
      ? n[e[t]] || n._
      : ("string" == typeof e && n[e]) || n._;
  }
  function B(e) {
    return e.oFeatures.bServerSide ? "ssp" : e.ajax ? "ajax" : "dom";
  }
  function Me(e, t, n) {
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
  function He(e, t, n) {
    if ((k.luxon && !u && (u = k.luxon), (f = k.moment && !f ? k.moment : f))) {
      var a = f.utc(e, t, n, !0);
      if (!a.isValid()) return null;
    } else if (u) {
      if (
        !(a =
          t && "string" == typeof e
            ? u.DateTime.fromFormat(e, t)
            : u.DateTime.fromISO(e)).isValid
      )
        return null;
      a.setLocale(n);
    } else
      t
        ? (_t ||
            alert(
              "DataTables warning: Formatted date without Moment.js or Luxon - https://datatables.net/tn/17"
            ),
          (_t = !0))
        : (a = new Date(e));
    return a;
  }
  function We(s) {
    return function (a, r, o, i) {
      0 === arguments.length
        ? ((o = "en"), (a = r = null))
        : 1 === arguments.length
        ? ((o = "en"), (r = a), (a = null))
        : 2 === arguments.length && ((o = r), (r = a), (a = null));
      var l = "datetime" + (r ? "-" + r : "");
      return (
        q.ext.type.order[l + "-pre"] ||
          q.type(l, {
            detect: function (e) {
              return e === l && l;
            },
            order: {
              pre: function (e) {
                return e.valueOf();
              },
            },
            className: "dt-right",
          }),
        function (e, t) {
          var n;
          return (
            null == e &&
              (e =
                "--now" === i
                  ? ((n = new Date()),
                    new Date(
                      Date.UTC(
                        n.getFullYear(),
                        n.getMonth(),
                        n.getDate(),
                        n.getHours(),
                        n.getMinutes(),
                        n.getSeconds()
                      )
                    ))
                  : ""),
            "type" === t
              ? l
              : "" === e
              ? "sort" !== t
                ? ""
                : He("0000-01-01 00:00:00", null, o)
              : !(
                  null === r ||
                  a !== r ||
                  "sort" === t ||
                  "type" === t ||
                  e instanceof Date
                ) || null === (n = He(e, a, o))
              ? e
              : "sort" !== t &&
                ((n =
                  null === r
                    ? (f ? n.toDate(void 0) : u ? n.toJSDate(void 0) : n)[s]()
                    : ((e = r),
                      f ? n.format(e) : u ? n.toFormat(e) : n.toISOString(e))),
                "display" === t)
              ? h(n)
              : n
          );
        }
      );
    };
  }
  function Xe(e) {
    var t = [];
    return (
      e.numbers && t.push("numbers"),
      e.previousNext && (t.unshift("previous"), t.push("next")),
      e.firstLast && (t.unshift("first"), t.push("last")),
      t
    );
  }
  function Ve(t, e, n) {
    if (t._bInitComplete) {
      var a = n.type ? q.ext.pager[n.type] : Xe,
        r = t.oLanguage.oAria.paginate || {},
        o = t._iDisplayStart,
        i = t._iDisplayLength,
        l = t.fnRecordsDisplay(),
        s = (c = -1 === i) ? 0 : Math.ceil(o / i),
        u = c ? 1 : Math.ceil(l / i),
        i = [],
        o = [],
        a = a(n).map(function (e) {
          return "numbers" === e ? Be(s, u, n.buttons, n.boundaryNumbers) : e;
        });
      for (i = i.concat.apply(i, a), a = 0; a < i.length; a++) {
        var l = i[a],
          c = ((e, t, n, a) => {
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
                (o.display = r.sNext),
                  (0 !== a && n !== a - 1) || (o.disabled = !0);
                break;
              case "last":
                (o.display = r.sLast),
                  (0 !== a && n !== a - 1) || (o.disabled = !0);
                break;
              default:
                "number" == typeof t &&
                  ((o.display = e.fnFormatNumber(t + 1)), n === t) &&
                  (o.active = !0);
            }
            return o;
          })(t, l, s, u),
          d = Ee(t, "pagingButton")(t, l, c.display, c.active, c.disabled),
          f =
            "string" == typeof l ? r[l] : r.number ? r.number + (l + 1) : null;
        P(d.clicker).attr({
          "aria-controls": t.sTableId,
          "aria-disabled": c.disabled ? "true" : null,
          "aria-current": c.active ? "page" : null,
          "aria-label": f,
          "data-dt-idx": l,
          tabIndex: c.disabled ? -1 : t.iTabIndex || null,
        }),
          "number" != typeof l && P(d.clicker).addClass(l),
          Pe(d.clicker, { action: l }, function (e) {
            e.preventDefault(), xe(t, e.data.action, !0);
          }),
          o.push(d.display);
      }
      (r = Ee(t, "pagingContainer")(t, o)),
        (i = e.find(D.activeElement).data("dt-idx")),
        e.empty().append(r),
        void 0 !== i && e.find("[data-dt-idx=" + i + "]").trigger("focus"),
        o.length &&
          1 < n.buttons &&
          P(e).height() >= 2 * P(o[0]).outerHeight() - 10 &&
          Ve(t, e, P.extend({}, n, { buttons: n.buttons - 2 }));
    }
  }
  function Be(e, t, n, a) {
    var r = Math.floor(n / 2),
      o = a ? 2 : 1,
      i = a ? 1 : 0;
    return (
      t <= n
        ? (e = d(0, t))
        : 1 === n
        ? (e = [e])
        : 3 === n
        ? e <= 1
          ? (e = [0, 1, "ellipsis"])
          : t - 2 <= e
          ? (e = d(t - 2, t)).unshift("ellipsis")
          : (e = ["ellipsis", e, "ellipsis"])
        : e <= r
        ? ((e = d(0, n - o)).push("ellipsis"), a && e.push(t - 1))
        : t - 1 - r <= e
        ? ((e = d(t - (n - o), t)).unshift("ellipsis"), a && e.unshift(0))
        : ((e = d(e - r + o, e + r - i)).push("ellipsis"),
          e.unshift("ellipsis"),
          a && (e.push(t - 1), e.unshift(0))),
      e
    );
  }
  var q = function (e, N) {
    var j, R, O;
    return q.factory(e, N)
      ? q
      : this instanceof q
      ? P(e).DataTable(N)
      : ((R = void 0 === (N = e)),
        (O = (j = this).length),
        R && (N = {}),
        (this.api = function () {
          return new $(this);
        }),
        this.each(function () {
          var e,
            t,
            n,
            a,
            r = {},
            r = 1 < O ? Oe(r, N, !0) : N,
            o = 0,
            i = this.getAttribute("id"),
            l = q.defaults,
            s = P(this);
          if ("table" != this.nodeName.toLowerCase())
            H(
              null,
              0,
              "Non-table node initialisation (" + this.nodeName + ")",
              2
            );
          else {
            P(this).trigger("options.dt", r),
              z(l),
              Y(l.column),
              E(l, l, !0),
              E(l.column, l.column, !0),
              E(l, P.extend(r, s.data()), !0);
            for (var u = q.settings, o = 0, c = u.length; o < c; o++) {
              var d = u[o];
              if (
                d.nTable == this ||
                (d.nTHead && d.nTHead.parentNode == this) ||
                (d.nTFoot && d.nTFoot.parentNode == this)
              ) {
                if (((o = (void 0 !== r.bRetrieve ? r : l).bRetrieve), R || o))
                  return d.oInstance;
                if ((void 0 !== r.bDestroy ? r : l).bDestroy) {
                  new q.Api(d).destroy();
                  break;
                }
                return void H(d, 0, "Cannot reinitialise DataTable", 3);
              }
              if (d.sTableId == this.id) {
                u.splice(o, 1);
                break;
              }
            }
            (null !== i && "" !== i) ||
              (this.id = i = "DataTables_Table_" + q.ext._unique++);
            var f,
              h = P.extend(!0, {}, q.models.oSettings, {
                sDestroyWidth: s[0].style.width,
                sInstance: i,
                sTableId: i,
                colgroup: P("<colgroup>").prependTo(this),
                fastData: function (e, t, n) {
                  return M(h, e, t, n);
                },
              }),
              p =
                ((h.nTable = this),
                (h.oInit = r),
                u.push(h),
                (h.api = new $(h)),
                (h.oInstance = 1 === j.length ? j : s.dataTable()),
                z(r),
                r.aLengthMenu &&
                  !r.iDisplayLength &&
                  (r.iDisplayLength = Array.isArray(r.aLengthMenu[0])
                    ? r.aLengthMenu[0][0]
                    : P.isPlainObject(r.aLengthMenu[0])
                    ? r.aLengthMenu[0].value
                    : r.aLengthMenu[0]),
                (r = Oe(P.extend(!0, {}, l), r)),
                W(
                  h.oFeatures,
                  r,
                  "bPaginate bLengthChange bFilter bSort bSortMulti bInfo bProcessing bAutoWidth bSortClasses bServerSide bDeferRender".split(
                    " "
                  )
                ),
                W(h, r, [
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
                  "orderDescReverse",
                  "typeDetect",
                  ["iCookieDuration", "iStateDuration"],
                  ["oSearch", "oPreviousSearch"],
                  ["aoSearchCols", "aoPreSearchCols"],
                  ["iDisplayLength", "_iDisplayLength"],
                ]),
                W(h.oScroll, r, [
                  ["sScrollX", "sX"],
                  ["sScrollXInner", "sXInner"],
                  ["sScrollY", "sY"],
                  ["bScrollCollapse", "bCollapse"],
                ]),
                W(h.oLanguage, r, "fnInfoCallback"),
                X(h, "aoDrawCallback", r.fnDrawCallback),
                X(h, "aoStateSaveParams", r.fnStateSaveParams),
                X(h, "aoStateLoadParams", r.fnStateLoadParams),
                X(h, "aoStateLoaded", r.fnStateLoaded),
                X(h, "aoRowCallback", r.fnRowCallback),
                X(h, "aoRowCreatedCallback", r.fnCreatedRow),
                X(h, "aoHeaderCallback", r.fnHeaderCallback),
                X(h, "aoFooterCallback", r.fnFooterCallback),
                X(h, "aoInitComplete", r.fnInitComplete),
                X(h, "aoPreDrawCallback", r.fnPreDrawCallback),
                (h.rowIdFn = U(r.rowId)),
                (e = h),
                q.__browser ||
                  ((q.__browser = t = {}),
                  (a = (p = (n = P("<div/>")
                    .css({
                      position: "fixed",
                      top: 0,
                      left: -1 * k.pageXOffset,
                      height: 1,
                      width: 1,
                      overflow: "hidden",
                    })
                    .append(
                      P("<div/>")
                        .css({
                          position: "absolute",
                          top: 1,
                          left: 1,
                          width: 100,
                          overflow: "scroll",
                        })
                        .append(P("<div/>").css({ width: "100%", height: 10 }))
                    )
                    .appendTo("body")).children()).children()),
                  (t.barWidth = p[0].offsetWidth - p[0].clientWidth),
                  (t.bScrollbarLeft = 1 !== Math.round(a.offset().left)),
                  n.remove()),
                P.extend(e.oBrowser, q.__browser),
                (e.oScroll.iBarWidth = q.__browser.barWidth),
                (i = h.oClasses),
                P.extend(i, q.ext.classes, r.oClasses),
                s.addClass(i.table),
                h.oFeatures.bPaginate || (r.iDisplayStart = 0),
                void 0 === h.iInitDisplayStart &&
                  ((h.iInitDisplayStart = r.iDisplayStart),
                  (h._iDisplayStart = r.iDisplayStart)),
                null !== (o = r.iDeferLoading) &&
                  ((h.deferLoading = !0),
                  (c = Array.isArray(o)),
                  (h._iRecordsDisplay = c ? o[0] : o),
                  (h._iRecordsTotal = c ? o[1] : o)),
                (d = []),
                (u = this.getElementsByTagName("thead")),
                fe(h, u[0]));
            if (r.aoColumns) d = r.aoColumns;
            else if (p.length)
              for (c = p[(o = 0)].length; o < c; o++) d.push(null);
            for (o = 0, c = d.length; o < c; o++) G(h);
            var g,
              m = h,
              v = r.aoColumnDefs,
              b = d,
              y = p,
              D = function (e, t) {
                J(h, e, t);
              },
              x = m.aoColumns;
            if (b)
              for (var S = 0, w = b.length; S < w; S++)
                b[S] && b[S].name && (x[S].sName = b[S].name);
            if (v)
              for (S = v.length - 1; 0 <= S; S--) {
                var T = v[S],
                  _ =
                    void 0 !== T.target
                      ? T.target
                      : void 0 !== T.targets
                      ? T.targets
                      : T.aTargets;
                for (
                  w = 0, g = (_ = Array.isArray(_) ? _ : [_]).length;
                  w < g;
                  w++
                ) {
                  var C = _[w];
                  if ("number" == typeof C && 0 <= C) {
                    for (; x.length <= C; ) G(m);
                    D(C, T);
                  } else if ("number" == typeof C && C < 0) D(x.length + C, T);
                  else if ("string" == typeof C)
                    for (var L = 0, I = x.length; L < I; L++)
                      "_all" === C
                        ? D(L, T)
                        : -1 !== C.indexOf(":name")
                        ? x[L].sName === C.replace(":name", "") && D(L, T)
                        : y.forEach(function (e) {
                            e[L] &&
                              ((e = P(e[L].cell)),
                              C.match(/^[a-z][\w-]*$/i) && (C = "." + C),
                              e.is(C)) &&
                              D(L, T);
                          });
                }
              }
            if (b) for (S = 0, w = b.length; S < w; S++) D(S, b[S]);
            (o = s.children("tbody").find("tr").eq(0)).length &&
              ((f = function (e, t) {
                return null !== e.getAttribute("data-" + t) ? t : null;
              }),
              P(o[0])
                .children("th, td")
                .each(function (e, t) {
                  var n,
                    a = h.aoColumns[e];
                  a || H(h, 0, "Incorrect column count", 18),
                    a.mData === e &&
                      ((n = f(t, "sort") || f(t, "order")),
                      (t = f(t, "filter") || f(t, "search")),
                      (null === n && null === t) ||
                        ((a.mData = {
                          _: e + ".display",
                          sort: null !== n ? e + ".@data-" + n : void 0,
                          type: null !== n ? e + ".@data-" + n : void 0,
                          filter: null !== t ? e + ".@data-" + t : void 0,
                        }),
                        (a._isArrayHost = !0),
                        J(h, e)));
                })),
              X(h, "aoDrawCallback", je);
            var A = h.oFeatures;
            if ((r.bStateSave && (A.bStateSave = !0), void 0 === r.aaSorting))
              for (o = 0, c = (d = h.aaSorting).length; o < c; o++)
                d[o][1] = h.aoColumns[o].asSorting[0];
            Ne(h),
              X(h, "aoDrawCallback", function () {
                (h.bSorted || "ssp" === B(h) || A.bDeferRender) && Ne(h);
              }),
              (o = s.children("caption")),
              h.caption &&
                (o = 0 === o.length ? P("<caption/>").appendTo(s) : o).html(
                  h.caption
                ),
              o.length &&
                ((o[0]._captionSide = o.css("caption-side")),
                (h.captionNode = o[0])),
              0 === u.length && (u = P("<thead/>").appendTo(s)),
              (h.nTHead = u[0]),
              P("tr", u).addClass(i.thead.row),
              0 === (o = s.children("tbody")).length &&
                (o = P("<tbody/>").insertAfter(u)),
              (h.nTBody = o[0]),
              0 === (o = s.children("tfoot")).length &&
                (o = P("<tfoot/>").appendTo(s)),
              (h.nTFoot = o[0]),
              P("tr", o).addClass(i.tfoot.row),
              (h.aiDisplay = h.aiDisplayMaster.slice()),
              (h.bInitialised = !0);
            var F = h.oLanguage;
            P.extend(!0, F, r.oLanguage),
              F.sUrl
                ? P.ajax({
                    dataType: "json",
                    url: F.sUrl,
                    success: function (e) {
                      E(l.oLanguage, e),
                        P.extend(!0, F, e, h.oInit.oLanguage),
                        V(h, null, "i18n", [h], !0),
                        be(h);
                    },
                    error: function () {
                      H(h, 0, "i18n file loading error", 21), be(h);
                    },
                  })
                : (V(h, null, "i18n", [h], !0), be(h));
          }
        }),
        (j = null),
        this);
  };
  (q.ext = S =
    {
      buttons: {},
      classes: {},
      builder: "-source-",
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
      fnVersionCheck: q.fnVersionCheck,
      iApiIndex: 0,
      sVersion: q.version,
    }),
    P.extend(S, {
      afnFiltering: S.search,
      aTypes: S.type.detect,
      ofnSearch: S.type.search,
      oSort: S.type.order,
      afnSortData: S.order,
      aoFeatures: S.feature,
      oStdClasses: S.classes,
      oPagination: S.pager,
    }),
    P.extend(q.ext.classes, {
      container: "dt-container",
      empty: { row: "dt-empty" },
      info: { container: "dt-info" },
      layout: {
        row: "dt-layout-row",
        cell: "dt-layout-cell",
        tableRow: "dt-layout-table",
        tableCell: "",
        start: "dt-layout-start",
        end: "dt-layout-end",
        full: "dt-layout-full",
      },
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
        nav: "",
      },
    });
  function qe(e) {
    var t = parseInt(e, 10);
    return !isNaN(t) && isFinite(e) ? t : null;
  }
  function Ue(e, t, n, a) {
    var r = typeof e,
      o = "string" == r;
    return (
      !!("number" == r || "bigint" == r || (a && w(e))) ||
      (t && o && (e = ft(e, t)),
      n && o && (e = e.replace(dt, "")),
      !isNaN(parseFloat(e)) && isFinite(e))
    );
  }
  function $e(e, t, n, a) {
    return (
      !(!a || !w(e)) ||
      (("string" != typeof e || !e.match(/<(input|select)/i)) &&
        (w(e) || "string" == typeof e) &&
        !!Ue(_(e), t, n, a)) ||
      null
    );
  }
  function ze(e, t, n, a) {
    var r = [],
      o = 0,
      i = t.length;
    if (void 0 !== a)
      for (; o < i; o++) e[t[o]] && e[t[o]][n] && r.push(e[t[o]][n][a]);
    else for (; o < i; o++) e[t[o]] && r.push(e[t[o]][n]);
    return r;
  }
  function d(e, t) {
    var n,
      a = [];
    for (
      void 0 === t ? ((t = 0), (n = e)) : ((n = t), (t = e)), e = t;
      e < n;
      e++
    )
      a.push(e);
    return a;
  }
  function Ye(e) {
    for (var t = [], n = 0, a = e.length; n < a; n++) e[n] && t.push(e[n]);
    return t;
  }
  function Ge(e, t) {
    var n, a;
    return Array.isArray(e)
      ? ((n = []),
        e.forEach(function (e) {
          (e = Ge(e, t)), n.push.apply(n, e);
        }),
        n.filter(function (e) {
          return e;
        }))
      : "number" == typeof e
      ? [t[e]]
      : ((a = t.map(function (e) {
          return e.nTable;
        })),
        P(a)
          .filter(e)
          .map(function () {
            var e = a.indexOf(this);
            return t[e];
          })
          .toArray());
  }
  function Je(a, r, e) {
    var t, n;
    e &&
      (t = new $(a)).one("draw", function () {
        e(t.ajax.json());
      }),
      "ssp" == B(a)
        ? c(a, r)
        : (y(a, !0),
          (n = a.jqXHR) && 4 !== n.readyState && n.abort(),
          he(a, {}, function (e) {
            te(a);
            for (var t = 0, n = (e = pe(a, e)).length; t < n; t++) v(a, e[t]);
            c(a, r), ye(a), y(a, !1);
          }));
  }
  function Ze(e, t, n, a, r) {
    var o,
      i = [],
      l = typeof t;
    for (
      (t && "string" !== l && "function" !== l && void 0 !== t.length) ||
        (t = [t]),
        l = 0,
        o = t.length;
      l < o;
      l++
    )
      for (
        var s =
            t[l] && t[l].split && !t[l].match(/[[(:]/)
              ? t[l].split(",")
              : [t[l]],
          u = 0,
          c = s.length;
        u < c;
        u++
      ) {
        var d = n("string" == typeof s[u] ? s[u].trim() : s[u]);
        (d = d.filter(function (e) {
          return null != e;
        })) &&
          d.length &&
          (i = i.concat(d));
      }
    if ((e = S.selector[e]).length)
      for (l = 0, o = e.length; l < o; l++) i = e[l](a, r, i);
    return C(i);
  }
  function Qe(e) {
    return (
      (e ||= {}).filter && void 0 === e.search && (e.search = e.filter),
      P.extend({ search: "none", order: "current", page: "all" }, e)
    );
  }
  function Ke(e) {
    var t = new $(e.context[0]);
    return (
      e.length && t.push(e[0]),
      (t.selector = e.selector),
      t.length && 1 < t[0].length && t[0].splice(1),
      t
    );
  }
  function et(r, o, e, t) {
    function i(e, t) {
      if (Array.isArray(e) || e instanceof P)
        for (var n = 0, a = e.length; n < a; n++) i(e[n], t);
      else
        e.nodeName && "tr" === e.nodeName.toLowerCase()
          ? (e.setAttribute("data-dt-row", o.idx), l.push(e))
          : ((n = P("<tr><td></td></tr>")
              .attr("data-dt-row", o.idx)
              .addClass(t)),
            (P("td", n).addClass(t).html(e)[0].colSpan = s(r)),
            l.push(n[0]));
    }
    var l = [];
    i(e, t),
      o._details && o._details.detach(),
      (o._details = P(l)),
      o._detailsShow && o._details.insertAfter(o.nTr);
  }
  function tt(e, t) {
    var n,
      r,
      a,
      o,
      i = e.context;
    i.length &&
      e.length &&
      (n = i[0].aoData[e[0]])._details &&
      ((n._detailsShow = t)
        ? (n._details.insertAfter(n.nTr), P(n.nTr).addClass("dt-hasChild"))
        : (n._details.detach(), P(n.nTr).removeClass("dt-hasChild")),
      V(i[0], null, "childRow", [t, e.row(e[0])]),
      (r = i[0]),
      (a = new $(r)),
      (o = r.aoData),
      a.off(
        "draw.dt.DT_details column-sizing.dt.DT_details destroy.dt.DT_details"
      ),
      0 < T(o, "_details").length &&
        (a.on("draw.dt.DT_details", function (e, t) {
          r === t &&
            a
              .rows({ page: "current" })
              .eq(0)
              .each(function (e) {
                (e = o[e])._detailsShow && e._details.insertAfter(e.nTr);
              });
        }),
        a.on("column-sizing.dt.DT_details", function (e, t) {
          if (r === t) {
            var n = s(t);
            t = 0;
            for (var a = o.length; t < a; t++)
              (e = o[t]) &&
                e._details &&
                e._details.each(function () {
                  var e = P(this).children("td");
                  1 == e.length && e.attr("colspan", n);
                });
          }
        }),
        a.on("destroy.dt.DT_details", function (e, t) {
          if (r === t)
            for (e = 0, t = o.length; e < t; e++)
              o[e] && o[e]._details && wt(a, e);
        })),
      St(i));
  }
  function nt(e, t, n, a, r, o) {
    (n = []), (a = 0);
    for (var i = r.length; a < i; a++) n.push(M(e, r[a], t, o));
    return n;
  }
  function at(e, t, n) {
    var a = e.aoHeader;
    return a[void 0 !== n ? n : e.bSortCellsTop ? 0 : a.length - 1][t].cell;
  }
  function rt(t, n) {
    return function (e) {
      return (
        w(e) ||
          "string" != typeof e ||
          ((e = e.replace(it, " ")), t && (e = _(e)), n && (e = ht(e, !1))),
        e
      );
    };
  }
  var S,
    t,
    e,
    u,
    f,
    ot = {},
    it = /[\r\n\u2028]/g,
    lt = /<([^>]*>)/g,
    st = Math.pow(2, 28),
    ut =
      /^\d{2,4}[./-]\d{1,2}[./-]\d{1,2}([T ]{1}\d{1,2}[:.]\d{2}([.:]\d{2})?)?$/,
    ct = RegExp(
      "(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\|\\$|\\^|\\-)",
      "g"
    ),
    dt = /['\u00A0,$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfkɃΞ]/gi,
    w = function (e) {
      return !e || !0 === e || "-" === e;
    },
    ft = function (e, t) {
      return (
        ot[t] || (ot[t] = new RegExp(mt(t), "g")),
        "string" == typeof e && "." !== t
          ? e.replace(/\./g, "").replace(ot[t], ".")
          : e
      );
    },
    T = function (e, t, n) {
      var a = [],
        r = 0,
        o = e.length;
      if (void 0 !== n)
        for (; r < o; r++) e[r] && e[r][t] && a.push(e[r][t][n]);
      else for (; r < o; r++) e[r] && a.push(e[r][t]);
      return a;
    },
    _ = function (e) {
      if (!e || "string" != typeof e) return e;
      if (e.length > st) throw Error("Exceeded max str len");
      e = e.replace(lt, "");
      do {
        var t = e;
      } while ((e = e.replace(/<script/i, "")) !== t);
      return t;
    },
    h = function (e) {
      return "string" == typeof (e = Array.isArray(e) ? e.join(",") : e)
        ? e
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
        : e;
    },
    ht = function (e, t) {
      var n;
      return "string" != typeof e
        ? e
        : (n = e.normalize ? e.normalize("NFD") : e).length !== e.length
        ? (!0 === t ? e + " " : "") + n.replace(/[\u0300-\u036f]/g, "")
        : n;
    },
    C = function (e) {
      if (Array.from && Set) return Array.from(new Set(e));
      e: {
        if (!(e.length < 2))
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
      var o,
        t = [],
        r = e.length,
        i = 0,
        a = 0;
      e: for (; a < r; a++) {
        for (n = e[a], o = 0; o < i; o++) if (t[o] === n) continue e;
        t.push(n), i++;
      }
      return t;
    },
    pt = function (e, t) {
      if (Array.isArray(t)) for (var n = 0; n < t.length; n++) pt(e, t[n]);
      else e.push(t);
      return e;
    },
    r =
      ((q.util = {
        diacritics: function (e, t) {
          if ("function" != typeof e) return ht(e, t);
          ht = e;
        },
        debounce: function (n, a) {
          var r;
          return function () {
            var e = this,
              t = arguments;
            clearTimeout(r),
              (r = setTimeout(function () {
                n.apply(e, t);
              }, a || 250));
          };
        },
        throttle: function (a, e) {
          var r,
            o,
            i = void 0 !== e ? e : 200;
          return function () {
            var e = this,
              t = +new Date(),
              n = arguments;
            r && t < r + i
              ? (clearTimeout(o),
                (o = setTimeout(function () {
                  (r = void 0), a.apply(e, n);
                }, i)))
              : ((r = t), a.apply(e, n));
          };
        },
        escapeRegex: function (e) {
          return e.replace(ct, "\\$1");
        },
        set: function (a) {
          var s;
          return P.isPlainObject(a)
            ? q.util.set(a._)
            : null === a
            ? function () {}
            : "function" == typeof a
            ? function (e, t, n) {
                a(e, "set", t, n);
              }
            : "string" != typeof a ||
              (-1 === a.indexOf(".") &&
                -1 === a.indexOf("[") &&
                -1 === a.indexOf("("))
            ? function (e, t) {
                e[a] = t;
              }
            : ((s = function (e, t, n) {
                for (
                  var a,
                    r,
                    o = (n = ee(n))[n.length - 1],
                    i = 0,
                    l = n.length - 1;
                  i < l;
                  i++
                ) {
                  if ("__proto__" === n[i] || "constructor" === n[i])
                    throw Error("Cannot set prototype values");
                  if (((a = n[i].match(gt)), (r = n[i].match(p)), a)) {
                    if (
                      ((n[i] = n[i].replace(gt, "")),
                      (e[n[i]] = []),
                      (o = n.slice()).splice(0, i + 1),
                      (a = o.join(".")),
                      Array.isArray(t))
                    )
                      for (r = 0, l = t.length; r < l; r++)
                        s((o = {}), t[r], a), e[n[i]].push(o);
                    else e[n[i]] = t;
                    return;
                  }
                  r && ((n[i] = n[i].replace(p, "")), (e = e[n[i]](t))),
                    null == e[n[i]] && (e[n[i]] = {}),
                    (e = e[n[i]]);
                }
                o.match(p)
                  ? e[o.replace(p, "")](t)
                  : (e[o.replace(gt, "")] = t);
              }),
              function (e, t) {
                return s(e, t, a);
              });
        },
        get: function (r) {
          var o, l;
          return P.isPlainObject(r)
            ? ((o = {}),
              P.each(r, function (e, t) {
                t && (o[e] = q.util.get(t));
              }),
              function (e, t, n, a) {
                var r = o[t] || o._;
                return void 0 !== r ? r(e, t, n, a) : e;
              })
            : null === r
            ? function (e) {
                return e;
              }
            : "function" == typeof r
            ? function (e, t, n, a) {
                return r(e, t, n, a);
              }
            : "string" != typeof r ||
              (-1 === r.indexOf(".") &&
                -1 === r.indexOf("[") &&
                -1 === r.indexOf("("))
            ? function (e) {
                return e[r];
              }
            : ((l = function (e, t, n) {
                if ("" !== n)
                  for (var a = ee(n), r = 0, o = a.length; r < o; r++) {
                    n = a[r].match(gt);
                    var i = a[r].match(p);
                    if (n) {
                      if (
                        ((a[r] = a[r].replace(gt, "")),
                        "" !== a[r] && (e = e[a[r]]),
                        (i = []),
                        a.splice(0, r + 1),
                        (a = a.join(".")),
                        Array.isArray(e))
                      )
                        for (r = 0, o = e.length; r < o; r++)
                          i.push(l(e[r], t, a));
                      e =
                        "" === (e = n[0].substring(1, n[0].length - 1))
                          ? i
                          : i.join(e);
                      break;
                    }
                    if (i) (a[r] = a[r].replace(p, "")), (e = e[a[r]]());
                    else {
                      if (null === e || null === e[a[r]]) return null;
                      if (void 0 === e || void 0 === e[a[r]]) return;
                      e = e[a[r]];
                    }
                  }
                return e;
              }),
              function (e, t) {
                return l(e, t, r);
              });
        },
        stripHtml: function (e) {
          var t = typeof e;
          if ("function" != t) return "string" == t ? _(e) : e;
          _ = e;
        },
        escapeHtml: function (e) {
          var t = typeof e;
          if ("function" != t)
            return "string" == t || Array.isArray(e) ? h(e) : e;
          h = e;
        },
        unique: C,
      }),
      function (e, t, n) {
        void 0 !== e[t] && (e[n] = e[t]);
      }),
    gt = /\[.*?\]$/,
    p = /\(\)$/,
    U = q.util.get,
    g = q.util.set,
    mt = q.util.escapeRegex,
    vt = P("<div>")[0],
    bt = void 0 !== vt.textContent,
    yt = [],
    n = Array.prototype,
    $ = function (e, t) {
      if (!(this instanceof $)) return new $(e, t);
      function n(e) {
        var t, n, a, r;
        (t = e),
          (a = q.settings),
          (r = T(a, "nTable")),
          (e = t
            ? t.nTable && t.oFeatures
              ? [t]
              : t.nodeName && "table" === t.nodeName.toLowerCase()
              ? -1 !== (t = r.indexOf(t))
                ? [a[t]]
                : null
              : t && "function" == typeof t.settings
              ? t.settings().toArray()
              : ("string" == typeof t
                  ? (n = P(t).get())
                  : t instanceof P && (n = t.get()),
                n
                  ? a.filter(function (e, t) {
                      return n.includes(r[t]);
                    })
                  : void 0)
            : []) && o.push.apply(o, e);
      }
      var a,
        o = [];
      if (Array.isArray(e)) for (a = 0; a < e.length; a++) n(e[a]);
      else n(e);
      if (((this.context = 1 < o.length ? C(o) : o), t))
        if (t.length < 1e4) this.push.apply(this, t);
        else for (a = 0; a < t.length; a++) this.push(t[a]);
      (this.selector = { rows: null, cols: null, opts: null }),
        $.extend(this, this, yt);
    },
    Dt =
      ((q.Api = $),
      P.extend($.prototype, {
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
          return t.length > e ? new $(t[e], this[e]) : null;
        },
        filter: function (e) {
          return (e = n.filter.call(this, e, this)), new $(this.context, e);
        },
        flatten: function () {
          var e = [];
          return new $(this.context, e.concat.apply(e, this.toArray()));
        },
        get: function (e) {
          return this[e];
        },
        join: n.join,
        includes: function (e) {
          return -1 !== this.indexOf(e);
        },
        indexOf: n.indexOf,
        iterator: function (e, t, n, a) {
          for (
            var r,
              o = [],
              i = this.context,
              l = this.selector,
              s =
                ("string" == typeof e && ((a = n), (n = t), (t = e), (e = !1)),
                0),
              u = i.length;
            s < u;
            s++
          ) {
            var c = new $(i[s]);
            if ("table" === t) {
              var d = n.call(c, i[s], s);
              void 0 !== d && o.push(d);
            } else if ("columns" === t || "rows" === t)
              void 0 !== (d = n.call(c, i[s], this[s], s)) && o.push(d);
            else if (
              "every" === t ||
              "column" === t ||
              "column-rows" === t ||
              "row" === t ||
              "cell" === t
            )
              for (
                var f = this[s],
                  h = ("column-rows" === t && (r = Dt(i[s], l.opts)), 0),
                  p = f.length;
                h < p;
                h++
              )
                (d = f[h]),
                  void 0 !==
                    (d =
                      "cell" === t
                        ? n.call(c, i[s], d.row, d.column, s, h)
                        : n.call(c, i[s], d, s, h, r)) && o.push(d);
          }
          return o.length || a
            ? (((t = (e = new $(i, e ? o.concat.apply([], o) : o))
                .selector).rows = l.rows),
              (t.cols = l.cols),
              (t.opts = l.opts),
              e)
            : this;
        },
        lastIndexOf: n.lastIndexOf,
        length: 0,
        map: function (e) {
          return (e = n.map.call(this, e, this)), new $(this.context, e);
        },
        pluck: function (e) {
          var t = q.util.get(e);
          return this.map(function (e) {
            return t(e);
          });
        },
        pop: n.pop,
        push: n.push,
        reduce: n.reduce,
        reduceRight: n.reduceRight,
        reverse: n.reverse,
        selector: null,
        shift: n.shift,
        slice: function () {
          return new $(this.context, this);
        },
        sort: n.sort,
        splice: n.splice,
        toArray: function () {
          return n.slice.call(this);
        },
        to$: function () {
          return P(this);
        },
        toJQuery: function () {
          return P(this);
        },
        unique: function () {
          return new $(this.context, C(this.toArray()));
        },
        unshift: n.unshift,
      }),
      (k.__apiStruct = yt),
      ($.extend = function (e, t, n) {
        if (n.length && t && (t instanceof $ || t.__dt_wrapper))
          for (var a = 0, r = n.length; a < r; a++) {
            var o = n[a];
            "__proto__" !== o.name &&
              ((t[o.name] =
                "function" === o.type
                  ? ((t, n, a) =>
                      function () {
                        var e = n.apply(t || this, arguments);
                        return $.extend(e, e, a.methodExt), e;
                      })(e, o.val, o)
                  : "object" === o.type
                  ? {}
                  : o.val),
              (t[o.name].__dt_wrapper = !0),
              $.extend(e, t[o.name], o.propExt));
          }
      }),
      ($.register = t =
        function (e, t) {
          if (Array.isArray(e))
            for (var n = 0, a = e.length; n < a; n++) $.register(e[n], t);
          else {
            var r,
              a = e.split("."),
              o = yt;
            for (e = 0, n = a.length; e < n; e++) {
              var i = (r = -1 !== a[e].indexOf("()"))
                ? a[e].replace("()", "")
                : a[e];
              e: {
                for (var l = 0, s = o.length; l < s; l++)
                  if (o[l].name === i) {
                    l = o[l];
                    break e;
                  }
                l = null;
              }
              l ||
                o.push(
                  (l = {
                    name: i,
                    val: {},
                    methodExt: [],
                    propExt: [],
                    type: "object",
                  })
                ),
                e === n - 1
                  ? ((l.val = t),
                    (l.type =
                      "function" == typeof t
                        ? "function"
                        : P.isPlainObject(t)
                        ? "object"
                        : "other"))
                  : (o = r ? l.methodExt : l.propExt);
            }
          }
        }),
      ($.registerPlural = e =
        function (e, t, n) {
          $.register(e, n),
            $.register(t, function () {
              var e = n.apply(this, arguments);
              return e === this
                ? this
                : e instanceof $
                ? e.length
                  ? Array.isArray(e[0])
                    ? new $(e.context, e[0])
                    : e[0]
                  : void 0
                : e;
            });
        }),
      t("tables()", function (e) {
        return null != e ? new $(Ge(e, this.context)) : this;
      }),
      t("table()", function (e) {
        var t = (e = this.tables(e)).context;
        return t.length ? new $(t[0]) : e;
      }),
      [
        ["nodes", "node", "nTable"],
        ["body", "body", "nTBody"],
        ["header", "header", "nTHead"],
        ["footer", "footer", "nTFoot"],
      ].forEach(function (t) {
        e("tables()." + t[0] + "()", "table()." + t[1] + "()", function () {
          return this.iterator(
            "table",
            function (e) {
              return e[t[2]];
            },
            1
          );
        });
      }),
      [
        ["header", "aoHeader"],
        ["footer", "aoFooter"],
      ].forEach(function (n) {
        t("table()." + n[0] + ".structure()", function (e) {
          e = this.columns(e).indexes().flatten();
          var t = this.context[0];
          return le(t, t[n[1]], e);
        });
      }),
      e("tables().containers()", "table().container()", function () {
        return this.iterator(
          "table",
          function (e) {
            return e.nTableWrapper;
          },
          1
        );
      }),
      t("tables().every()", function (n) {
        var a = this;
        return this.iterator("table", function (e, t) {
          n.call(a.table(t), t);
        });
      }),
      t("caption()", function (r, o) {
        var e,
          t = this.context;
        return void 0 === r
          ? (e = t[0].captionNode) && t.length
            ? e.innerHTML
            : null
          : this.iterator(
              "table",
              function (e) {
                var t = P(e.nTable),
                  n = P(e.captionNode),
                  a = P(e.nTableWrapper);
                n.length ||
                  ((n = P("<caption/>").html(r)), (e.captionNode = n[0]), o) ||
                  (t.prepend(n), (o = n.css("caption-side"))),
                  n.html(r),
                  o && (n.css("caption-side", o), (n[0]._captionSide = o)),
                  (a.find("div.dataTables_scroll").length
                    ? a.find(
                        "div.dataTables_scroll" +
                          ("top" === o ? "Head" : "Foot") +
                          " table"
                      )
                    : t
                  ).prepend(n);
              },
              1
            );
      }),
      t("caption.node()", function () {
        var e = this.context;
        return e.length ? e[0].captionNode : null;
      }),
      t("draw()", function (t) {
        return this.iterator("table", function (e) {
          "page" === t
            ? b(e)
            : c(e, !1 === (t = "string" == typeof t ? "full-hold" !== t : t));
        });
      }),
      t("page()", function (t) {
        return void 0 === t
          ? this.page.info().page
          : this.iterator("table", function (e) {
              xe(e, t);
            });
      }),
      t("page.info()", function () {
        var e, t, n, a, r;
        if (0 !== this.context.length)
          return (
            (t = (e = this.context[0])._iDisplayStart),
            (n = e.oFeatures.bPaginate ? e._iDisplayLength : -1),
            (a = e.fnRecordsDisplay()),
            {
              page: (r = -1 === n) ? 0 : Math.floor(t / n),
              pages: r ? 1 : Math.ceil(a / n),
              start: t,
              end: e.fnDisplayEnd(),
              length: n,
              recordsTotal: e.fnRecordsTotal(),
              recordsDisplay: a,
              serverSide: "ssp" === B(e),
            }
          );
      }),
      t("page.len()", function (t) {
        return void 0 === t
          ? 0 !== this.context.length
            ? this.context[0]._iDisplayLength
            : void 0
          : this.iterator("table", function (e) {
              De(e, t);
            });
      }),
      t("ajax.json()", function () {
        var e = this.context;
        if (0 < e.length) return e[0].json;
      }),
      t("ajax.params()", function () {
        var e = this.context;
        if (0 < e.length) return e[0].oAjaxData;
      }),
      t("ajax.reload()", function (t, n) {
        return this.iterator("table", function (e) {
          Je(e, !1 === n, t);
        });
      }),
      t("ajax.url()", function (t) {
        var e = this.context;
        return void 0 === t
          ? 0 === e.length
            ? void 0
            : ((e = e[0]), P.isPlainObject(e.ajax) ? e.ajax.url : e.ajax)
          : this.iterator("table", function (e) {
              P.isPlainObject(e.ajax) ? (e.ajax.url = t) : (e.ajax = t);
            });
      }),
      t("ajax.url().load()", function (t, n) {
        return this.iterator("table", function (e) {
          Je(e, !1 === n, t);
        });
      }),
      function (e, t) {
        var n = [],
          a = e.aiDisplay,
          r = e.aiDisplayMaster,
          o = t.search,
          i = t.order;
        if (((t = t.page), "ssp" == B(e)))
          return "removed" === o ? [] : d(0, r.length);
        if ("current" == t)
          for (i = e._iDisplayStart, t = e.fnDisplayEnd(); i < t; i++)
            n.push(a[i]);
        else if ("current" == i || "applied" == i) {
          if ("none" == o) n = r.slice();
          else if ("applied" == o) n = a.slice();
          else if ("removed" == o) {
            var l = {},
              i = 0;
            for (t = a.length; i < t; i++) l[a[i]] = null;
            r.forEach(function (e) {
              Object.prototype.hasOwnProperty.call(l, e) || n.push(e);
            });
          }
        } else if ("index" == i || "original" == i)
          for (i = 0, t = e.aoData.length; i < t; i++)
            e.aoData[i] &&
              ("none" == o ||
                (-1 === (r = a.indexOf(i)) && "removed" == o) ||
                (0 <= r && "applied" == o)) &&
              n.push(i);
        else if ("number" == typeof i)
          if (((e = Fe(e, i, "asc")), "none" === o)) n = e;
          else
            for (i = 0; i < e.length; i++)
              ((-1 === (r = a.indexOf(e[i])) && "removed" == o) ||
                (0 <= r && "applied" == o)) &&
                n.push(e[i]);
        return n;
      }),
    xt =
      (t("rows()", function (n, a) {
        void 0 === n ? (n = "") : P.isPlainObject(n) && ((a = n), (n = "")),
          (a = Qe(a));
        var e = this.iterator(
          "table",
          function (e) {
            return (
              (t = Ze(
                "row",
                (t = n),
                function (n) {
                  var e,
                    t = qe(n),
                    a = r.aoData;
                  return (null !== t && !o) ||
                    ((i ||= Dt(r, o)), null !== t && -1 !== i.indexOf(t))
                    ? [t]
                    : null == n || "" === n
                    ? i
                    : "function" == typeof n
                    ? i.map(function (e) {
                        var t = a[e];
                        return n(e, t._aData, t.nTr) ? e : null;
                      })
                    : n.nodeName
                    ? ((t = n._DT_RowIndex),
                      (e = n._DT_CellIndex),
                      void 0 !== t
                        ? a[t] && a[t].nTr === n
                          ? [t]
                          : []
                        : e
                        ? a[e.row] && a[e.row].nTr === n.parentNode
                          ? [e.row]
                          : []
                        : (t = P(n).closest("*[data-dt-row]")).length
                        ? [t.data("dt-row")]
                        : [])
                    : "string" == typeof n &&
                      "#" === n.charAt(0) &&
                      void 0 !== (t = r.aIds[n.replace(/^#/, "")])
                    ? [t.idx]
                    : ((t = Ye(ze(r.aoData, i, "nTr"))),
                      P(t)
                        .filter(n)
                        .map(function () {
                          return this._DT_RowIndex;
                        })
                        .toArray());
                },
                (r = e),
                (o = a)
              )),
              ("current" !== o.order && "applied" !== o.order) || Le(r, t),
              t
            );
            var r, t, o, i;
          },
          1
        );
        return (e.selector.rows = n), (e.selector.opts = a), e;
      }),
      t("rows().nodes()", function () {
        return this.iterator(
          "row",
          function (e, t) {
            return e.aoData[t].nTr || void 0;
          },
          1
        );
      }),
      t("rows().data()", function () {
        return this.iterator(
          !0,
          "rows",
          function (e, t) {
            return ze(e.aoData, t, "_aData");
          },
          1
        );
      }),
      e("rows().cache()", "row().cache()", function (n) {
        return this.iterator(
          "row",
          function (e, t) {
            return (
              (e = e.aoData[t]), "search" === n ? e._aFilterData : e._aSortData
            );
          },
          1
        );
      }),
      e("rows().invalidate()", "row().invalidate()", function (n) {
        return this.iterator("row", function (e, t) {
          l(e, t, n);
        });
      }),
      e("rows().indexes()", "row().index()", function () {
        return this.iterator(
          "row",
          function (e, t) {
            return t;
          },
          1
        );
      }),
      e("rows().ids()", "row().id()", function (e) {
        for (var t = [], n = this.context, a = 0, r = n.length; a < r; a++)
          for (var o = 0, i = this[a].length; o < i; o++) {
            var l = n[a].rowIdFn(n[a].aoData[this[a][o]]._aData);
            t.push((!0 === e ? "#" : "") + l);
          }
        return new $(n, t);
      }),
      e("rows().remove()", "row().remove()", function () {
        return (
          this.iterator("row", function (e, t) {
            var n = e.aoData,
              a = n[t],
              r = e.aiDisplayMaster.indexOf(t);
            -1 !== r && e.aiDisplayMaster.splice(r, 1),
              0 < e._iRecordsDisplay && e._iRecordsDisplay--,
              ke(e),
              void 0 !== (a = e.rowIdFn(a._aData)) && delete e.aIds[a],
              (n[t] = null);
          }),
          this
        );
      }),
      t("rows.add()", function (o) {
        var e = this.iterator(
            "table",
            function (e) {
              for (var t = [], n = 0, a = o.length; n < a; n++) {
                var r = o[n];
                r.nodeName && "TR" === r.nodeName.toUpperCase()
                  ? t.push(Q(e, r)[0])
                  : t.push(v(e, r));
              }
              return t;
            },
            1
          ),
          t = this.rows(-1);
        return t.pop(), t.push.apply(t, e), t;
      }),
      t("row()", function (e, t) {
        return Ke(this.rows(e, t));
      }),
      t("row().data()", function (e) {
        var t,
          n = this.context;
        return void 0 === e
          ? n.length && this.length && this[0].length
            ? n[0].aoData[this[0]]._aData
            : void 0
          : (((t = n[0].aoData[this[0]])._aData = e),
            Array.isArray(e) && t.nTr && t.nTr.id && g(n[0].rowId)(e, t.nTr.id),
            l(n[0], this[0], "data"),
            this);
      }),
      t("row().node()", function () {
        var e = this.context;
        return e.length &&
          this.length &&
          this[0].length &&
          (e = e[0].aoData[this[0]]) &&
          e.nTr
          ? e.nTr
          : null;
      }),
      t("row.add()", function (t) {
        t instanceof P && t.length && (t = t[0]);
        var e = this.iterator("table", function (e) {
          return t.nodeName && "TR" === t.nodeName.toUpperCase()
            ? Q(e, t)[0]
            : v(e, t);
        });
        return this.row(e[0]);
      }),
      P(D).on("plugin-init.dt", function (e, t) {
        var a = new $(t);
        a.on("stateSaveParams.DT", function (e, t, n) {
          e = t.rowIdFn;
          for (var a = t.aiDisplayMaster, r = [], o = 0; o < a.length; o++) {
            var i = t.aoData[a[o]];
            i._detailsShow && r.push("#" + e(i._aData));
          }
          n.childRows = r;
        }),
          a.on("stateLoaded.DT", function (e, t, n) {
            xt(a, n);
          }),
          xt(a, a.state.loaded());
      }),
      function (e, t) {
        t &&
          t.childRows &&
          e
            .rows(
              t.childRows.map(function (e) {
                return e.replace(/([^:\\]*(?:\\.[^:\\]*)*):/g, "$1\\:");
              })
            )
            .every(function () {
              V(e.settings()[0], null, "requestChild", [this]);
            });
      }),
    St = q.util.throttle(function (e) {
      je(e[0]);
    }, 500),
    wt = function (e, t) {
      var n = e.context;
      n.length &&
        (e = n[0].aoData[void 0 !== t ? t : e[0]]) &&
        e._details &&
        (e._details.remove(),
        (e._detailsShow = void 0),
        (e._details = void 0),
        P(e.nTr).removeClass("dt-hasChild"),
        St(n));
    },
    Tt =
      (t("row().child()", function (e, t) {
        var n = this.context;
        return void 0 === e
          ? n.length && this.length && n[0].aoData[this[0]]
            ? n[0].aoData[this[0]]._details
            : void 0
          : (!0 === e
              ? this.child.show()
              : !1 === e
              ? wt(this)
              : n.length && this.length && et(n[0], n[0].aoData[this[0]], e, t),
            this);
      }),
      t(["row().child.show()", "row().child().show()"], function () {
        return tt(this, !0), this;
      }),
      t(["row().child.hide()", "row().child().hide()"], function () {
        return tt(this, !1), this;
      }),
      t(["row().child.remove()", "row().child().remove()"], function () {
        return wt(this), this;
      }),
      t("row().child.isShown()", function () {
        var e = this.context;
        return (
          (e.length &&
            this.length &&
            e[0].aoData[this[0]] &&
            e[0].aoData[this[0]]._detailsShow) ||
          !1
        );
      }),
      /^([^:]+)?:(name|title|visIdx|visible)$/),
    _t =
      (t("columns()", function (n, a) {
        void 0 === n ? (n = "") : P.isPlainObject(n) && ((a = n), (n = "")),
          (a = Qe(a));
        var e = this.iterator(
          "table",
          function (e) {
            return (
              (t = n),
              (i = a),
              (l = (o = e).aoColumns),
              (s = T(l, "sName")),
              (u = T(l, "sTitle")),
              (e = q.util.get("[].[].cell")(o.aoHeader)),
              (c = C(pt([], e))),
              Ze(
                "column",
                t,
                function (n) {
                  var a,
                    e = qe(n);
                  if ("" === n) return d(l.length);
                  if (null !== e) return [0 <= e ? e : l.length + e];
                  if ("function" == typeof n)
                    return (
                      (a = Dt(o, i)),
                      l.map(function (e, t) {
                        return n(t, nt(o, t, 0, 0, a), at(o, t)) ? t : null;
                      })
                    );
                  var t,
                    r = "string" == typeof n ? n.match(Tt) : "";
                  if (r)
                    switch (r[2]) {
                      case "visIdx":
                      case "visible":
                        return r[1] && r[1].match(/^\d+$/)
                          ? (e = parseInt(r[1], 10)) < 0
                            ? [
                                (t = l.map(function (e, t) {
                                  return e.bVisible ? t : null;
                                }))[t.length + e],
                              ]
                            : [I(o, e)]
                          : l.map(function (e, t) {
                              return e.bVisible &&
                                (!r[1] || 0 < P(c[t]).filter(r[1]).length)
                                ? t
                                : null;
                            });
                      case "name":
                        return s.map(function (e, t) {
                          return e === r[1] ? t : null;
                        });
                      case "title":
                        return u.map(function (e, t) {
                          return e === r[1] ? t : null;
                        });
                      default:
                        return [];
                    }
                  return n.nodeName && n._DT_CellIndex
                    ? [n._DT_CellIndex.column]
                    : (e = P(c)
                        .filter(n)
                        .map(function () {
                          return Z(this);
                        })
                        .toArray()).length || !n.nodeName
                    ? e
                    : (e = P(n).closest("*[data-dt-column]")).length
                    ? [e.data("dt-column")]
                    : [];
                },
                o,
                i
              )
            );
            var o, t, i, l, s, u, c;
          },
          1
        );
        return (e.selector.cols = n), (e.selector.opts = a), e;
      }),
      e("columns().header()", "column().header()", function (n) {
        return this.iterator(
          "column",
          function (e, t) {
            return at(e, t, n);
          },
          1
        );
      }),
      e("columns().footer()", "column().footer()", function (n) {
        return this.iterator(
          "column",
          function (e, t) {
            return e.aoFooter.length
              ? e.aoFooter[void 0 !== n ? n : 0][t].cell
              : null;
          },
          1
        );
      }),
      e("columns().data()", "column().data()", function () {
        return this.iterator("column-rows", nt, 1);
      }),
      e("columns().render()", "column().render()", function (o) {
        return this.iterator(
          "column-rows",
          function (e, t, n, a, r) {
            return nt(e, t, n, a, r, o);
          },
          1
        );
      }),
      e("columns().dataSrc()", "column().dataSrc()", function () {
        return this.iterator(
          "column",
          function (e, t) {
            return e.aoColumns[t].mData;
          },
          1
        );
      }),
      e("columns().cache()", "column().cache()", function (o) {
        return this.iterator(
          "column-rows",
          function (e, t, n, a, r) {
            return ze(
              e.aoData,
              r,
              "search" === o ? "_aFilterData" : "_aSortData",
              t
            );
          },
          1
        );
      }),
      e("columns().init()", "column().init()", function () {
        return this.iterator(
          "column",
          function (e, t) {
            return e.aoColumns[t];
          },
          1
        );
      }),
      e("columns().nodes()", "column().nodes()", function () {
        return this.iterator(
          "column-rows",
          function (e, t, n, a, r) {
            return ze(e.aoData, r, "anCells", t);
          },
          1
        );
      }),
      e("columns().titles()", "column().title()", function (n, a) {
        return this.iterator(
          "column",
          function (e, t) {
            return (
              "number" == typeof n && ((a = n), (n = void 0)),
              (e = P("span.dt-column-title", this.column(t).header(a))),
              void 0 !== n ? (e.html(n), this) : e.html()
            );
          },
          1
        );
      }),
      e("columns().types()", "column().type()", function () {
        return this.iterator(
          "column",
          function (e, t) {
            return (t = e.aoColumns[t].sType) || j(e), t;
          },
          1
        );
      }),
      e("columns().visible()", "column().visible()", function (u, n) {
        var t = this,
          c = [],
          e = this.iterator("column", function (e, t) {
            if (void 0 === u) return e.aoColumns[t].bVisible;
            var n = (o = e.aoColumns)[t],
              a = e.aoData;
            if (void 0 === u) e = n.bVisible;
            else if (n.bVisible === u) e = !1;
            else {
              if (u)
                for (
                  var r,
                    o,
                    i = T(o, "bVisible").indexOf(!0, t + 1),
                    l = 0,
                    s = a.length;
                  l < s;
                  l++
                )
                  a[l] &&
                    ((r = a[l].nTr), (o = a[l].anCells), r) &&
                    r.insertBefore(o[t], o[i] || null);
              else P(T(e.aoData, "anCells", t)).detach();
              (n.bVisible = u), _e(e), (e = !0);
            }
            e && c.push(t);
          });
        return (
          void 0 !== u &&
            this.iterator("table", function (e) {
              se(e, e.aoHeader),
                se(e, e.aoFooter),
                e.aiDisplay.length ||
                  P(e.nTBody).find("td[colspan]").attr("colspan", s(e)),
                je(e),
                t.iterator("column", function (e, t) {
                  c.includes(t) &&
                    V(e, null, "column-visibility", [e, t, u, n]);
                }),
                c.length && (void 0 === n || n) && t.columns.adjust();
            }),
          e
        );
      }),
      e("columns().widths()", "column().width()", function () {
        var e = this.columns(":visible").count(),
          e = P("<tr>").html("<td>" + Array(e).join("</td><td>") + "</td>"),
          n =
            (P(this.table().body()).append(e),
            e.children().map(function () {
              return P(this).outerWidth();
            }));
        return (
          e.remove(),
          this.iterator(
            "column",
            function (e, t) {
              return null !== (e = A(e, t)) ? n[e] : 0;
            },
            1
          )
        );
      }),
      e("columns().indexes()", "column().index()", function (n) {
        return this.iterator(
          "column",
          function (e, t) {
            return "visible" === n ? A(e, t) : t;
          },
          1
        );
      }),
      t("columns.adjust()", function () {
        return this.iterator(
          "table",
          function (e) {
            L(e);
          },
          1
        );
      }),
      t("column.index()", function (e, t) {
        var n;
        if (0 !== this.context.length)
          return (
            (n = this.context[0]),
            "fromVisible" === e || "toData" === e
              ? I(n, t)
              : "fromData" === e || "toVisible" === e
              ? A(n, t)
              : void 0
          );
      }),
      t("column()", function (e, t) {
        return Ke(this.columns(e, t));
      }),
      t("cells()", function (g, e, m) {
        var n, a, r, o, i, l, t;
        return (
          P.isPlainObject(g) &&
            (void 0 === g.row ? ((m = g), (g = null)) : ((m = e), (e = null))),
          P.isPlainObject(e) && ((m = e), (e = null)),
          null == e
            ? this.iterator("table", function (e) {
                return (
                  (n = e),
                  (e = g),
                  (t = Qe(m)),
                  (c = n.aoData),
                  (d = Dt(n, t)),
                  (f = Ye(ze(c, d, "anCells"))),
                  (h = P(pt([], f))),
                  (p = n.aoColumns.length),
                  Ze(
                    "cell",
                    e,
                    function (e) {
                      var t = "function" == typeof e;
                      if (null == e || t) {
                        for (r = [], o = 0, i = d.length; o < i; o++)
                          for (a = d[o], l = 0; l < p; l++)
                            (s = { row: a, column: l }),
                              (t &&
                                ((u = c[a]),
                                !e(
                                  s,
                                  M(n, a, l),
                                  u.anCells ? u.anCells[l] : null
                                ))) ||
                                r.push(s);
                        return r;
                      }
                      return P.isPlainObject(e)
                        ? void 0 !== e.column &&
                          void 0 !== e.row &&
                          -1 !== d.indexOf(e.row)
                          ? [e]
                          : []
                        : (t = h
                            .filter(e)
                            .map(function (e, t) {
                              return {
                                row: t._DT_CellIndex.row,
                                column: t._DT_CellIndex.column,
                              };
                            })
                            .toArray()).length || !e.nodeName
                        ? t
                        : (u = P(e).closest("*[data-dt-row]")).length
                        ? [
                            {
                              row: u.data("dt-row"),
                              column: u.data("dt-column"),
                            },
                          ]
                        : [];
                    },
                    n,
                    t
                  )
                );
                var n, t, a, r, o, i, l, s, u, c, d, f, h, p;
              })
            : ((t = m
                ? { page: m.page, order: m.order, search: m.search }
                : {}),
              (n = this.columns(e, t)),
              (a = this.rows(g, t)),
              (t = this.iterator(
                "table",
                function (e, t) {
                  for (e = [], r = 0, o = a[t].length; r < o; r++)
                    for (i = 0, l = n[t].length; i < l; i++)
                      e.push({ row: a[t][r], column: n[t][i] });
                  return e;
                },
                1
              )),
              (t = m && m.selected ? this.cells(t, m) : t),
              P.extend(t.selector, { cols: e, rows: g, opts: m }),
              t)
        );
      }),
      e("cells().nodes()", "cell().node()", function () {
        return this.iterator(
          "cell",
          function (e, t, n) {
            return (e = e.aoData[t]) && e.anCells ? e.anCells[n] : void 0;
          },
          1
        );
      }),
      t("cells().data()", function () {
        return this.iterator(
          "cell",
          function (e, t, n) {
            return M(e, t, n);
          },
          1
        );
      }),
      e("cells().cache()", "cell().cache()", function (a) {
        return (
          (a = "search" === a ? "_aFilterData" : "_aSortData"),
          this.iterator(
            "cell",
            function (e, t, n) {
              return e.aoData[t][a][n];
            },
            1
          )
        );
      }),
      e("cells().render()", "cell().render()", function (a) {
        return this.iterator(
          "cell",
          function (e, t, n) {
            return M(e, t, n, a);
          },
          1
        );
      }),
      e("cells().indexes()", "cell().index()", function () {
        return this.iterator(
          "cell",
          function (e, t, n) {
            return { row: t, column: n, columnVisible: A(e, n) };
          },
          1
        );
      }),
      e("cells().invalidate()", "cell().invalidate()", function (a) {
        return this.iterator("cell", function (e, t, n) {
          l(e, t, a, n);
        });
      }),
      t("cell()", function (e, t, n) {
        return Ke(this.cells(e, t, n));
      }),
      t("cell().data()", function (e) {
        var t,
          n,
          a,
          r = this.context,
          o = this[0];
        return void 0 === e
          ? r.length && o.length
            ? M(r[0], o[0].row, o[0].column)
            : void 0
          : ((t = r[0]),
            (n = o[0].row),
            (a = o[0].column),
            t.aoColumns[a].fnSetData(t.aoData[n]._aData, e, {
              settings: t,
              row: n,
              col: a,
            }),
            l(r[0], o[0].row, "data", o[0].column),
            this);
      }),
      t("order()", function (t, e) {
        var n = this.context,
          a = Array.prototype.slice.call(arguments);
        return void 0 === t
          ? 0 !== n.length
            ? n[0].aaSorting
            : void 0
          : ("number" == typeof t ? (t = [[t, e]]) : 1 < a.length && (t = a),
            this.iterator("table", function (e) {
              e.aaSorting = Array.isArray(t) ? t.slice() : t;
            }));
      }),
      t("order.listener()", function (t, n, a) {
        return this.iterator("table", function (e) {
          Ce(e, t, {}, n, a);
        });
      }),
      t("order.fixed()", function (t) {
        var e;
        return t
          ? this.iterator("table", function (e) {
              e.aaSortingFixed = P.extend(!0, {}, t);
            })
          : ((e = (e = this.context).length ? e[0].aaSortingFixed : void 0),
            Array.isArray(e) ? { pre: e } : e);
      }),
      t(["columns().order()", "column().order()"], function (n) {
        var a = this;
        return n
          ? this.iterator("table", function (e, t) {
              e.aaSorting = a[t].map(function (e) {
                return [e, n];
              });
            })
          : this.iterator(
              "column",
              function (e, t) {
                for (var n = 0, a = (e = Ae(e)).length; n < a; n++)
                  if (e[n].col === t) return e[n].dir;
                return null;
              },
              1
            );
      }),
      e("columns().orderable()", "column().orderable()", function (n) {
        return this.iterator(
          "column",
          function (e, t) {
            return (e = e.aoColumns[t]), n ? e.asSorting : e.bSortable;
          },
          1
        );
      }),
      t("processing()", function (t) {
        return this.iterator("table", function (e) {
          y(e, t);
        });
      }),
      t("search()", function (t, n, a, r) {
        var e = this.context;
        return void 0 === t
          ? 0 !== e.length
            ? e[0].oPreviousSearch.search
            : void 0
          : this.iterator("table", function (e) {
              e.oFeatures.bFilter &&
                me(
                  e,
                  "object" == typeof n
                    ? P.extend(e.oPreviousSearch, n, { search: t })
                    : P.extend(e.oPreviousSearch, {
                        search: t,
                        regex: null !== n && n,
                        smart: null === a || a,
                        caseInsensitive: null === r || r,
                      })
                );
            });
      }),
      t("search.fixed()", function (t, n) {
        var e = this.iterator(!0, "table", function (e) {
          return (
            (e = e.searchFixed),
            t
              ? void 0 === n
                ? e[t]
                : (null === n ? delete e[t] : (e[t] = n), this)
              : Object.keys(e)
          );
        });
        return void 0 !== t && void 0 === n ? e[0] : e;
      }),
      e("columns().search()", "column().search()", function (a, r, o, i) {
        return this.iterator("column", function (e, t) {
          var n = e.aoPreSearchCols;
          if (void 0 === a) return n[t].search;
          e.oFeatures.bFilter &&
            ("object" == typeof r
              ? P.extend(n[t], r, { search: a })
              : P.extend(n[t], {
                  search: a,
                  regex: null !== r && r,
                  smart: null === o || o,
                  caseInsensitive: null === i || i,
                }),
            me(e, e.oPreviousSearch));
        });
      }),
      t(
        ["columns().search.fixed()", "column().search.fixed()"],
        function (n, a) {
          var e = this.iterator(!0, "column", function (e, t) {
            return (
              (e = e.aoColumns[t].searchFixed),
              n
                ? void 0 === a
                  ? e[n]
                  : (null === a ? delete e[n] : (e[n] = a), this)
                : Object.keys(e)
            );
          });
          return void 0 !== n && void 0 === a ? e[0] : e;
        }
      ),
      t("state()", function (e, t) {
        var n;
        return e
          ? ((n = P.extend(!0, {}, e)),
            this.iterator("table", function (e) {
              !1 !== t && (n.time = +new Date() + 100),
                Re(e, n, function () {});
            }))
          : this.context.length
          ? this.context[0].oSavedState
          : null;
      }),
      t("state.clear()", function () {
        return this.iterator("table", function (e) {
          e.fnStateSaveCallback.call(e.oInstance, e, {});
        });
      }),
      t("state.loaded()", function () {
        return this.context.length ? this.context[0].oLoadedState : null;
      }),
      t("state.save()", function () {
        return this.iterator("table", function (e) {
          je(e);
        });
      }),
      (q.use = function (e, t) {
        var n = "string" == typeof e ? t : e;
        if (
          ((e = "string" == typeof t ? t : e),
          void 0 === n && "string" == typeof e)
        )
          switch (e) {
            case "lib":
            case "jq":
              return P;
            case "win":
              return k;
            case "datetime":
              return q.DateTime;
            case "luxon":
              return u;
            case "moment":
              return f;
            default:
              return null;
          }
        "lib" === e || "jq" === e || (n && n.fn && n.fn.jquery)
          ? (P = n)
          : "win" == e || (n && n.document)
          ? (D = (k = n).document)
          : "datetime" === e || (n && "DateTime" === n.type)
          ? (q.DateTime = n)
          : "luxon" === e || (n && n.FixedOffsetZone)
          ? (u = n)
          : ("moment" === e || (n && n.isMoment)) && (f = n);
      }),
      (q.factory = function (e, t) {
        var n = !1;
        return (
          e && e.document && (D = (k = e).document),
          t && t.fn && t.fn.jquery && ((P = t), (n = !0)),
          n
        );
      }),
      (q.versionCheck = function (e, t) {
        t = (t || q.version).split(".");
        for (var n, a, r = 0, o = (e = e.split(".")).length; r < o; r++)
          if ((n = parseInt(t[r], 10) || 0) !== (a = parseInt(e[r], 10) || 0))
            return a < n;
        return !0;
      }),
      (q.isDataTable = function (e) {
        var a = P(e).get(0),
          r = !1;
        return (
          e instanceof q.Api ||
          (P.each(q.settings, function (e, t) {
            e = t.nScrollHead ? P("table", t.nScrollHead)[0] : null;
            var n = t.nScrollFoot ? P("table", t.nScrollFoot)[0] : null;
            (t.nTable !== a && e !== a && n !== a) || (r = !0);
          }),
          r)
        );
      }),
      (q.tables = function (t) {
        var e = !1,
          n =
            (P.isPlainObject(t) && ((e = t.api), (t = t.visible)),
            q.settings
              .filter(function (e) {
                return !(t && !P(e.nTable).is(":visible"));
              })
              .map(function (e) {
                return e.nTable;
              }));
        return e ? new $(n) : n;
      }),
      (q.camelToHungarian = E),
      t("$()", function (e, t) {
        return (
          (t = this.rows(t).nodes()),
          (t = P(t)),
          P([].concat(t.filter(e).toArray(), t.find(e).toArray()))
        );
      }),
      P.each(["on", "one", "off"], function (e, n) {
        t(n + "()", function () {
          var e = Array.prototype.slice.call(arguments),
            t =
              ((e[0] = e[0]
                .split(/\s/)
                .map(function (e) {
                  return e.match(/\.dt\b/) ? e : e + ".dt";
                })
                .join(" ")),
              P(this.tables().nodes()));
          return t[n].apply(t, e), this;
        });
      }),
      t("clear()", function () {
        return this.iterator("table", function (e) {
          te(e);
        });
      }),
      t("error()", function (t) {
        return this.iterator("table", function (e) {
          H(e, 0, t);
        });
      }),
      t("settings()", function () {
        return new $(this.context, this.context);
      }),
      t("init()", function () {
        var e = this.context;
        return e.length ? e[0].oInit : null;
      }),
      t("data()", function () {
        return this.iterator("table", function (e) {
          return T(e.aoData, "_aData");
        }).flatten();
      }),
      t("trigger()", function (t, n, a) {
        return this.iterator("table", function (e) {
          return V(e, null, t, n, a);
        }).flatten();
      }),
      t("ready()", function (e) {
        var t = this.context;
        return e
          ? this.tables().every(function () {
              this.context[0]._bInitComplete
                ? e.call(this)
                : this.on("init.dt.DT", function () {
                    e.call(this);
                  });
            })
          : t.length
          ? t[0]._bInitComplete || !1
          : null;
      }),
      t("destroy()", function (c) {
        return (
          (c = c || !1),
          this.iterator("table", function (e) {
            var t = e.oClasses,
              n = e.nTable,
              a = e.nTBody,
              r = e.nTHead,
              o = e.nTFoot,
              i = P(n),
              l = P(a),
              a = P(e.nTableWrapper),
              s = e.aoData.map(function (e) {
                return e ? e.nTr : null;
              }),
              u = t.order;
            (e.bDestroying = !0),
              V(e, "aoDestroyCallback", "destroy", [e], !0),
              c || new $(e).columns().visible(!0),
              a.off(".DT").find(":not(tbody *)").off(".DT"),
              P(k).off(".DT-" + e.sInstance),
              n != r.parentNode && (i.children("thead").detach(), i.append(r)),
              o &&
                n != o.parentNode &&
                (i.children("tfoot").detach(), i.append(o)),
              e.colgroup.remove(),
              (e.aaSorting = []),
              (e.aaSortingFixed = []),
              Ne(e),
              P("th, td", r)
                .removeClass(
                  u.canAsc + " " + u.canDesc + " " + u.isAsc + " " + u.isDesc
                )
                .css("width", ""),
              l.children().detach(),
              l.append(s),
              (r = e.nTableWrapper.parentNode),
              (o = e.nTableWrapper.nextSibling),
              i[(l = c ? "remove" : "detach")](),
              a[l](),
              !c &&
                r &&
                (r.insertBefore(n, o),
                i.css("width", e.sDestroyWidth).removeClass(t.table)),
              -1 !== (e = q.settings.indexOf(e)) && q.settings.splice(e, 1);
          })
        );
      }),
      P.each(["column", "row", "cell"], function (e, s) {
        t(s + "s().every()", function (a) {
          var r,
            o = this.selector.opts,
            i = this,
            l = 0;
          return this.iterator("every", function (e, t, n) {
            (r = i[s](t, o)),
              "cell" === s
                ? a.call(r, r[0][0].row, r[0][0].column, n, l)
                : a.call(r, t, n, l),
              l++;
          });
        });
      }),
      t("i18n()", function (e, t, n) {
        var a = this.context[0];
        return (
          (e = U(e)(a.oLanguage)),
          "string" ==
          typeof (e = P.isPlainObject((e = void 0 === e ? t : e))
            ? void 0 !== n && void 0 !== e[n]
              ? e[n]
              : e._
            : e)
            ? e.replace("%d", n)
            : e
        );
      }),
      (q.version = "2.1.8"),
      (q.settings = []),
      (q.models = {}),
      (q.models.oSearch = {
        caseInsensitive: !0,
        search: "",
        regex: !1,
        smart: !0,
        return: !1,
      }),
      (q.models.oRow = {
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
      (q.models.oColumn = {
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
      (q.defaults = {
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
              number: "",
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
        orderDescReverse: !0,
        oSearch: P.extend({}, q.models.oSearch),
        layout: {
          topStart: "pageLength",
          topEnd: "search",
          bottomStart: "info",
          bottomEnd: "paging",
        },
        sDom: null,
        searchDelay: null,
        sPaginationType: "",
        sScrollX: "",
        sScrollXInner: "",
        sScrollY: "",
        sServerMethod: "GET",
        renderer: null,
        rowId: "DT_RowId",
        caption: null,
        iDeferLoading: null,
      }),
      i(q.defaults),
      (q.defaults.column = {
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
      i(q.defaults.column),
      (q.models.oSettings = {
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
          return "ssp" == B(this)
            ? +this._iRecordsTotal
            : this.aiDisplayMaster.length;
        },
        fnRecordsDisplay: function () {
          return "ssp" == B(this)
            ? +this._iRecordsDisplay
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
            : !o || a < n || -1 === e
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
        deferLoading: null,
        typeDetect: !0,
      }),
      P.extend(q.ext.pager, {
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
        _numbers: Be,
        numbers_length: 7,
      }),
      P.extend(!0, q.ext.renderer, {
        pagingButton: {
          _: function (e, t, n, a, r) {
            var o = [(e = e.oClasses.paging).button];
            return (
              a && o.push(e.active),
              r && o.push(e.disabled),
              {
                display: (t =
                  "ellipsis" === t
                    ? P('<span class="ellipsis"></span>').html(n)[0]
                    : P("<button>", {
                        class: o.join(" "),
                        role: "link",
                        type: "button",
                      }).html(n)),
                clicker: t,
              }
            );
          },
        },
        pagingContainer: {
          _: function (e, t) {
            return t;
          },
        },
      }),
      !1),
    Ct = ",",
    Lt = ".";
  if (void 0 !== k.Intl)
    try {
      for (
        var It = new Intl.NumberFormat().formatToParts(100000.1), a = 0;
        a < It.length;
        a++
      )
        "group" === It[a].type
          ? (Ct = It[a].value)
          : "decimal" === It[a].type && (Lt = It[a].value);
    } catch (e) {}
  (q.datetime = function (n, a) {
    var r = "datetime-" + n;
    (a ||= "en"),
      q.ext.type.order[r] ||
        q.type(r, {
          detect: function (e) {
            var t = He(e, n, a);
            return !("" !== e && !t) && r;
          },
          order: {
            pre: function (e) {
              return He(e, n, a) || 0;
            },
          },
          className: "dt-right",
        });
  }),
    (q.render = {
      date: We("toLocaleDateString"),
      datetime: We("toLocaleString"),
      time: We("toLocaleTimeString"),
      number: function (r, o, i, l, s) {
        return (
          null == r && (r = Ct),
          null == o && (o = Lt),
          {
            display: function (e) {
              var t, n, a;
              return ("number" != typeof e && "string" != typeof e) ||
                "" === e ||
                null === e
                ? e
                : ((t = e < 0 ? "-" : ""),
                  (n = parseFloat(e)),
                  1e11 <= (a = Math.abs(n)) || (a < 1e-4 && 0 !== a)
                    ? (t = n.toExponential(i).split(/e\+?/))[0] +
                      " x 10<sup>" +
                      t[1] +
                      "</sup>"
                    : isNaN(n)
                    ? h(e)
                    : ((n = n.toFixed(i)),
                      (e = Math.abs(n)),
                      (n = parseInt(e, 10)),
                      (e = i ? o + (e - n).toFixed(i).substring(2) : ""),
                      (t = 0 === n && 0 === parseFloat(e) ? "" : t) +
                        (l || "") +
                        n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, r) +
                        e +
                        (s || "")));
            },
          }
        );
      },
      text: function () {
        return { display: h, filter: h };
      },
    });
  function At(e, t) {
    return (
      (e = null != e ? e.toString().toLowerCase() : ""),
      (t = null != t ? t.toString().toLowerCase() : ""),
      e.localeCompare(t, navigator.languages[0] || navigator.language, {
        numeric: !0,
        ignorePunctuation: !0,
      })
    );
  }
  var o = q.ext.type,
    Ft =
      ((q.type = function (n, e, t) {
        if (!e)
          return {
            className: o.className[n],
            detect: o.detect.find(function (e) {
              return e._name === n;
            }),
            order: {
              pre: o.order[n + "-pre"],
              asc: o.order[n + "-asc"],
              desc: o.order[n + "-desc"],
            },
            render: o.render[n],
            search: o.search[n],
          };
        function a(e) {
          Object.defineProperty(e, "_name", { value: n });
          var t = o.detect.findIndex(function (e) {
            return e._name === n;
          });
          -1 === t ? o.detect.unshift(e) : o.detect.splice(t, 1, e);
        }
        function r(e) {
          (o.order[n + "-pre"] = e.pre),
            (o.order[n + "-asc"] = e.asc),
            (o.order[n + "-desc"] = e.desc);
        }
        void 0 === t && ((t = e), (e = null)),
          "className" === e
            ? (o.className[n] = t)
            : "detect" === e
            ? a(t)
            : "order" === e
            ? r(t)
            : "render" === e
            ? (o.render[n] = t)
            : "search" === e
            ? (o.search[n] = t)
            : e ||
              (t.className && (o.className[n] = t.className),
              void 0 !== t.detect && a(t.detect),
              t.order && r(t.order),
              void 0 !== t.render && (o.render[n] = t.render),
              void 0 !== t.search && (o.search[n] = t.search));
      }),
      (q.types = function () {
        return o.detect.map(function (e) {
          return e._name;
        });
      }),
      q.type("string", {
        detect: function () {
          return "string";
        },
        order: {
          pre: function (e) {
            return w(e) && "boolean" != typeof e
              ? ""
              : "string" == typeof e
              ? e.toLowerCase()
              : e.toString
              ? e.toString()
              : "";
          },
        },
        search: rt(!1, !0),
      }),
      q.type("string-utf8", {
        detect: {
          allOf: function (e) {
            return !0;
          },
          oneOf: function (e) {
            return (
              !w(e) &&
              navigator.languages &&
              "string" == typeof e &&
              e.match(/[^\x00-\x7F]/)
            );
          },
        },
        order: {
          asc: At,
          desc: function (e, t) {
            return -1 * At(e, t);
          },
        },
        search: rt(!1, !0),
      }),
      q.type("html", {
        detect: {
          allOf: function (e) {
            return w(e) || ("string" == typeof e && -1 !== e.indexOf("<"));
          },
          oneOf: function (e) {
            return !w(e) && "string" == typeof e && -1 !== e.indexOf("<");
          },
        },
        order: {
          pre: function (e) {
            return w(e) ? "" : e.replace ? _(e).trim().toLowerCase() : e + "";
          },
        },
        search: rt(!0, !0),
      }),
      q.type("date", {
        className: "dt-type-date",
        detect: {
          allOf: function (e) {
            var t;
            return !e || e instanceof Date || ut.test(e)
              ? (null !== (t = Date.parse(e)) && !isNaN(t)) || w(e)
              : null;
          },
          oneOf: function (e) {
            return e instanceof Date || ("string" == typeof e && ut.test(e));
          },
        },
        order: {
          pre: function (e) {
            return (e = Date.parse(e)), isNaN(e) ? -1 / 0 : e;
          },
        },
      }),
      q.type("html-num-fmt", {
        className: "dt-type-numeric",
        detect: {
          allOf: function (e, t) {
            return $e(e, t.oLanguage.sDecimal, !0, !1);
          },
          oneOf: function (e, t) {
            return $e(e, t.oLanguage.sDecimal, !0, !1);
          },
        },
        order: {
          pre: function (e, t) {
            return Ft(e, t.oLanguage.sDecimal, lt, dt);
          },
        },
        search: rt(!0, !0),
      }),
      q.type("html-num", {
        className: "dt-type-numeric",
        detect: {
          allOf: function (e, t) {
            return $e(e, t.oLanguage.sDecimal, !1, !0);
          },
          oneOf: function (e, t) {
            return $e(e, t.oLanguage.sDecimal, !1, !1);
          },
        },
        order: {
          pre: function (e, t) {
            return Ft(e, t.oLanguage.sDecimal, lt);
          },
        },
        search: rt(!0, !0),
      }),
      q.type("num-fmt", {
        className: "dt-type-numeric",
        detect: {
          allOf: function (e, t) {
            return Ue(e, t.oLanguage.sDecimal, !0, !0);
          },
          oneOf: function (e, t) {
            return Ue(e, t.oLanguage.sDecimal, !0, !1);
          },
        },
        order: {
          pre: function (e, t) {
            return Ft(e, t.oLanguage.sDecimal, dt);
          },
        },
      }),
      q.type("num", {
        className: "dt-type-numeric",
        detect: {
          allOf: function (e, t) {
            return Ue(e, t.oLanguage.sDecimal, !1, !0);
          },
          oneOf: function (e, t) {
            return Ue(e, t.oLanguage.sDecimal, !1, !1);
          },
        },
        order: {
          pre: function (e, t) {
            return Ft(e, t.oLanguage.sDecimal);
          },
        },
      }),
      function (e, t, n, a) {
        var r;
        return 0 === e || (e && "-" !== e)
          ? "number" == (r = typeof e) || "bigint" == r
            ? e
            : +(e =
                (e = t ? ft(e, t) : e).replace &&
                (n && (e = e.replace(n, "")), a)
                  ? e.replace(a, "")
                  : e)
          : -1 / 0;
      }),
    Nt =
      (P.extend(!0, q.ext.renderer, {
        footer: {
          _: function (e, t, n) {
            t.addClass(n.tfoot.cell);
          },
        },
        header: {
          _: function (d, f, h) {
            f.addClass(h.thead.cell),
              d.oFeatures.bSort || f.addClass(h.order.none);
            var e = d.bSortCellsTop,
              t = f.closest("thead").find("tr"),
              n = f.parent().index();
            "disable" === f.attr("data-dt-order") ||
              "disable" === f.parent().attr("data-dt-order") ||
              (!0 === e && 0 !== n) ||
              (!1 === e && n !== t.length - 1) ||
              P(d.nTable).on(
                "order.dt.DT column-visibility.dt.DT",
                function (e, t) {
                  if (d === t) {
                    var n = t.sortDetails;
                    if (n) {
                      for (
                        var a = h.order,
                          r = t.api.columns(f),
                          o =
                            ((e = d.aoColumns[r.flatten()[0]]),
                            r.orderable().includes(!0)),
                          i = "",
                          l = r.indexes(),
                          s = r.orderable(!0).flatten(),
                          u = T(n, "col"),
                          c =
                            (f
                              .removeClass(a.isAsc + " " + a.isDesc)
                              .toggleClass(a.none, !o)
                              .toggleClass(a.canAsc, o && s.includes("asc"))
                              .toggleClass(a.canDesc, o && s.includes("desc")),
                            !0),
                          s = 0;
                        s < l.length;
                        s++
                      )
                        u.includes(l[s]) || (c = !1);
                      for (
                        c &&
                          ((s = r.order()),
                          f.addClass(
                            s.includes("asc")
                              ? a.isAsc
                              : "" + s.includes("desc")
                              ? a.isDesc
                              : ""
                          )),
                          a = -1,
                          s = 0;
                        s < u.length;
                        s++
                      )
                        if (d.aoColumns[u[s]].bVisible) {
                          a = u[s];
                          break;
                        }
                      l[0] == a
                        ? ((n = n[0]),
                          (i = e.asSorting),
                          f.attr(
                            "aria-sort",
                            "asc" === n.dir ? "ascending" : "descending"
                          ),
                          (i = i[n.index + 1] ? "Reverse" : "Remove"))
                        : f.removeAttr("aria-sort"),
                        f.attr(
                          "aria-label",
                          o
                            ? e.ariaTitle + t.api.i18n("oAria.orderable" + i)
                            : e.ariaTitle
                        ),
                        o &&
                          (f.find(".dt-column-title").attr("role", "button"),
                          f.attr("tabindex", 0));
                    }
                  }
                }
              );
          },
        },
        layout: {
          _: function (e, t, n) {
            var a = e.oClasses.layout,
              r = P("<div/>")
                .attr("id", n.id || null)
                .addClass(n.className || a.row)
                .appendTo(t);
            P.each(n, function (e, t) {
              var n;
              "id" !== e &&
                "className" !== e &&
                ((n = ""),
                t.table && (r.addClass(a.tableRow), (n += a.tableCell + " ")),
                (n =
                  "start" === e
                    ? n + a.start
                    : "end" === e
                    ? n + a.end
                    : n + a.full),
                P("<div/>")
                  .attr({
                    id: t.id || null,
                    class: t.className || a.cell + " " + n,
                  })
                  .append(t.contents)
                  .appendTo(r));
            });
          },
        },
      }),
      (q.feature = {}),
      (q.feature.register = function (e, t, n) {
        (q.ext.features[e] = t),
          n && S.feature.push({ cFeature: n, fnInit: t });
      }),
      q.feature.register("div", function (e, t) {
        var n;
        return (
          (e = P("<div>")[0]),
          t &&
            ((n = t.className) && (e.className = n),
            (n = t.id) && (e.id = n),
            (n = t.html) && (e.innerHTML = n),
            (t = t.text)) &&
            (e.textContent = t),
          e
        );
      }),
      q.feature.register(
        "info",
        function (e, l) {
          var t, n, s;
          return e.oFeatures.bInfo
            ? ((t = e.oLanguage),
              (n = e.sTableId),
              (s = P("<div/>", { class: e.oClasses.info.container })),
              (l = P.extend(
                {
                  callback: t.fnInfoCallback,
                  empty: t.sInfoEmpty,
                  postfix: t.sInfoPostFix,
                  search: t.sInfoFiltered,
                  text: t.sInfo,
                },
                l
              )),
              e.aoDrawCallback.push(function (e) {
                var t = l,
                  n = e._iDisplayStart + 1,
                  a = e.fnDisplayEnd(),
                  r = e.fnRecordsTotal(),
                  o = e.fnRecordsDisplay(),
                  i = o ? t.text : t.empty;
                o !== r && (i += " " + t.search),
                  (i = Me(e, (i += t.postfix))),
                  t.callback &&
                    (i = t.callback.call(e.oInstance, e, n, a, r, o, i)),
                  s.html(i),
                  V(e, null, "info", [e, s[0], i]);
              }),
              e._infoEl ||
                (s.attr({
                  "aria-live": "polite",
                  id: n + "_info",
                  role: "status",
                }),
                P(e.nTable).attr("aria-describedby", n + "_info"),
                (e._infoEl = s)),
              s)
            : null;
        },
        "i"
      ),
      0),
    jt =
      (q.feature.register(
        "search",
        function (n, a) {
          var e, t, r, o, i, l, s, u, c, d;
          return n.oFeatures.bFilter
            ? ((e = n.oClasses.search),
              (t = n.sTableId),
              (o = n.oPreviousSearch),
              (c = '<input type="search" class="' + e.input + '"/>'),
              -1 ===
                (a = P.extend(
                  {
                    placeholder: (r = n.oLanguage).sSearchPlaceholder,
                    processing: !1,
                    text: r.sSearch,
                  },
                  a
                )).text.indexOf("_INPUT_") && (a.text += "_INPUT_"),
              (a.text = Me(n, a.text)),
              (r = a.text.match(/_INPUT_$/)),
              (i = a.text.match(/^_INPUT_/)),
              (l = a.text.replace(/_INPUT_/, "")),
              (s = "<label>" + a.text + "</label>"),
              i
                ? (s = "_INPUT_<label>" + l + "</label>")
                : r && (s = "<label>" + l + "</label>_INPUT_"),
              (e = P("<div>")
                .addClass(e.container)
                .append(s.replace(/_INPUT_/, c)))
                .find("label")
                .attr("for", "dt-search-" + Nt),
              e.find("input").attr("id", "dt-search-" + Nt),
              Nt++,
              (u = function (e) {
                var t = this.value;
                (o.return && "Enter" !== e.key) ||
                  (t != o.search &&
                    Se(n, a.processing, function () {
                      (o.search = t), me(n, o), (n._iDisplayStart = 0), b(n);
                    }));
              }),
              (c = null !== n.searchDelay ? n.searchDelay : 0),
              (d = P("input", e)
                .val(o.search)
                .attr("placeholder", a.placeholder)
                .on(
                  "keyup.DT search.DT input.DT paste.DT cut.DT",
                  c ? q.util.debounce(u, c) : u
                )
                .on("mouseup.DT", function (e) {
                  setTimeout(function () {
                    u.call(d[0], e);
                  }, 10);
                })
                .on("keypress.DT", function (e) {
                  if (13 == e.keyCode) return !1;
                })
                .attr("aria-controls", t)),
              P(n.nTable).on("search.dt.DT", function (e, t) {
                n === t &&
                  d[0] !== D.activeElement &&
                  d.val("function" != typeof o.search ? o.search : "");
              }),
              e)
            : null;
        },
        "f"
      ),
      q.feature.register(
        "paging",
        function (e, t) {
          if (!e.oFeatures.bPaginate) return null;
          t = P.extend(
            {
              buttons: q.ext.pager.numbers_length,
              type: e.sPaginationType,
              boundaryNumbers: !0,
              firstLast: !0,
              previousNext: !0,
              numbers: !0,
            },
            t
          );
          function n() {
            Ve(e, a.children(), t);
          }
          var a = P("<div/>")
            .addClass(
              e.oClasses.paging.container + (t.type ? " paging_" + t.type : "")
            )
            .append(
              P("<nav>")
                .attr("aria-label", "pagination")
                .addClass(e.oClasses.paging.nav)
            );
          return (
            e.aoDrawCallback.push(n),
            P(e.nTable).on("column-sizing.dt.DT", n),
            a
          );
        },
        "p"
      ),
      0);
  return (
    q.feature.register(
      "pageLength",
      function (a, e) {
        if (!(o = a.oFeatures).bPaginate || !o.bLengthChange) return null;
        e = P.extend({ menu: a.aLengthMenu, text: a.oLanguage.sLengthMenu }, e);
        var t = a.oClasses.length,
          n = a.sTableId,
          r = e.menu,
          o = [],
          i = [];
        if (Array.isArray(r[0])) (o = r[0]), (i = r[1]);
        else
          for (s = 0; s < r.length; s++)
            P.isPlainObject(r[s])
              ? (o.push(r[s].value), i.push(r[s].label))
              : (o.push(r[s]), i.push(r[s]));
        function l(t) {
          d.forEach(function (e) {
            e.el.textContent = Me(a, e.text, t);
          });
        }
        var s = e.text.match(/_MENU_$/),
          r = e.text.match(/^_MENU_/),
          u = e.text.replace(/_MENU_/, ""),
          c =
            ((e = "<label>" + e.text + "</label>"),
            r
              ? (e = "_MENU_<label>" + u + "</label>")
              : s && (e = "<label>" + u + "</label>_MENU_"),
            (r = "tmp-" + +new Date()),
            P("<div/>")
              .addClass(t.container)
              .append(e.replace("_MENU_", '<span id="' + r + '"></span>'))),
          d = [],
          t =
            (Array.from(c.find("label")[0].childNodes).forEach(function (e) {
              e.nodeType === Node.TEXT_NODE &&
                d.push({ el: e, text: e.textContent });
            }),
            P("<select/>", {
              name: n + "_length",
              "aria-controls": n,
              class: t.select,
            }));
        for (s = 0; s < o.length; s++)
          t[0][s] = new Option(
            "number" == typeof i[s] ? a.fnFormatNumber(i[s]) : i[s],
            o[s]
          );
        return (
          c.find("label").attr("for", "dt-length-" + jt),
          t.attr("id", "dt-length-" + jt),
          jt++,
          c.find("#" + r).replaceWith(t),
          P("select", c)
            .val(a._iDisplayLength)
            .on("change.DT", function () {
              De(a, P(this).val()), b(a);
            }),
          P(a.nTable).on("length.dt.DT", function (e, t, n) {
            a === t && (P("select", c).val(n), l(n));
          }),
          l(a._iDisplayLength),
          c
        );
      },
      "l"
    ),
    (((P.fn.dataTable = q).$ = P).fn.dataTableSettings = q.settings),
    (P.fn.dataTableExt = q.ext),
    (P.fn.DataTable = function (e) {
      return P(this).dataTable(e).api();
    }),
    P.each(q, function (e, t) {
      P.fn.DataTable[e] = t;
    }),
    q
  );
});

// dataTables.inputPaging.min
((e) => {
  var i, n;
  "function" == typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (a) {
        return e(a, window, document);
      })
    : "object" == typeof exports
    ? ((i = require("jquery")),
      (n = function (a, t) {
        t.fn.dataTable || require("datatables.net")(a, t);
      }),
      "undefined" == typeof window
        ? (module.exports = function (a, t) {
            return (a ||= window), (t ||= i(a)), n(a, t), e(t, 0, a.document);
          })
        : (n(window, i), (module.exports = e(i, window, window.document))))
    : e(jQuery, window, document);
})(function (a, t, n) {
  function o(a, t, e) {
    a.classList.toggle(t, e),
      (a = a.querySelector("a")) &&
        (e
          ? a.setAttribute("disabled", "disabled")
          : a.removeAttribute("disabled"));
  }
  function m(a, t, e) {
    var i = n.createElement(a.tag);
    return (
      (i.className = a.className),
      a.liner && a.liner.tag
        ? ((a = m(a.liner, t)), i.appendChild(a))
        : t && (i.textContent = t),
      e && i.addEventListener("click", e),
      i
    );
  }
  var c = a.fn.dataTable;
  return (
    c.feature.register("inputPaging", function (a, t) {
      let e = new c.Api(a),
        i =
          (n = (n = e).table().container().classList).contains(
            "dt-bootstrap5"
          ) ||
          n.contains("dt-bootstrap4") ||
          n.contains("dt-bootstrap")
            ? {
                wrapper: { tag: "ul", className: "dt-inputpaging pagination" },
                item: {
                  tag: "li",
                  className: "page-item",
                  disabled: "disabled",
                  liner: { tag: "a", className: "page-link" },
                },
                inputItem: {
                  tag: "li",
                  className: "page-item dt-paging-input",
                },
                input: { tag: "input", className: "" },
              }
            : n.contains("dt-bulma")
            ? {
                wrapper: {
                  tag: "ul",
                  className: "dt-inputpaging pagination-list",
                },
                item: {
                  tag: "li",
                  className: "",
                  disabled: "disabled",
                  liner: { tag: "a", className: "pagination-link" },
                },
                inputItem: { tag: "li", className: "dt-paging-input" },
                input: { tag: "input", className: "" },
              }
            : n.contains("dt-foundation")
            ? {
                wrapper: { tag: "ul", className: "dt-inputpaging pagination" },
                item: {
                  tag: "li",
                  className: "",
                  disabled: "disabled",
                  liner: { tag: "a", className: "" },
                },
                inputItem: { tag: "li", className: "dt-paging-input" },
                input: { tag: "input", className: "" },
              }
            : n.contains("dt-semanticUI")
            ? {
                wrapper: {
                  tag: "div",
                  className: "dt-inputpaging ui unstackable pagination menu",
                },
                item: {
                  tag: "a",
                  className: "page-link item",
                  disabled: "disabled",
                },
                inputItem: { tag: "div", className: "dt-paging-input" },
                input: { tag: "input", className: "ui input" },
              }
            : {
                wrapper: { tag: "div", className: "dt-inputpaging dt-paging" },
                item: {
                  tag: "button",
                  className: "dt-paging-button",
                  disabled: "disabled",
                },
                inputItem: {
                  tag: "div",
                  className: "dt-paging-input",
                  liner: { tag: "", className: "" },
                },
                input: { tag: "input", className: "" },
              };
      var n;
      (a = Object.assign({ firstLast: !0, previousNext: !0, pageOf: !0 }, t)),
        (t = m(i.wrapper));
      let s = m(i.item, e.i18n("oPaginate.sFirst", "«"), () =>
          e.page("first").draw(!1)
        ),
        p = m(i.item, e.i18n("oPaginate.sPrevious", "‹"), () =>
          e.page("previous").draw(!1)
        ),
        d = m(i.item, e.i18n("oPaginate.sNext", "›"), () =>
          e.page("next").draw(!1)
        ),
        l = m(i.item, e.i18n("oPaginate.sLast", "»"), () =>
          e.page("last").draw(!1)
        ),
        g = m(i.inputItem),
        u = m(i.input),
        r = m({ tag: "span", className: "" });
      return (
        u.setAttribute("type", "text"),
        u.setAttribute("inputmode", "numeric"),
        u.setAttribute("pattern", "[0-9]*"),
        a.firstLast && t.appendChild(s),
        a.previousNext && t.appendChild(p),
        t.appendChild(g),
        a.previousNext && t.appendChild(d),
        a.firstLast && t.appendChild(l),
        g.appendChild(u),
        a.pageOf && g.appendChild(r),
        u.addEventListener("keypress", function (a) {
          (a.charCode < 48 || 57 < a.charCode) && a.preventDefault();
        }),
        u.addEventListener("input", function () {
          u.value && e.page(u.value - 1).draw(!1),
            (u.style.width = u.value.length + 2 + "ch");
        }),
        e.on("draw", () => {
          var a = e.page.info();
          o(s, i.item.disabled, 0 === a.page),
            o(p, i.item.disabled, 0 === a.page),
            o(d, i.item.disabled, a.page === a.pages - 1),
            o(l, i.item.disabled, a.page === a.pages - 1),
            u.value !== a.page + 1 && (u.value = a.page + 1),
            (r.textContent = " / " + a.pages);
        }),
        t
      );
    }),
    c
  );
});

// dataTables.buttons.js
((e) => {
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
            return (t ||= window), (n ||= o(t)), i(t, n), e(n, t, t.document);
          })
        : (i(window, o), (module.exports = e(o, window, window.document))))
    : e(jQuery, window, document);
})(function (y, g, m) {
  function v(t, n, e) {
    y.fn.animate
      ? t.stop().fadeIn(n, e)
      : (t.css("display", "block"), e && e.call(t));
  }
  function x(t, n, e) {
    y.fn.animate
      ? t.stop().fadeOut(n, e)
      : (t.css("display", "none"), e && e.call(t));
  }
  function h(t, n) {
    for (var e = 0; e < n.length; e++)
      for (var o = 0; o < n[e].length; o++) {
        var i = n[e][o];
        i && (i.title = t(i.title, o, i.cell));
      }
    return n;
  }
  function t(t, n) {
    return (
      (t = new e.Api(t)),
      (n = n || t.init().buttons || e.defaults.buttons),
      new C(t, n).container()
    );
  }
  function C(n, t) {
    if (!e.versionCheck("2"))
      throw "Warning: Buttons requires DataTables 2 or newer";
    if (!(this instanceof C))
      return function (t) {
        return new C(t, n).container();
      };
    !0 === (t = void 0 === t ? {} : t) && (t = {}),
      Array.isArray(t) && (t = { buttons: t }),
      (this.c = y.extend(!0, {}, C.defaults, t)),
      t.buttons && (this.c.buttons = t.buttons),
      (this.s = {
        dt: new e.Api(n),
        buttons: [],
        listenKeys: "",
        namespace: "dtb" + o++,
      }),
      (this.dom = {
        container: y("<" + this.c.dom.container.tag + "/>").addClass(
          this.c.dom.container.className
        ),
      }),
      this._constructor();
  }
  var i,
    e = y.fn.dataTable,
    o = 0,
    w = 0,
    _ = e.ext.buttons,
    s = null,
    r =
      (y.extend(C.prototype, {
        action: function (t, n) {
          return (
            (t = this._nodeToButton(t)),
            void 0 === n ? t.conf.action : ((t.conf.action = n), this)
          );
        },
        active: function (t, n) {
          t = this._nodeToButton(t);
          var e = this.c.dom.button.active,
            o = y(t.node);
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
            n = n.split("-");
            for (var i = this.s, o = 0, s = n.length - 1; o < s; o++)
              i = i.buttons[+n[o]];
            (o = i.buttons), (n = +n[n.length - 1]);
          }
          return (
            this._expandButton(
              o,
              t,
              void 0 !== t ? t.split : void 0,
              (void 0 === t || void 0 === t.split || 0 === t.split.length) &&
                void 0 !== i,
              !1,
              n
            ),
            (void 0 !== e && !0 !== e) || this._draw(),
            this
          );
        },
        collectionRebuild: function (t, n) {
          if (((t = this._nodeToButton(t)), void 0 !== n)) {
            for (var e = t.buttons.length - 1; 0 <= e; e--)
              this.remove(t.buttons[e].node);
            for (
              t.conf.prefixButtons && n.unshift.apply(n, t.conf.prefixButtons),
                t.conf.postfixButtons && n.push.apply(n, t.conf.postfixButtons),
                e = 0;
              e < n.length;
              e++
            ) {
              var o = n[e];
              this._expandButton(
                t.buttons,
                o,
                void 0 !== o &&
                  void 0 !== o.config &&
                  void 0 !== o.config.split,
                !0,
                void 0 !== o.parentConf && void 0 !== o.parentConf.split,
                null,
                o.parentConf
              );
            }
          }
          this._draw(t.collection, t.buttons);
        },
        container: function () {
          return this.dom.container;
        },
        disable: function (t) {
          return (
            (t = this._nodeToButton(t)),
            y(t.node).addClass(this.c.dom.button.disabled).prop("disabled", !0),
            this
          );
        },
        destroy: function () {
          y("body").off("keyup." + this.s.namespace);
          for (var t = this.s.buttons.slice(), n = 0, e = t.length; n < e; n++)
            this.remove(t[n].node);
          for (
            this.dom.container.remove(),
              n = 0,
              e = (t = this.s.dt.settings()[0]).length;
            n < e;
            n++
          )
            if (t.inst === this) {
              t.splice(n, 1);
              break;
            }
          return this;
        },
        enable: function (t, n) {
          return !1 === n
            ? this.disable(t)
            : ((t = this._nodeToButton(t)),
              y(t.node)
                .removeClass(this.c.dom.button.disabled)
                .prop("disabled", !1),
              this);
        },
        index: function (t, n, e) {
          n || ((n = ""), (e = this.s.buttons));
          for (var o = 0, i = e.length; o < i; o++) {
            var s = e[o].buttons;
            if (e[o].node === t) return n + o;
            if (s && s.length && null !== (s = this.index(t, o + "-", s)))
              return s;
          }
          return null;
        },
        name: function () {
          return this.c.name;
        },
        node: function (t) {
          return t
            ? ((t = this._nodeToButton(t)), y(t.node))
            : this.dom.container;
        },
        processing: function (t, n) {
          var e = this.s.dt,
            o = this._nodeToButton(t);
          return void 0 === n
            ? y(o.node).hasClass("processing")
            : (y(o.node).toggleClass("processing", n),
              y(e.table().node()).triggerHandler("buttons-processing.dt", [
                n,
                e.button(t),
                e,
                y(t),
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
          return (
            (n.conf.destroying = !0),
            n.conf.destroy && n.conf.destroy.call(o.button(t), o, y(t), n.conf),
            this._removeKey(n.conf),
            y(n.node).remove(),
            (t = y.inArray(n, e)),
            e.splice(t, 1),
            this
          );
        },
        text: function (t, n) {
          function e(t) {
            return "function" == typeof t ? t(i, s, o.conf) : t;
          }
          var o = this._nodeToButton(t),
            i = ((t = o.textNode), this.s.dt),
            s = y(o.node);
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
            y("body").on("keyup." + this.s.namespace, function (t) {
              var n;
              (m.activeElement && m.activeElement !== m.body) ||
                ((n = String.fromCharCode(t.keyCode).toLowerCase()),
                -1 !== e.s.listenKeys.toLowerCase().indexOf(n) &&
                  e._keypress(n, t));
            });
        },
        _addKey: function (t) {
          t.key &&
            (this.s.listenKeys += (y.isPlainObject(t.key) ? t.key : t).key);
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
        _expandButton: function (t, n, e, o, i, s, r) {
          var a = this.s.dt,
            l = this.c.dom.collection,
            c = Array.isArray(n) ? n : [n];
          void 0 === n && (c = Array.isArray(e) ? e : [e]), (e = 0);
          for (var u = c.length; e < u; e++) {
            var d = this._resolveExtends(c[e]);
            if (d)
              if (((n = !(!d.config || !d.config.split)), Array.isArray(d)))
                this._expandButton(
                  t,
                  d,
                  void 0 !== f && void 0 !== f.conf ? f.conf.split : void 0,
                  o,
                  void 0 !== r && void 0 !== r.split,
                  s,
                  r
                );
              else {
                var f = this._buildButton(
                  d,
                  o,
                  void 0 !== d.split ||
                    (void 0 !== d.config && void 0 !== d.config.split),
                  i
                );
                if (f) {
                  if (
                    (null != s ? (t.splice(s, 0, f), s++) : t.push(f),
                    f.conf.buttons &&
                      ((f.collection = y("<" + l.container.content.tag + "/>")),
                      (f.conf._collection = f.collection),
                      y(f.node).append(l.action.dropHtml),
                      this._expandButton(
                        f.buttons,
                        f.conf.buttons,
                        f.conf.split,
                        !n,
                        n,
                        s,
                        f.conf
                      )),
                    f.conf.split)
                  ) {
                    (f.collection = y("<" + l.container.tag + "/>")),
                      (f.conf._collection = f.collection);
                    for (var p = 0; p < f.conf.split.length; p++) {
                      var h = f.conf.split[p];
                      "object" == typeof h &&
                        ((h.parent = r),
                        void 0 === h.collectionLayout &&
                          (h.collectionLayout = f.conf.collectionLayout),
                        void 0 === h.dropup && (h.dropup = f.conf.dropup),
                        void 0 === h.fade) &&
                        (h.fade = f.conf.fade);
                    }
                    this._expandButton(
                      f.buttons,
                      f.conf.buttons,
                      f.conf.split,
                      !n,
                      n,
                      s,
                      f.conf
                    );
                  }
                  (f.conf.parent = r),
                    d.init && d.init.call(a.button(f.node), a, y(f.node), d);
                }
              }
          }
        },
        _buildButton: function (n, t, e, o) {
          var i,
            s,
            r,
            a,
            l,
            c,
            u,
            d,
            f,
            p,
            h = this,
            b = this.c.dom,
            g = this.s.dt,
            m = function (t) {
              return "function" == typeof t ? t(g, l, n) : t;
            },
            v = y.extend(!0, {}, b.button);
          return (
            t && e && b.collection.split
              ? y.extend(!0, v, b.collection.split.action)
              : o || t
              ? y.extend(!0, v, b.collection.button)
              : e && y.extend(!0, v, b.split.button),
            n.spacer
              ? ((o = y("<" + v.spacer.tag + "/>")
                  .addClass(
                    "dt-button-spacer " + n.style + " " + v.spacer.className
                  )
                  .html(m(n.text))),
                {
                  conf: n,
                  node: o,
                  inserter: o,
                  buttons: [],
                  inCollection: t,
                  isSplit: e,
                  collection: null,
                  textNode: o,
                })
              : !(n.available && !n.available(g, n) && !n.html) &&
                (n.html
                  ? (l = y(n.html))
                  : ((i = function (t, n, e, o, i) {
                      o.action.call(n.button(e), t, n, e, o, i),
                        y(n.table().node()).triggerHandler(
                          "buttons-action.dt",
                          [n.button(e), n, e, o]
                        );
                    }),
                    (s = function (t, n, e, o) {
                      o.async
                        ? (h.processing(e[0], !0),
                          setTimeout(function () {
                            i(t, n, e, o, function () {
                              h.processing(e[0], !1);
                            });
                          }, o.async))
                        : i(t, n, e, o, function () {});
                    }),
                    (r = n.tag || v.tag),
                    (a = void 0 === n.clickBlurs || n.clickBlurs),
                    (l = y("<" + r + "/>")
                      .addClass(v.className)
                      .attr("tabindex", this.s.dt.settings()[0].iTabIndex)
                      .attr("aria-controls", this.s.dt.table().node().id)
                      .on("click.dtb", function (t) {
                        t.preventDefault(),
                          !l.hasClass(v.disabled) && n.action && s(t, g, l, n),
                          a && l.trigger("blur");
                      })
                      .on("keypress.dtb", function (t) {
                        13 === t.keyCode &&
                          (t.preventDefault(), !l.hasClass(v.disabled)) &&
                          n.action &&
                          s(t, g, l, n);
                      })),
                    "a" === r.toLowerCase() && l.attr("href", "#"),
                    "button" === r.toLowerCase() && l.attr("type", "button"),
                    v.liner.tag
                      ? ((r = y("<" + v.liner.tag + "/>")
                          .html(m(n.text))
                          .addClass(v.liner.className)),
                        "a" === v.liner.tag.toLowerCase() &&
                          r.attr("href", "#"),
                        l.append(r))
                      : (l.html(m(n.text)), (r = l)),
                    !1 === n.enabled && l.addClass(v.disabled),
                    n.className && l.addClass(n.className),
                    n.titleAttr && l.attr("title", m(n.titleAttr)),
                    n.attr && l.attr(n.attr),
                    n.namespace || (n.namespace = ".dt-button-" + w++),
                    void 0 !== n.config &&
                      n.config.split &&
                      (n.split = n.config.split)),
                (m =
                  (m = this.c.dom.buttonContainer) && m.tag
                    ? y("<" + m.tag + "/>")
                        .addClass(m.className)
                        .append(l)
                    : l),
                this._addKey(n),
                this.c.buttonCreated && (m = this.c.buttonCreated(n, m)),
                e &&
                  ((c = (b = t
                    ? y.extend(
                        !0,
                        this.c.dom.split,
                        this.c.dom.collection.split
                      )
                    : this.c.dom.split).wrapper),
                  (u = y("<" + c.tag + "/>")
                    .addClass(c.className)
                    .append(l)),
                  (d = y.extend(n, {
                    align: b.dropdown.align,
                    attr: { "aria-haspopup": "dialog", "aria-expanded": !1 },
                    className: b.dropdown.className,
                    closeButton: !1,
                    splitAlignClass: b.dropdown.splitAlignClass,
                    text: b.dropdown.text,
                  })),
                  this._addKey(d),
                  (f = function (t, n, e, o) {
                    _.split.action.call(n.button(u), t, n, e, o),
                      y(n.table().node()).triggerHandler("buttons-action.dt", [
                        n.button(e),
                        n,
                        e,
                        o,
                      ]),
                      e.attr("aria-expanded", !0);
                  }),
                  (p = y(
                    '<button class="' +
                      b.dropdown.className +
                      ' dt-button"></button>'
                  )
                    .html(b.dropdown.dropHtml)
                    .on("click.dtb", function (t) {
                      t.preventDefault(),
                        t.stopPropagation(),
                        p.hasClass(v.disabled) || f(t, g, p, d),
                        a && p.trigger("blur");
                    })
                    .on("keypress.dtb", function (t) {
                      13 === t.keyCode &&
                        (t.preventDefault(),
                        p.hasClass(v.disabled) || f(t, g, p, d));
                    })),
                  0 === n.split.length && p.addClass("dtb-hide-drop"),
                  u.append(p).attr(d.attr)),
                {
                  conf: n,
                  node: (e ? u : l).get(0),
                  inserter: e ? u : m,
                  buttons: [],
                  inCollection: t,
                  isSplit: e,
                  inSplit: o,
                  collection: null,
                  textNode: r,
                })
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
        _keypress: function (s, r) {
          var a;
          r._buttonsHandled ||
            (a = function (t) {
              for (var n = 0, e = t.length; n < e; n++) {
                var o = t[n].conf,
                  i = t[n].node;
                !o.key ||
                  (o.key !== s &&
                    (!y.isPlainObject(o.key) ||
                      o.key.key !== s ||
                      (o.key.shiftKey && !r.shiftKey) ||
                      (o.key.altKey && !r.altKey) ||
                      (o.key.ctrlKey && !r.ctrlKey) ||
                      (o.key.metaKey && !r.metaKey))) ||
                  ((r._buttonsHandled = !0), y(i).click()),
                  t[n].buttons.length && a(t[n].buttons);
              }
            })(this.s.buttons);
        },
        _removeKey: function (t) {
          var n;
          t.key &&
            ((n = (y.isPlainObject(t.key) ? t.key : t).key),
            (t = this.s.listenKeys.split("")),
            (n = y.inArray(n, t)),
            t.splice(n, 1),
            (this.s.listenKeys = t.join("")));
        },
        _resolveExtends: function (e) {
          var o = this,
            i = this.s.dt,
            t = function (t) {
              for (var n = 0; !y.isPlainObject(t) && !Array.isArray(t); ) {
                if (void 0 === t) return;
                if ("function" == typeof t) {
                  if (!(t = t.call(o, i, e))) return !1;
                } else if ("string" == typeof t) {
                  if (!_[t]) return { html: t };
                  t = _[t];
                }
                if (30 < ++n) throw "Buttons: Too many iterations";
              }
              return Array.isArray(t) ? t : y.extend({}, t);
            };
          for (e = t(e); e && e.extend; ) {
            if (!_[e.extend])
              throw "Cannot extend unknown button type: " + e.extend;
            var n = t(_[e.extend]);
            if (Array.isArray(n)) return n;
            if (!n) return !1;
            var s = n.className;
            void 0 !== e.config &&
              void 0 !== n.config &&
              (e.config = y.extend({}, n.config, e.config)),
              (e = y.extend({}, n, e)),
              s && e.className !== s && (e.className = s + " " + e.className),
              (e.extend = n.extend);
          }
          if ((s = e.postfixButtons))
            for (e.buttons || (e.buttons = []), t = 0, n = s.length; t < n; t++)
              e.buttons.push(s[t]);
          if ((s = e.prefixButtons))
            for (e.buttons || (e.buttons = []), t = 0, n = s.length; t < n; t++)
              e.buttons.splice(t, 0, s[t]);
          return e;
        },
        _popover: function (o, t, n) {
          function i() {
            (f = !0),
              x(y(h), p.fade, function () {
                y(this).detach();
              }),
              y(
                t
                  .buttons('[aria-haspopup="dialog"][aria-expanded="true"]')
                  .nodes()
              ).attr("aria-expanded", "false"),
              y("div.dt-button-background").off("click.dtb-collection"),
              C.background(!1, p.backgroundClassName, p.fade, b),
              y(g).off("resize.resize.dtb-collection"),
              y("body").off(".dtb-collection"),
              t.off("buttons-action.b-internal"),
              t.off("destroy");
          }
          var e,
            s,
            r,
            a,
            l,
            c,
            u,
            d = this.c,
            f = !1,
            p = y.extend(
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
            : ((n = y(
                t
                  .buttons('[aria-haspopup="dialog"][aria-expanded="true"]')
                  .nodes()
              )).length && (b.closest(h).length && (b = n.eq(0)), i()),
              (d = ""),
              3 === (n = y(".dt-button", o).length)
                ? (d = "dtb-b3")
                : 2 === n
                ? (d = "dtb-b2")
                : 1 === n && (d = "dtb-b1"),
              (e = y("<" + p.tag + "/>")
                .addClass(p.containerClassName)
                .addClass(p.collectionLayout)
                .addClass(p.splitAlignClass)
                .addClass(d)
                .css("display", "none")
                .attr({ "aria-modal": !0, role: "dialog" })),
              (o = y(o)
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
              (n = y(t.table().container())),
              (d = e.css("position")),
              ("container" !== p.span && "dt-container" !== p.align) ||
                ((b = b.parent()), e.css("width", n.width())),
              "absolute" === d
                ? ((s = y(b[0].offsetParent)),
                  (n = b.position()),
                  (d = b.offset()),
                  (r = s.offset()),
                  (a = s.position()),
                  (l = g.getComputedStyle(s[0])),
                  (r.height = s.outerHeight()),
                  (r.width = s.width() + parseFloat(l.paddingLeft)),
                  (r.right = r.left + r.width),
                  (r.bottom = r.top + r.height),
                  (s = n.top + b.outerHeight()),
                  (r = n.left),
                  e.css({ top: s, left: r }),
                  (l = g.getComputedStyle(e[0])),
                  ((c = e.offset()).height = e.outerHeight()),
                  (c.width = e.outerWidth()),
                  (c.right = c.left + c.width),
                  (c.bottom = c.top + c.height),
                  (c.marginTop = parseFloat(l.marginTop)),
                  (c.marginBottom = parseFloat(l.marginBottom)),
                  p.dropup &&
                    (s = n.top - c.height - c.marginTop - c.marginBottom),
                  ("button-right" !== p.align &&
                    !e.hasClass(p.rightAlignClassName)) ||
                    (r = n.left - c.width + b.outerWidth()),
                  ("dt-container" === p.align || "container" === p.align) &&
                    r < n.left &&
                    (r = -n.left),
                  a.left + r + c.width > y(g).width() &&
                    (r = y(g).width() - c.width - a.left),
                  d.left + r < 0 && (r = -d.left),
                  a.top + s + c.height > y(g).height() + y(g).scrollTop() &&
                    (s = n.top - c.height - c.marginTop - c.marginBottom),
                  a.top + s < y(g).scrollTop() && (s = n.top + b.outerHeight()),
                  e.css({ top: s, left: r }))
                : ((u = function () {
                    var t = y(g).height() / 2,
                      n = e.height() / 2;
                    e.css("marginTop", -1 * (n = t < n ? t : n));
                  })(),
                  y(g).on("resize.dtb-collection", function () {
                    u();
                  })),
              p.background &&
                C.background(
                  !0,
                  p.backgroundClassName,
                  p.fade,
                  p.backgroundHost || b
                ),
              y("div.dt-button-background").on(
                "click.dtb-collection",
                function () {}
              ),
              p.autoClose &&
                setTimeout(function () {
                  t.on("buttons-action.b-internal", function (t, n, e, o) {
                    o[0] !== b[0] && i();
                  });
                }, 0),
              y(e).trigger("buttons-popover.dt"),
              t.on("destroy", i),
              setTimeout(function () {
                (f = !1),
                  y("body")
                    .on("click.dtb-collection", function (t) {
                      var n, e;
                      !f &&
                        ((n = y.fn.addBack ? "addBack" : "andSelf"),
                        (e = y(t.target).parent()[0]),
                        (!y(t.target).parents()[n]().filter(o).length &&
                          !y(e).hasClass("dt-buttons")) ||
                          y(t.target).hasClass("dt-button-background")) &&
                        i();
                    })
                    .on("keyup.dtb-collection", function (t) {
                      27 === t.keyCode && i();
                    })
                    .on("keydown.dtb-collection", function (t) {
                      var n = y("a, button", o),
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
      (C.background = function (t, n, e, o) {
        void 0 === e && (e = 400),
          (o = o || m.body),
          t
            ? v(
                y("<div/>").addClass(n).css("display", "none").insertAfter(o),
                e
              )
            : x(y("div." + n), e, function () {
                y(this).removeClass(n).remove();
              });
      }),
      (C.instanceSelector = function (t, o) {
        var i, s, r;
        return null == t
          ? y.map(o, function (t) {
              return t.inst;
            })
          : ((i = []),
            (s = y.map(o, function (t) {
              return t.name;
            })),
            (r = function (t) {
              if (Array.isArray(t))
                for (var n = 0, e = t.length; n < e; n++) r(t[n]);
              else if ("string" == typeof t)
                -1 !== t.indexOf(",")
                  ? r(t.split(","))
                  : -1 !== (t = y.inArray(t.trim(), s)) && i.push(o[t].inst);
              else if ("number" == typeof t) i.push(o[t].inst);
              else if ("object" == typeof t && t.nodeName)
                for (n = 0; n < o.length; n++)
                  o[n].inst.dom.container[0] === t && i.push(o[n].inst);
              else "object" == typeof t && i.push(t);
            })(t),
            i);
      }),
      (C.buttonSelector = function (t, n) {
        for (
          var s = [],
            a = function (t, n, e) {
              for (var o, i, s = 0, r = n.length; s < r; s++)
                (o = n[s]) &&
                  (t.push({
                    node: o.node,
                    name: o.conf.name,
                    idx: (i = void 0 !== e ? e + s : s + ""),
                  }),
                  o.buttons) &&
                  a(t, o.buttons, i + "-");
            },
            r = function (t, n) {
              var e,
                o = [],
                i =
                  (a(o, n.s.buttons),
                  y.map(o, function (t) {
                    return t.node;
                  }));
              if (Array.isArray(t) || t instanceof y)
                for (i = 0, e = t.length; i < e; i++) r(t[i], n);
              else if (null == t || "*" === t)
                for (i = 0, e = o.length; i < e; i++)
                  s.push({ inst: n, node: o[i].node });
              else if ("number" == typeof t)
                n.s.buttons[t] &&
                  s.push({ inst: n, node: n.s.buttons[t].node });
              else if ("string" == typeof t)
                if (-1 !== t.indexOf(","))
                  for (i = 0, e = (o = t.split(",")).length; i < e; i++)
                    r(o[i].trim(), n);
                else if (t.match(/^\d+(\-\d+)*$/))
                  (i = y.map(o, function (t) {
                    return t.idx;
                  })),
                    s.push({ inst: n, node: o[y.inArray(t, i)].node });
                else if (-1 !== t.indexOf(":name"))
                  for (
                    t = t.replace(":name", ""), i = 0, e = o.length;
                    i < e;
                    i++
                  )
                    o[i].name === t && s.push({ inst: n, node: o[i].node });
                else
                  y(i)
                    .filter(t)
                    .each(function () {
                      s.push({ inst: n, node: this });
                    });
              else
                "object" == typeof t &&
                  t.nodeName &&
                  -1 !== (o = y.inArray(t, i)) &&
                  s.push({ inst: n, node: i[o] });
            },
            e = 0,
            o = t.length;
          e < o;
          e++
        )
          r(n, t[e]);
        return s;
      }),
      (C.stripData = function (t, n) {
        return (t =
          "string" == typeof t &&
          ((t = C.stripHtmlScript(t)),
          (t = C.stripHtmlComments(t)),
          (n && !n.stripHtml) || (t = e.util.stripHtml(t)),
          (n && !n.trim) || (t = t.trim()),
          (n && !n.stripNewlines) || (t = t.replace(/\n/g, " ")),
          !n || n.decodeEntities)
            ? s
              ? s(t)
              : ((l.innerHTML = t), l.value)
            : t);
      }),
      (C.entityDecoder = function (t) {
        s = t;
      }),
      (C.stripHtmlComments = function (t) {
        do {
          var n = t;
        } while (
          (t = t.replace(
            /(\x3c!--.*?--!?>)|(\x3c!--[\S\s]+?--!?>)|(\x3c!--[\S\s]*?$)/g,
            ""
          )) !== n
        );
        return t;
      }),
      (C.stripHtmlScript = function (t) {
        do {
          var n = t;
        } while (
          (t = t.replace(
            /<script\b[^<]*(?:(?!<\/script[^>]*>)<[^<]*)*<\/script[^>]*>/gi,
            ""
          )) !== n
        );
        return t;
      }),
      (C.defaults = {
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
      y.extend(_, {
        collection: {
          text: function (t) {
            return t.i18n("buttons.collection", "Collection");
          },
          className: "buttons-collection",
          closeButton: !(C.version = "3.1.2"),
          init: function (t, n) {
            n.attr("aria-expanded", !1);
          },
          action: function (t, n, e, o) {
            o._collection.parents("body").length
              ? this.popover(!1, o)
              : this.popover(o._collection, o),
              "keypress" === t.type &&
                y("a, button", o._collection).eq(0).focus();
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
          if (_.copyHtml5) return "copyHtml5";
        },
        csv: function (t, n) {
          if (_.csvHtml5 && _.csvHtml5.available(t, n)) return "csvHtml5";
        },
        excel: function (t, n) {
          if (_.excelHtml5 && _.excelHtml5.available(t, n)) return "excelHtml5";
        },
        pdf: function (t, n) {
          if (_.pdfHtml5 && _.pdfHtml5.available(t, n)) return "pdfHtml5";
        },
        pageLength: function (t) {
          t = t.settings()[0].aLengthMenu;
          var n = [],
            e = [];
          if (Array.isArray(t[0])) (n = t[0]), (e = t[1]);
          else
            for (var o = 0; o < t.length; o++) {
              var i = t[o];
              y.isPlainObject(i)
                ? (n.push(i.value), e.push(i.label))
                : (n.push(i), e.push(i));
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
            buttons: y.map(n, function (i, t) {
              return {
                text: e[t],
                className: "button-page-length",
                action: function (t, n) {
                  n.page.len(i).draw();
                },
                init: function (t, n, e) {
                  var o = this;
                  t.on(
                    "length.dt" + e.namespace,
                    (n = function () {
                      o.active(t.page.len() === i);
                    })
                  ),
                    n();
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
        void 0 === e && ((e = n), (n = void 0)),
          (this.selector.buttonGroup = n);
        var t = this.iterator(
          !0,
          "table",
          function (t) {
            if (t._buttons)
              return C.buttonSelector(C.instanceSelector(n, t._buttons), e);
          },
          !0
        );
        return (t._groupSelector = n), t;
      }),
      e.Api.register("button()", function (t, n) {
        return 1 < (t = this.buttons(t, n)).length && t.splice(1, t.length), t;
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
      e.Api.register(
        ["buttons().disable()", "button().disable()"],
        function () {
          return this.each(function (t) {
            t.inst.disable(t.node);
          });
        }
      ),
      e.Api.register("button().index()", function () {
        var n = null;
        return (
          this.each(function (t) {
            null !== (t = t.inst.index(t.node)) && (n = t);
          }),
          n
        );
      }),
      e.Api.registerPlural("buttons().nodes()", "button().node()", function () {
        var n = y();
        return (
          y(
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
        var o = y(),
          i = this._groupSelector;
        return (
          this.iterator(!0, "table", function (t) {
            if (t._buttons)
              for (
                var n = 0, e = (t = C.instanceSelector(i, t._buttons)).length;
                n < e;
                n++
              )
                o = o.add(t[n].container());
          }),
          o
        );
      }),
      e.Api.register("buttons().container()", function () {
        return this.containers().eq(0);
      }),
      e.Api.register("button().add()", function (t, n, e) {
        var o = this.context;
        return (
          o.length &&
            (o = C.instanceSelector(this._groupSelector, o[0]._buttons))
              .length &&
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
              x(y("#datatables_buttons_info"), 400, function () {
                y(this).remove();
              }),
              clearTimeout(i),
              (i = null))
            : (i && clearTimeout(i),
              y("#datatables_buttons_info").length &&
                y("#datatables_buttons_info").remove(),
              (t = t ? "<h2>" + t + "</h2>" : ""),
              v(
                y('<div id="datatables_buttons_info" class="dt-button-info"/>')
                  .html(t)
                  .append(
                    y("<div/>")["string" == typeof n ? "html" : "append"](n)
                  )
                  .css("display", "none")
                  .appendTo("body")
              ),
              void 0 !== e &&
                0 !== e &&
                (i = setTimeout(function () {
                  o.buttons.info(!1);
                }, e)),
              this.on("destroy.btn-info", function () {
                o.buttons.info(!1);
              })),
          this
        );
      }),
      e.Api.register("buttons.exportData()", function (t) {
        if (this.context.length) return n(new e.Api(this.context[0]), t);
      }),
      e.Api.register("buttons.exportInfo()", function (t) {
        var n = (t ||= {}),
          e =
            "*" === n.filename &&
            "*" !== n.title &&
            null != n.title &&
            "" !== n.title
              ? n.title
              : n.filename;
        return (
          null == (e = "function" == typeof e ? e(n, this) : e)
            ? (e = null)
            : ((e = (e =
                -1 !== e.indexOf("*")
                  ? e.replace(/\*/g, y("head > title").text()).trim()
                  : e).replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, "")),
              (e += n = (n = r(n.extension, n, this)) || "")),
          {
            filename: e,
            title: (n =
              null === (n = r(t.title, t, this))
                ? null
                : -1 !== n.indexOf("*")
                ? n.replace(/\*/g, y("head > title").text() || "Exported data")
                : n),
            messageTop: a(this, t, t.message || t.messageTop, "top"),
            messageBottom: a(this, t, t.messageBottom, "bottom"),
          }
        );
      }),
      function (t, n, e) {
        return null == t ? null : "function" == typeof t ? t(n, e) : t;
      }),
    a = function (t, n, e, o) {
      return null === (n = r(e, n, t))
        ? null
        : ((t = y("caption", t.table().container()).eq(0)),
          "*" === n
            ? t.css("caption-side") !== o
              ? null
              : t.length
              ? t.text()
              : ""
            : n);
    },
    l = y("<textarea/>")[0],
    n = function (o, t) {
      for (
        var i = y.extend(
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
                  return C.stripData(t, i);
                },
                footer: function (t) {
                  return C.stripData(t, i);
                },
                body: function (t) {
                  return C.stripData(t, i);
                },
              },
              customizeData: null,
              customizeZip: null,
            },
            t
          ),
          n =
            ((t = o
              .columns(i.columns)
              .indexes()
              .map(function (t) {
                var n = o.column(t);
                return i.format.header(n.title(), t, n.header());
              })
              .toArray()),
            o.table().footer()
              ? o
                  .columns(i.columns)
                  .indexes()
                  .map(function (t) {
                    var n = o.column(t).footer(),
                      e = "";
                    return (
                      n &&
                        (e = (
                          (e = y(".dt-column-title", n)).length ? e : y(n)
                        ).html()),
                      i.format.footer(e, t, n)
                    );
                  })
                  .toArray()
              : null),
          e = y.extend({}, i.modifier),
          s =
            (o.select &&
              "function" == typeof o.select.info &&
              void 0 === e.selected &&
              o.rows(i.rows, y.extend({ selected: !0 }, e)).any() &&
              y.extend(e, { selected: !0 }),
            o.rows(i.rows, e).indexes().toArray()),
          e = (r = o.cells(s, i.columns, { order: e.order }))
            .render(i.orthogonal)
            .toArray(),
          s = r.nodes().toArray(),
          r = r.indexes().toArray(),
          a = o.columns(i.columns).count(),
          l = [],
          c = 0,
          u = 0,
          d = 0 < a ? e.length / a : 0;
        u < d;
        u++
      ) {
        for (var f = [a], p = 0; p < a; p++)
          (f[p] = i.format.body(e[c], r[c].row, r[c].column, s[c])), c++;
        l[u] = f;
      }
      return (
        (t = {
          header: t,
          headerStructure: h(
            i.format.header,
            o.table().header.structure(i.columns)
          ),
          footer: n,
          footerStructure: h(
            i.format.footer,
            o.table().footer.structure(i.columns)
          ),
          body: l,
        }),
        i.customizeData && i.customizeData(t),
        t
      );
    };
  return (
    (y.fn.dataTable.Buttons = C),
    (y.fn.DataTable.Buttons = C),
    y(m).on("init.dt plugin-init.dt", function (t, n) {
      "dt" === t.namespace &&
        (t = n.oInit.buttons || e.defaults.buttons) &&
        !n._buttons &&
        new C(n, t).container();
    }),
    e.ext.feature.push({ fnInit: t, cFeature: "B" }),
    e.feature && e.feature.register("buttons", t),
    e
  );
});

// dataTables.colVis.js
((i) => {
  var o, e;
  "function" == typeof define && define.amd
    ? define(
        ["jquery", "datatables.net", "datatables.net-buttons"],
        function (n) {
          return i(n, window, document);
        }
      )
    : "object" == typeof exports
    ? ((o = require("jquery")),
      (e = function (n, t) {
        t.fn.dataTable || require("datatables.net")(n, t),
          t.fn.dataTable.Buttons || require("datatables.net-buttons")(n, t);
      }),
      "undefined" == typeof window
        ? (module.exports = function (n, t) {
            return (n ||= window), (t ||= o(n)), e(n, t), i(t, 0, n.document);
          })
        : (e(window, o), (module.exports = i(o, window, window.document))))
    : i(jQuery, window, document);
})(function (n, t, i) {
  var e = n.fn.dataTable;
  return (
    n.extend(e.ext.buttons, {
      colvis: function (n, t) {
        var i = null,
          o = {
            extend: "collection",
            init: function (n, t) {
              i = t;
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
            n.button(null, n.button(null, i).node()).collectionRebuild([
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
        text: function (n, t, i) {
          return i._columnText(n, i);
        },
        className: "buttons-columnVisibility",
        action: function (n, t, i, o) {
          (t = (n = t.columns(o.columns)).visible()),
            n.visible(
              void 0 !== o.visibility ? o.visibility : !(t.length && t[0])
            );
        },
        init: function (i, n, o) {
          var e = this;
          n.attr("data-cv-idx", o.columns),
            i
              .on("column-visibility.dt" + o.namespace, function (n, t) {
                t.bDestroying ||
                  t.nTable != i.settings()[0].nTable ||
                  e.active(i.column(o.columns).visible());
              })
              .on("column-reorder.dt" + o.namespace, function () {
                o.destroying ||
                  1 !== i.columns(o.columns).count() ||
                  (e.text(o._columnText(i, o)),
                  e.active(i.column(o.columns).visible()));
              }),
            this.active(i.column(o.columns).visible());
        },
        destroy: function (n, t, i) {
          n.off("column-visibility.dt" + i.namespace).off(
            "column-reorder.dt" + i.namespace
          );
        },
        _columnText: function (n, t) {
          var i, o;
          return "string" == typeof t.text
            ? t.text
            : ((o = n.column(t.columns).title()),
              (i = n.column(t.columns).index()),
              (o = o
                .replace(/\n/g, " ")
                .replace(/<br\s*\/?>/gi, " ")
                .replace(/<select(.*?)<\/select\s*>/gi, "")),
              (o = e.Buttons.stripHtmlComments(o)),
              (o = e.util.stripHtml(o).trim()),
              t.columnText ? t.columnText(n, i, o) : o);
        },
      },
      colvisRestore: {
        className: "buttons-colvisRestore",
        text: function (n) {
          return n.i18n("buttons.colvisRestore", "Restore visibility");
        },
        init: function (n, t, i) {
          n.columns().every(function () {
            var n = this.init();
            void 0 === n.__visOriginal && (n.__visOriginal = this.visible());
          });
        },
        action: function (n, t, i, o) {
          t.columns().every(function (n) {
            (n = this.init()), this.visible(n.__visOriginal);
          });
        },
      },
      colvisGroup: {
        className: "buttons-colvisGroup",
        action: function (n, t, i, o) {
          t.columns(o.show).visible(!0, !1),
            t.columns(o.hide).visible(!1, !1),
            t.columns.adjust();
        },
        show: [],
        hide: [],
      },
    }),
    e
  );
});

// buttons.html5.js
((o) => {
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
            return (t ||= window), (e ||= l(t)), n(t, e), o(e, t, t.document);
          })
        : (n(window, l), (module.exports = o(l, window, window.document))))
    : o(jQuery, window, document);
})(function (x, h, m) {
  function b(t) {
    for (var e = ""; 0 <= t; )
      (e = String.fromCharCode((t % 26) + 65) + e),
        (t = Math.floor(t / 26) - 1);
    return e;
  }
  function g(t, e, o) {
    var l = t.createElement(e);
    return (
      o &&
        (o.attr && x(l).attr(o.attr),
        o.children &&
          x.each(o.children, function (t, e) {
            l.appendChild(e);
          }),
        null != o.text) &&
        l.appendChild(t.createTextNode(o.text)),
      l
    );
  }
  function v(t) {
    var e = "Sheet1";
    return (e = t.sheetName ? t.sheetName.replace(/[\[\]\*\/\\\?:]/g, "") : e);
  }
  function s(t, e) {
    function o(t) {
      for (var e = "", o = 0, l = t.length; o < l; o++)
        0 < o && (e += r),
          (e += n ? n + ("" + t[o]).replace(a, d + n) + n : t[o]);
      return e;
    }
    var l = u(e),
      n = ((t = t.buttons.exportData(e.exportOptions)), e.fieldBoundary),
      r = e.fieldSeparator,
      a = new RegExp(n, "g"),
      d = void 0 !== e.escapeChar ? e.escapeChar : "\\",
      p = "",
      i = "",
      f = [];
    e.header &&
      (p =
        t.headerStructure
          .map(function (t) {
            return o(
              t.map(function (t) {
                return t ? t.title : "";
              })
            );
          })
          .join(l) + l),
      e.footer &&
        t.footer &&
        (i =
          t.footerStructure
            .map(function (t) {
              return o(
                t.map(function (t) {
                  return t ? t.title : "";
                })
              );
            })
            .join(l) + l),
      (e = 0);
    for (var m = t.body.length; e < m; e++) f.push(o(t.body[e]));
    return { str: p + f.join(l) + l + i, rows: f.length };
  }
  function p() {
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
  var w,
    i,
    t = x.fn.dataTable,
    B =
      ((t.Buttons.pdfMake = function (t) {
        if (!t) return i || h.pdfMake;
        i = t;
      }),
      (t.Buttons.jszip = function (t) {
        if (!t) return w || h.JSZip;
        w = t;
      }),
      ((d) => {
        var p, i, f, m, s, u, l, t;
        if (
          !(
            void 0 === d ||
            ("undefined" != typeof navigator &&
              /MSIE [1-9]\./.test(navigator.userAgent))
          )
        )
          return (
            (p = d.document.createElementNS(
              "http://www.w3.org/1999/xhtml",
              "a"
            )),
            (i = "download" in p),
            (f = /constructor/i.test(d.HTMLElement) || d.safari),
            (m = /CriOS\/[\d]+/.test(navigator.userAgent)),
            (s = function (t) {
              setTimeout(function () {
                "string" == typeof t
                  ? (d.URL || d.webkitURL || d).revokeObjectURL(t)
                  : t.remove();
              }, 4e4);
            }),
            (u = function (t) {
              return /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(
                t.type
              )
                ? new Blob([String.fromCharCode(65279), t], { type: t.type })
                : t;
            }),
            (t = (l = function (t, e, o) {
              o || (t = u(t));
              function l() {
                for (
                  var t,
                    e = (t = [].concat([
                      "writestart",
                      "progress",
                      "write",
                      "writeend",
                    ])).length;
                  e--;

                ) {
                  var o = a["on" + t[e]];
                  if ("function" == typeof o)
                    try {
                      o.call(a, a);
                    } catch (t) {
                      ((t) => {
                        (d.setImmediate || d.setTimeout)(function () {
                          throw t;
                        }, 0);
                      })(t);
                    }
                }
              }
              var n,
                r,
                a = this,
                o = "application/octet-stream" === t.type;
              (a.readyState = a.INIT),
                i
                  ? ((n = (d.URL || d.webkitURL || d).createObjectURL(t)),
                    setTimeout(function () {
                      (p.href = n), (p.download = e);
                      var t = new MouseEvent("click");
                      p.dispatchEvent(t), l(), s(n), (a.readyState = a.DONE);
                    }))
                  : (m || (o && f)) && d.FileReader
                  ? (((r = new FileReader()).onloadend = function () {
                      var t = m
                        ? r.result
                        : r.result.replace(
                            /^data:[^;]*;/,
                            "data:attachment/file;"
                          );
                      d.open(t, "_blank") || (d.location.href = t),
                        (a.readyState = a.DONE),
                        l();
                    }),
                    r.readAsDataURL(t),
                    (a.readyState = a.INIT))
                  : ((n ||= (d.URL || d.webkitURL || d).createObjectURL(t)),
                    (!o && d.open(n, "_blank")) || (d.location.href = n),
                    (a.readyState = a.DONE),
                    l(),
                    s(n));
            }).prototype),
            "undefined" != typeof navigator && navigator.msSaveOrOpenBlob
              ? function (t, e, o) {
                  return (
                    (e = e || t.name || "download"),
                    o || (t = u(t)),
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
          (void 0 !== h && h) ||
          this.content
      )),
    u =
      ((t.fileSave = B),
      function (t) {
        return (
          t.newline || (navigator.userAgent.match(/Windows/) ? "\r\n" : "\n")
        );
      });
  try {
    var S,
      C = new XMLSerializer();
  } catch (t) {}
  function T(t, e, o, l, n) {
    var r = x("mergeCells", t);
    r[0].appendChild(
      g(t, "mergeCell", {
        attr: { ref: b(o) + e + ":" + b(o + n - 1) + (e + l - 1) },
      })
    ),
      r.attr("count", parseFloat(r.attr("count")) + 1);
  }
  var k = {
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
    N = [
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
        match: /^(19\d\d|[2-9]\d\d\d)\-(0\d|1[012])\-[0123][\d]$/,
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
        t = s(e, l);
        var r = e.buttons.exportInfo(l),
          a = u(l),
          d = t.str;
        if (
          ((o = x("<div/>").css({
            height: 1,
            width: 1,
            overflow: "hidden",
            position: "fixed",
            top: 0,
            left: 0,
          })),
          r.title && (d = r.title + a + a + d),
          r.messageTop && (d = r.messageTop + a + a + d),
          r.messageBottom && (d = d + a + a + r.messageBottom),
          l.customize && (d = l.customize(d, l, e)),
          (r = x("<textarea readonly/>").val(d).appendTo(o)),
          m.queryCommandSupported("copy"))
        ) {
          o.appendTo(e.table().container()), r[0].focus(), r[0].select();
          try {
            var p = m.execCommand("copy");
            if ((o.remove(), p))
              return (
                l.copySuccess &&
                  e.buttons.info(
                    e.i18n("buttons.copyTitle", "Copy to clipboard"),
                    e.i18n(
                      "buttons.copySuccess",
                      {
                        1: "Copied one row to clipboard",
                        _: "Copied %d rows to clipboard",
                      },
                      t.rows
                    ),
                    2e3
                  ),
                void n()
              );
          } catch (t) {}
        }
        (l = x(
          "<span>" +
            e.i18n(
              "buttons.copyKeys",
              "Press <i>ctrl</i> or <i>⌘</i> + <i>C</i> to copy the table data<br>to your system clipboard.<br><br>To cancel, click this message or press escape."
            ) +
            "</span>"
        ).append(o)),
          e.buttons.info(
            e.i18n("buttons.copyTitle", "Copy to clipboard"),
            l,
            0
          ),
          r[0].focus(),
          r[0].select();
        function i() {
          f.off("click.buttons-copy"),
            x(m).off(".buttons-copy"),
            e.buttons.info(!1);
        }
        var f = x(l).closest(".dt-button-info");
        f.on("click.buttons-copy", function () {
          i(), n();
        }),
          x(m)
            .on("keydown.buttons-copy", function (t) {
              27 === t.keyCode && (i(), n());
            })
            .on("copy.buttons-copy cut.buttons-copy", function () {
              i(), n();
            });
      },
      async: 100,
      copySuccess: !0,
      exportOptions: {},
      fieldSeparator: "\t",
      fieldBoundary: "",
      header: !0,
      footer: !0,
      title: "*",
      messageTop: "*",
      messageBottom: "*",
    }),
    (t.ext.buttons.csvHtml5 = {
      bom: !1,
      className: "buttons-csv buttons-html5",
      available: function () {
        return void 0 !== h.FileReader && h.Blob;
      },
      text: function (t) {
        return t.i18n("buttons.csv", "CSV");
      },
      action: function (t, e, o, l, n) {
        (t = s(e, l).str), (o = e.buttons.exportInfo(l));
        var r = l.charset;
        l.customize && (t = l.customize(t, l, e)),
          !1 !== r
            ? (r = (r ||= m.characterSet || m.charset) && ";charset=" + r)
            : (r = ""),
          l.bom && (t = String.fromCharCode(65279) + t),
          B(new Blob([t], { type: "text/csv" + r }), o.filename, !0),
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
      footer: !0,
    }),
    (t.ext.buttons.excelHtml5 = {
      className: "buttons-excel buttons-html5",
      available: function () {
        return (
          void 0 !== h.FileReader && void 0 !== (w || h.JSZip) && !p() && C
        );
      },
      text: function (t) {
        return t.i18n("buttons.excel", "Excel");
      },
      action: function (t, e, o, i, l) {
        var f = 0,
          m = (t = function (t) {
            return x.parseXML(k[t]);
          })("xl/worksheets/sheet1.xml"),
          s = m.getElementsByTagName("sheetData")[0];
        (t = {
          _rels: { ".rels": t("_rels/.rels") },
          xl: {
            _rels: { "workbook.xml.rels": t("xl/_rels/workbook.xml.rels") },
            "workbook.xml": t("xl/workbook.xml"),
            "styles.xml": t("xl/styles.xml"),
            worksheets: { "sheet1.xml": m },
          },
          "[Content_Types].xml": t("[Content_Types].xml"),
        }),
          (o = e.buttons.exportData(i.exportOptions));
        for (
          var u,
            c,
            n = function (t) {
              c = g(m, "row", { attr: { r: (u = f + 1) } });
              for (var e = 0, o = t.length; e < o; e++) {
                var l = b(e) + "" + u,
                  n = null;
                if (null == t[e] || "" === t[e]) {
                  if (!0 !== i.createEmptyCells) continue;
                  t[e] = "";
                }
                var r = t[e];
                t[e] = "function" == typeof t[e].trim ? t[e].trim() : t[e];
                for (var a = 0, d = N.length; a < d; a++) {
                  var p = N[a];
                  if (
                    t[e].match &&
                    !t[e].match(/^0\d+/) &&
                    t[e].match(p.match)
                  ) {
                    (n = t[e].replace(/[^\d\.\-]/g, "")),
                      p.fmt && (n = p.fmt(n)),
                      (n = g(m, "c", {
                        attr: { r: l, s: p.style },
                        children: [g(m, "v", { text: n })],
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
                    ? g(m, "c", {
                        attr: { t: "n", r: l },
                        children: [g(m, "v", { text: t[e] })],
                      })
                    : ((r = r.replace
                        ? r.replace(
                            /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g,
                            ""
                          )
                        : r),
                      g(m, "c", {
                        attr: { t: "inlineStr", r: l },
                        children: {
                          row: g(m, "is", {
                            children: {
                              row: g(m, "t", {
                                text: r,
                                attr: { "xml:space": "preserve" },
                              }),
                            },
                          }),
                        },
                      })))),
                  c.appendChild(n);
              }
              s.appendChild(c), f++;
            },
            r = function (t) {
              t.forEach(function (t) {
                n(
                  t.map(function (t) {
                    return t ? t.title : "";
                  })
                ),
                  x("row:last c", m).attr("s", "2"),
                  t.forEach(function (t, e) {
                    t &&
                      (1 < t.colSpan || 1 < t.rowSpan) &&
                      T(m, f, e, t.rowSpan, t.colSpan);
                  });
              });
            },
            a = e.buttons.exportInfo(i),
            d =
              (a.title &&
                (n([a.title]),
                T(m, f, 0, 1, o.header.length),
                x("row:last c", m).attr("s", "51")),
              a.messageTop &&
                (n([a.messageTop]), T(m, f, 0, 1, o.header.length)),
              i.header && r(o.headerStructure),
              f),
            p = 0,
            y = o.body.length;
          p < y;
          p++
        )
          n(o.body[p]);
        (p = f),
          i.footer && o.footer && r(o.footerStructure),
          a.messageBottom &&
            (n([a.messageBottom]), T(m, f, 0, 1, o.header.length)),
          (r = g(m, "cols")),
          x("worksheet", m).prepend(r);
        for (var y = 0, I = o.header.length; y < I; y++)
          r.appendChild(
            g(m, "col", {
              attr: {
                min: y + 1,
                max: y + 1,
                width: ((t, e) => {
                  var o = t.header[e].length;
                  t.footer &&
                    t.footer[e] &&
                    t.footer[e].length > o &&
                    (o = t.footer[e].length);
                  for (var l = 0, n = t.body.length; l < n; l++) {
                    var r = t.body[l][e];
                    if (
                      40 <
                      (o =
                        o <
                        (r = (
                          -1 !==
                          (r = null != r ? r.toString() : "").indexOf("\n")
                            ? ((r = r.split("\n")).sort(function (t, e) {
                                return e.length - t.length;
                              }),
                              r[0])
                            : r
                        ).length)
                          ? r
                          : o)
                    )
                      return 54;
                  }
                  return 6 < (o *= 1.35) ? o : 6;
                })(o, y),
                customWidth: 1,
              },
            })
          );
        (r = t.xl["workbook.xml"]),
          x("sheets sheet", r).attr("name", v(i)),
          i.autoFilter &&
            (x("mergeCells", m).before(
              g(m, "autoFilter", {
                attr: { ref: "A" + d + ":" + b(o.header.length - 1) + p },
              })
            ),
            x("definedNames", r).append(
              g(r, "definedName", {
                attr: {
                  name: "_xlnm._FilterDatabase",
                  localSheetId: "0",
                  hidden: 1,
                },
                text:
                  "'" +
                  v(i).replace(/'/g, "''") +
                  "'!$A$" +
                  d +
                  ":" +
                  b(o.header.length - 1) +
                  p,
              })
            )),
          i.customize && i.customize(t, i, e),
          0 === x("mergeCells", m).children().length &&
            x("mergeCells", m).remove(),
          (d = {
            compression: "DEFLATE",
            type: "blob",
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          (function d(p, t) {
            void 0 === S &&
              (S =
                -1 ===
                C.serializeToString(
                  new h.DOMParser().parseFromString(
                    k["xl/worksheets/sheet1.xml"],
                    "text/xml"
                  )
                ).indexOf("xmlns:r")),
              x.each(t, function (t, e) {
                if (x.isPlainObject(e)) d((t = p.folder(t)), e);
                else {
                  if (S) {
                    for (
                      var o = e.childNodes[0],
                        l = [],
                        n = o.attributes.length - 1;
                      0 <= n;
                      n--
                    ) {
                      var r = o.attributes[n].nodeName,
                        a = o.attributes[n].nodeValue;
                      -1 !== r.indexOf(":") &&
                        (l.push({ name: r, value: a }), o.removeAttribute(r));
                    }
                    for (n = 0, r = l.length; n < r; n++)
                      ((a = e.createAttribute(
                        l[n].name.replace(":", "_dt_b_namespace_token_")
                      )).value = l[n].value),
                        o.setAttributeNode(a);
                  }
                  (e = C.serializeToString(e)),
                    (e = (e = S
                      ? (e = (e =
                          -1 === e.indexOf("<?xml")
                            ? '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                              e
                            : e).replace(
                          /_dt_b_namespace_token_/g,
                          ":"
                        )).replace(/xmlns:NS[\d]+="" NS[\d]+:/g, "")
                      : e).replace(
                      /<([^<>]*?) xmlns=""([^<>]*?)>/g,
                      "<$1 $2>"
                    )),
                    p.file(t, e);
                }
              });
          })((e = new (w || h.JSZip)()), t);
        var F = a.filename;
        175 < F && (F = F.substr(0, 175)),
          i.customizeZip && i.customizeZip(e, o, F),
          e.generateAsync
            ? e.generateAsync(d).then(function (t) {
                B(t, F), l();
              })
            : (B(e.generate(d), F), l());
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
        return void 0 !== h.FileReader && (i || h.pdfMake);
      },
      text: function (t) {
        return t.i18n("buttons.pdf", "PDF");
      },
      action: function (t, e, o, l, n) {
        var r = e.buttons.exportData(l.exportOptions),
          a = ((t = e.buttons.exportInfo(l)), []);
        l.header &&
          r.headerStructure.forEach(function (t) {
            a.push(
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
          }),
          (o = 0);
        for (var d = r.body.length; o < d; o++)
          a.push(
            r.body[o].map(function (t) {
              return {
                text: null == t ? "" : "string" == typeof t ? t : t.toString(),
              };
            })
          );
        l.footer &&
          r.footerStructure.forEach(function (t) {
            a.push(
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
          }),
          (o = {
            pageSize: l.pageSize,
            pageOrientation: l.orientation,
            content: [
              {
                style: "table",
                table: {
                  headerRows: r.headerStructure.length,
                  footerRows: r.footerStructure.length,
                  body: a,
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
                      : 0 == t % 2
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
          }),
          t.messageTop &&
            o.content.unshift({
              text: t.messageTop,
              style: "message",
              margin: [0, 0, 0, 12],
            }),
          t.messageBottom &&
            o.content.push({
              text: t.messageBottom,
              style: "message",
              margin: [0, 0, 0, 12],
            }),
          t.title &&
            o.content.unshift({
              text: t.title,
              style: "title",
              margin: [0, 0, 0, 12],
            }),
          l.customize && l.customize(o, l, e),
          (e = (i || h.pdfMake).createPdf(o)),
          "open" !== l.download || p() ? e.download(t.filename) : e.open(),
          n();
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

// dataTables.searchbuilder.js
((e) => {
  var n, s;
  "function" == typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (t) {
        return e(t, window, document);
      })
    : "object" == typeof exports
    ? ((n = require("jquery")),
      (s = function (t, i) {
        i.fn.dataTable || require("datatables.net")(t, i);
      }),
      "undefined" == typeof window
        ? (module.exports = function (t, i) {
            return (t ||= window), (i ||= n(t)), s(t, i), e(i, t, t.document);
          })
        : (s(window, n), (module.exports = e(n, window, window.document))))
    : e(jQuery, window, document);
})(function (s, d, t) {
  var f,
    l,
    a,
    r,
    u,
    c,
    h,
    e,
    i,
    p = s.fn.dataTable;
  function o() {
    var t = p.use("moment");
    return t || d.moment;
  }
  function m() {
    var t = p.use("luxon");
    return t || d.luxon;
  }
  function n(t, i) {
    return (
      (t = new p.Api(t)),
      (i = i || t.init().searchBuilder || p.defaults.searchBuilder),
      new e(t, i).getNode()
    );
  }
  function g(t, i) {
    var n = this;
    if (!u || !u.versionCheck || !u.versionCheck("2"))
      throw Error("SearchBuilder requires DataTables 2 or newer");
    if (
      ((t = new u.Api(t)),
      (this.classes = r.extend(!0, {}, g.classes)),
      (this.c = r.extend(!0, {}, g.defaults, i)),
      (this.dom = {
        clearAll: r(
          '<button type="button">' +
            t.i18n("searchBuilder.clearAll", this.c.i18n.clearAll) +
            "</button>"
        )
          .addClass(this.classes.clearAll)
          .addClass(this.classes.button)
          .attr("type", "button"),
        container: r("<div/>").addClass(this.classes.container),
        title: r("<div/>").addClass(this.classes.title),
        titleRow: r("<div/>").addClass(this.classes.titleRow),
        topGroup: void 0,
      }),
      (this.s = {
        dt: t,
        opts: i,
        search: void 0,
        serverData: void 0,
        topGroup: void 0,
      }),
      void 0 === t.settings()[0]._searchBuilder)
    )
      return (
        (t.settings()[0]._searchBuilder = this).s.dt.page.info().serverSide &&
          (this.s.dt.on("preXhr.dtsb", function (t, i, e) {
            (t = n.s.dt.state.loaded()) &&
              t.searchBuilder &&
              (e.searchBuilder = n._collapseArray(t.searchBuilder));
          }),
          this.s.dt.on("xhr.dtsb", function (t, i, e) {
            e &&
              e.searchBuilder &&
              e.searchBuilder.options &&
              (n.s.serverData = e.searchBuilder.options);
          })),
        this.s.dt.settings()[0]._bInitComplete
          ? this._setUp()
          : t.one("init.dt", function () {
              n._setUp();
            }),
        this
      );
  }
  function v(t, i, e, n, s, o, r) {
    return (
      void 0 === n && (n = 0),
      void 0 === s && (s = !1),
      void 0 === o && (o = 1),
      void 0 === r && (r = void 0),
      (this.classes = a.extend(!0, {}, v.classes)),
      (this.c = a.extend(!0, {}, v.defaults, i)),
      (this.s = {
        criteria: [],
        depth: o,
        dt: t,
        index: n,
        isChild: s,
        logic: void 0,
        opts: i,
        preventRedraw: !1,
        serverData: r,
        toDrop: void 0,
        topGroup: e,
      }),
      (this.dom = {
        add: a("<button/>")
          .addClass(this.classes.add)
          .addClass(this.classes.button)
          .attr("type", "button"),
        clear: a("<button>&times</button>")
          .addClass(this.classes.button)
          .addClass(this.classes.clearGroup)
          .attr("type", "button"),
        container: a("<div/>").addClass(this.classes.group),
        logic: a("<button><div/></button>")
          .addClass(this.classes.logic)
          .addClass(this.classes.button)
          .attr("type", "button"),
        logicContainer: a("<div/>").addClass(this.classes.logicContainer),
        search: a("<button/>")
          .addClass(this.classes.search)
          .addClass(this.classes.button)
          .attr("type", "button")
          .css("display", "none"),
      }),
      void 0 === this.s.topGroup && (this.s.topGroup = this.dom.container),
      this._setup(),
      this
    );
  }
  function b(t, i, e, n, s, o, r) {
    void 0 === n && (n = 0),
      void 0 === s && (s = 1),
      void 0 === o && (o = void 0),
      void 0 === r && (r = !1);
    var a = this;
    if (
      ((this.classes = f.extend(!0, {}, b.classes)),
      (this.c = f.extend(
        !0,
        {},
        b.defaults,
        f.fn.dataTable.ext.searchBuilder,
        i
      )),
      (i = this.c.i18n),
      (this.s = {
        condition: void 0,
        conditions: {},
        data: void 0,
        dataIdx: -1,
        dataPoints: [],
        dateFormat: !1,
        depth: s,
        dt: t,
        filled: !1,
        index: n,
        liveSearch: r,
        origData: void 0,
        preventRedraw: !1,
        serverData: o,
        topGroup: e,
        type: "",
        value: [],
      }),
      (this.dom = {
        buttons: f("<div/>").addClass(this.classes.buttonContainer),
        condition: f("<select disabled/>")
          .addClass(this.classes.condition)
          .addClass(this.classes.dropDown)
          .addClass(this.classes.italic)
          .attr("autocomplete", "hacking"),
        conditionTitle: f('<option value="" disabled selected hidden/>').html(
          this.s.dt.i18n("searchBuilder.condition", i.condition)
        ),
        container: f("<div/>").addClass(this.classes.container),
        data: f("<select/>")
          .addClass(this.classes.data)
          .addClass(this.classes.dropDown)
          .addClass(this.classes.italic),
        dataTitle: f('<option value="" disabled selected hidden/>').html(
          this.s.dt.i18n("searchBuilder.data", i.data)
        ),
        defaultValue: f("<select disabled/>")
          .addClass(this.classes.value)
          .addClass(this.classes.dropDown)
          .addClass(this.classes.select)
          .addClass(this.classes.italic),
        delete: f("<button/>")
          .html(this.s.dt.i18n("searchBuilder.delete", i.delete))
          .addClass(this.classes.delete)
          .addClass(this.classes.button)
          .attr(
            "title",
            this.s.dt.i18n("searchBuilder.deleteTitle", i.deleteTitle)
          )
          .attr("type", "button"),
        inputCont: f("<div/>").addClass(this.classes.inputCont),
        left: f("<button/>")
          .html(this.s.dt.i18n("searchBuilder.left", i.left))
          .addClass(this.classes.left)
          .addClass(this.classes.button)
          .attr("title", this.s.dt.i18n("searchBuilder.leftTitle", i.leftTitle))
          .attr("type", "button"),
        right: f("<button/>")
          .html(this.s.dt.i18n("searchBuilder.right", i.right))
          .addClass(this.classes.right)
          .addClass(this.classes.button)
          .attr(
            "title",
            this.s.dt.i18n("searchBuilder.rightTitle", i.rightTitle)
          )
          .attr("type", "button"),
        value: [
          f("<select disabled/>")
            .addClass(this.classes.value)
            .addClass(this.classes.dropDown)
            .addClass(this.classes.italic)
            .addClass(this.classes.select),
        ],
        valueTitle: f(
          '<option value="--valueTitle--" disabled selected hidden/>'
        ).html(this.s.dt.i18n("searchBuilder.value", i.value)),
      }),
      this.c.greyscale)
    )
      for (
        this.dom.data.addClass(this.classes.greyscale),
          this.dom.condition.addClass(this.classes.greyscale),
          this.dom.defaultValue.addClass(this.classes.greyscale),
          t = 0,
          e = this.dom.value;
        t < e.length;
        t++
      )
        e[t].addClass(this.classes.greyscale);
    return (
      f(d).on(
        "resize.dtsb",
        l.util.throttle(function () {
          a.s.topGroup.trigger("dtsb-redrawLogic");
        })
      ),
      this._buildCriteria(),
      this
    );
  }
  return (
    (b._escapeHTML = function (t) {
      return t
        .toString()
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&");
    }),
    (b.prototype.doSearch = function () {
      this.c.liveSearch && this.s.dt.draw();
    }),
    (b.parseNumFmt = function (t) {
      return +t.replace(/(?!^-)[^0-9.]/g, "");
    }),
    (b.prototype.updateArrows = function (t) {
      void 0 === t && (t = !1),
        this.dom.container.children().detach(),
        this.dom.container
          .append(this.dom.data)
          .append(this.dom.condition)
          .append(this.dom.inputCont),
        this.setListeners(),
        void 0 !== this.dom.value[0] &&
          f(this.dom.value[0]).trigger("dtsb-inserted");
      for (var i = 1; i < this.dom.value.length; i++)
        this.dom.inputCont.append(this.dom.value[i]),
          f(this.dom.value[i]).trigger("dtsb-inserted");
      1 < this.s.depth && this.dom.buttons.append(this.dom.left),
        (!1 === this.c.depthLimit || this.s.depth < this.c.depthLimit) && t
          ? this.dom.buttons.append(this.dom.right)
          : this.dom.right.remove(),
        this.dom.buttons.append(this.dom.delete),
        this.dom.container.append(this.dom.buttons);
    }),
    (b.prototype.destroy = function () {
      this.dom.data.off(".dtsb"),
        this.dom.condition.off(".dtsb"),
        this.dom.delete.off(".dtsb");
      for (var t = 0, i = this.dom.value; t < i.length; t++) i[t].off(".dtsb");
      this.dom.container.remove();
    }),
    (b.prototype.search = function (t, i) {
      var e = this.s.dt.settings()[0],
        n = this.s.conditions[this.s.condition];
      if (void 0 !== this.s.condition && void 0 !== n) {
        var s = t[this.s.dataIdx];
        if (
          this.s.type &&
          this.s.type.includes("num") &&
          ("" !== e.oLanguage.sDecimal || "" !== e.oLanguage.sThousands)
        ) {
          if (
            ((s = [t[this.s.dataIdx]]),
            "" !== e.oLanguage.sDecimal &&
              (s = t[this.s.dataIdx].split(e.oLanguage.sDecimal)),
            "" !== e.oLanguage.sThousands)
          )
            for (t = 0; t < s.length; t++)
              s[t] = s[t].replace(e.oLanguage.sThousands, ",");
          s = s.join(".");
        }
        if (
          ("filter" !== this.c.orthogonal.search &&
            (s = e.fastData(
              i,
              this.s.dataIdx,
              "string" == typeof this.c.orthogonal
                ? this.c.orthogonal
                : this.c.orthogonal.search
            )),
          "array" === this.s.type)
        )
          for (
            (s = Array.isArray(s) ? s : [s]).sort(), i = 0, e = s;
            i < e.length;
            i++
          )
            (t = e[i]) &&
              "string" == typeof t &&
              t.replace(/[\r\n\u2028]/g, " ");
        else
          null !== s &&
            "string" == typeof s &&
            (s = s.replace(/[\r\n\u2028]/g, " "));
        return (
          this.s.type.includes("html") &&
            "string" == typeof s &&
            (s = s.replace(/(<([^>]+)>)/gi, "")),
          n.search((s = null === s ? "" : s), this.s.value, this)
        );
      }
    }),
    (b.prototype.getDetails = function (t) {
      void 0 === t && (t = !1);
      var i = this.s.dt.settings()[0];
      if (
        null === this.s.type ||
        !["num", "num-fmt", "html-num", "html-num-fmt"].includes(this.s.type) ||
        ("" === i.oLanguage.sDecimal && "" === i.oLanguage.sThousands)
      ) {
        if (null !== this.s.type && t)
          if (this.s.type.includes("date") || this.s.type.includes("time"))
            for (t = 0; t < this.s.value.length; t++)
              null ===
                this.s.value[t].match(
                  /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/g
                ) && (this.s.value[t] = "");
          else if (this.s.type.includes("moment"))
            for (t = 0; t < this.s.value.length; t++)
              this.s.value[t] &&
                0 < this.s.value[t].length &&
                o()(this.s.value[t], this.s.dateFormat, !0).isValid() &&
                (this.s.value[t] = o()(
                  this.s.value[t],
                  this.s.dateFormat
                ).format("YYYY-MM-DD HH:mm:ss"));
          else if (this.s.type.includes("luxon"))
            for (t = 0; t < this.s.value.length; t++)
              this.s.value[t] &&
                0 < this.s.value[t].length &&
                null ===
                  m().DateTime.fromFormat(this.s.value[t], this.s.dateFormat)
                    .invalid &&
                (this.s.value[t] = m()
                  .DateTime.fromFormat(this.s.value[t], this.s.dateFormat)
                  .toFormat("yyyy-MM-dd HH:mm:ss"));
      } else
        for (t = 0; t < this.s.value.length; t++) {
          var e = [this.s.value[t].toString()];
          if (
            ("" !== i.oLanguage.sDecimal &&
              (e = this.s.value[t].split(i.oLanguage.sDecimal)),
            "" !== i.oLanguage.sThousands)
          )
            for (var n = 0; n < e.length; n++)
              e[n] = e[n].replace(i.oLanguage.sThousands, ",");
          this.s.value[t] = e.join(".");
        }
      if (
        this.s.type &&
        this.s.type.includes("num") &&
        this.s.dt.page.info().serverSide
      )
        for (t = 0; t < this.s.value.length; t++)
          this.s.value[t] = this.s.value[t].replace(/[^0-9.\-]/g, "");
      return {
        condition: this.s.condition,
        data: this.s.data,
        origData: this.s.origData,
        type: this.s.type,
        value: this.s.value.map(function (t) {
          return null != t ? t.toString() : t;
        }),
      };
    }),
    (b.prototype.getNode = function () {
      return this.dom.container;
    }),
    (b.prototype.parseNumber = function (t) {
      var i = this.s.dt.i18n("decimal");
      return +(t =
        i && "." !== i ? t.replace(/\./g, "").replace(i, ".") : t).replace(
        /(?!^-)[^0-9.]/g,
        ""
      );
    }),
    (b.prototype.populate = function () {
      this._populateData(),
        -1 !== this.s.dataIdx &&
          (this._populateCondition(), void 0 !== this.s.condition) &&
          this._populateValue();
    }),
    (b.prototype.rebuild = function (t) {
      var i,
        e,
        n,
        s = !1;
      if (
        (this._populateData(),
        void 0 !== t.data &&
          ((e = this.classes.italic),
          (n = this.dom.data),
          this.dom.data.children("option").each(function () {
            !s &&
            (f(this).text() === t.data ||
              (t.origData && f(this).prop("origData") === t.origData))
              ? (f(this).prop("selected", !0),
                n.removeClass(e),
                (s = !0),
                (i = parseInt(f(this).val(), 10)))
              : f(this).removeProp("selected");
          })),
        s)
      ) {
        (this.s.data = t.data),
          (this.s.origData = t.origData),
          (this.s.dataIdx = i),
          (this.c.orthogonal = this._getOptions().orthogonal),
          this.dom.dataTitle.remove(),
          this._populateCondition(),
          this.dom.conditionTitle.remove();
        for (
          var o = void 0, r = this.dom.condition.children("option"), a = 0;
          a < r.length;
          a++
        ) {
          var d = f(r[a]);
          void 0 !== t.condition &&
          d.val() === t.condition &&
          "string" == typeof t.condition
            ? (d.prop("selected", !0), (o = d.val()))
            : d.removeProp("selected");
        }
        if (((this.s.condition = o), void 0 !== this.s.condition)) {
          for (
            this.dom.conditionTitle.removeProp("selected"),
              this.dom.conditionTitle.remove(),
              this.dom.condition.removeClass(this.classes.italic),
              a = 0;
            a < r.length;
            a++
          )
            (o = f(r[a])).val() !== this.s.condition &&
              o.removeProp("selected");
          this._populateValue(t);
        } else
          this.dom.conditionTitle
            .prependTo(this.dom.condition)
            .prop("selected", !0);
      }
    }),
    (b.prototype.setListeners = function () {
      var o = this;
      this.dom.data.unbind("change").on("change.dtsb", function () {
        o.dom.dataTitle.removeProp("selected");
        for (
          var t = o.dom.data.children("option." + o.classes.option), i = 0;
          i < t.length;
          i++
        ) {
          var e = f(t[i]);
          e.val() === o.dom.data.val()
            ? (o.dom.data.removeClass(o.classes.italic),
              e.prop("selected", !0),
              (o.s.dataIdx = +e.val()),
              (o.s.data = e.text()),
              (o.s.origData = e.prop("origData")),
              (o.c.orthogonal = o._getOptions().orthogonal),
              o._clearCondition(),
              o._clearValue(),
              o._populateCondition(),
              o.s.filled && ((o.s.filled = !1), o.doSearch(), o.setListeners()),
              o.s.dt.state.save())
            : e.removeProp("selected");
        }
      }),
        this.dom.condition.unbind("change").on("change.dtsb", function () {
          o.dom.conditionTitle.removeProp("selected");
          for (
            var t = o.dom.condition.children("option." + o.classes.option),
              i = 0;
            i < t.length;
            i++
          )
            if ((e = f(t[i])).val() === o.dom.condition.val()) {
              o.dom.condition.removeClass(o.classes.italic),
                e.prop("selected", !0);
              for (
                var e = e.val(), n = 0, s = Object.keys(o.s.conditions);
                n < s.length;
                n++
              )
                if (s[n] === e) {
                  o.s.condition = e;
                  break;
                }
              for (
                o._clearValue(), o._populateValue(), e = 0, n = o.dom.value;
                e < n.length;
                e++
              )
                (s = n[e]),
                  o.s.filled &&
                    void 0 !== s &&
                    0 !== o.dom.inputCont.has(s[0]).length &&
                    ((o.s.filled = !1), o.doSearch(), o.setListeners());
              (0 === o.dom.value.length ||
                (1 === o.dom.value.length && void 0 === o.dom.value[0])) &&
                o.doSearch();
            } else e.removeProp("selected");
        });
    }),
    (b.prototype.setupButtons = function () {
      550 < d.innerWidth
        ? (this.dom.container.removeClass(this.classes.vertical),
          this.dom.buttons.css("left", null),
          this.dom.buttons.css("top", null))
        : (this.dom.container.addClass(this.classes.vertical),
          this.dom.buttons.css("left", this.dom.data.innerWidth()),
          this.dom.buttons.css("top", this.dom.data.position().top));
    }),
    (b.prototype._buildCriteria = function () {
      this.dom.data.append(this.dom.dataTitle),
        this.dom.condition.append(this.dom.conditionTitle),
        this.dom.container.append(this.dom.data).append(this.dom.condition),
        this.dom.inputCont.empty();
      for (var t = 0, i = this.dom.value; t < i.length; t++) {
        var e = i[t];
        e.append(this.dom.valueTitle), this.dom.inputCont.append(e);
      }
      this.dom.buttons.append(this.dom.delete).append(this.dom.right),
        this.dom.container.append(this.dom.inputCont).append(this.dom.buttons),
        this.setListeners();
    }),
    (b.prototype._clearCondition = function () {
      this.dom.condition.empty(),
        this.dom.conditionTitle.prop("selected", !0).attr("disabled", "true"),
        this.dom.condition
          .prepend(this.dom.conditionTitle)
          .prop("selectedIndex", 0),
        (this.s.conditions = {}),
        (this.s.condition = void 0);
    }),
    (b.prototype._clearValue = function () {
      if (void 0 !== this.s.condition) {
        if (0 < this.dom.value.length && void 0 !== this.dom.value[0])
          for (var t = 0, i = this.dom.value; t < i.length; t++) {
            var e = i[t];
            void 0 !== e &&
              setTimeout(function () {
                e.remove();
              }, 50);
          }
        if (
          ((this.dom.value = [].concat(
            this.s.conditions[this.s.condition].init(this, b.updateListener)
          )),
          0 < this.dom.value.length && void 0 !== this.dom.value[0])
        )
          for (
            this.dom.inputCont
              .empty()
              .append(this.dom.value[0])
              .insertAfter(this.dom.condition),
              f(this.dom.value[0]).trigger("dtsb-inserted"),
              t = 1;
            t < this.dom.value.length;
            t++
          )
            this.dom.inputCont.append(this.dom.value[t]),
              f(this.dom.value[t]).trigger("dtsb-inserted");
      } else {
        for (t = 0, i = this.dom.value; t < i.length; t++)
          void 0 !== (e = i[t]) &&
            setTimeout(function () {
              e.remove();
            }, 50);
        this.dom.valueTitle.prop("selected", !0),
          this.dom.defaultValue
            .append(this.dom.valueTitle)
            .insertAfter(this.dom.condition);
      }
      (this.s.value = []),
        (this.dom.value = [
          f("<select disabled/>")
            .addClass(this.classes.value)
            .addClass(this.classes.dropDown)
            .addClass(this.classes.italic)
            .addClass(this.classes.select)
            .append(this.dom.valueTitle.clone()),
        ]);
    }),
    (b.prototype._getOptions = function () {
      return f.extend(
        !0,
        {},
        b.defaults,
        this.s.dt.settings()[0].aoColumns[this.s.dataIdx].searchBuilder
      );
    }),
    (b.prototype._populateCondition = function () {
      var t,
        i = [],
        e = Object.keys(this.s.conditions).length,
        n = this.s.dt,
        s = n.settings()[0].aoColumns,
        o = +this.dom.data.children("option:selected").val();
      if (0 === e) {
        (this.s.type = n.column(o).type()),
          void 0 !== s &&
            (null != (e = s[o]).searchBuilderType
              ? (this.s.type = e.searchBuilderType)
              : null == this.s.type && (this.s.type = e.sType)),
          null == this.s.type &&
            (f.fn.dataTable.ext.oApi &&
              f.fn.dataTable.ext.oApi._fnColumnTypes(n.settings()[0]),
            (this.s.type = n.column(o).type())),
          this.dom.condition
            .removeAttr("disabled")
            .empty()
            .append(this.dom.conditionTitle)
            .addClass(this.classes.italic),
          this.dom.conditionTitle.prop("selected", !0),
          "" !== (e = n.settings()[0].oLanguage.sDecimal) &&
            this.s.type &&
            this.s.type.indexOf(e) === this.s.type.length - e.length &&
            (this.s.type.includes("num-fmt") || this.s.type.includes("num")) &&
            (this.s.type = this.s.type.replace(e, "")),
          void 0 !== this.c.conditions[this.s.type]
            ? (t = this.c.conditions[this.s.type])
            : this.s.type && this.s.type.includes("datetime-")
            ? ((t = p.use("moment")
                ? this.c.conditions.moment
                : this.c.conditions.luxon),
              (this.s.dateFormat = this.s.type.replace(/datetime-/g, "")))
            : this.s.type && this.s.type.includes("moment")
            ? ((t = this.c.conditions.moment),
              (this.s.dateFormat = this.s.type.replace(/moment-/g, "")))
            : this.s.type && this.s.type.includes("luxon")
            ? ((t = this.c.conditions.luxon),
              (this.s.dateFormat = this.s.type.replace(/luxon-/g, "")))
            : (t = this.c.conditions.string);
        for (var r = 0, a = Object.keys(t); r < a.length; r++) {
          var d = a[r];
          null !== t[d] &&
            (n.page.info().serverSide &&
              t[d].init === b.initSelect &&
              ((e = s[o]),
              this.s.serverData && this.s.serverData[e.data]
                ? ((t[d].init = b.initSelectSSP),
                  (t[d].inputValue = b.inputValueSelect),
                  (t[d].isInputValid = b.isInputValidSelect))
                : ((t[d].init = b.initInput),
                  (t[d].inputValue = b.inputValueInput),
                  (t[d].isInputValid = b.isInputValidInput))),
            (this.s.conditions[d] = t[d]),
            "function" == typeof (e = t[d].conditionName) &&
              (e = e(n, this.c.i18n)),
            i.push(
              f("<option>", { text: e, value: d })
                .addClass(this.classes.option)
                .addClass(this.classes.notItalic)
            ));
        }
      } else {
        if (!(0 < e))
          return void this.dom.condition
            .attr("disabled", "true")
            .addClass(this.classes.italic);
        for (
          this.dom.condition
            .empty()
            .removeAttr("disabled")
            .addClass(this.classes.italic),
            e = 0,
            t = Object.keys(this.s.conditions);
          e < t.length;
          e++
        )
          (d = t[e]),
            "function" == typeof (r = this.s.conditions[d].conditionName) &&
              (r = r(n, this.c.i18n)),
            (d = f("<option>", { text: r, value: d })
              .addClass(this.classes.option)
              .addClass(this.classes.notItalic)),
            void 0 !== this.s.condition &&
              this.s.condition === r &&
              (d.prop("selected", !0),
              this.dom.condition.removeClass(this.classes.italic)),
            i.push(d);
      }
      for (e = 0; e < i.length; e++) this.dom.condition.append(i[e]);
      if (s[o].searchBuilder && s[o].searchBuilder.defaultCondition) {
        if ("number" == typeof (s = s[o].searchBuilder.defaultCondition))
          this.dom.condition.prop("selectedIndex", s),
            this.dom.condition.trigger("change");
        else if ("string" == typeof s)
          for (o = 0; o < i.length; o++)
            for (d = 0, t = Object.keys(this.s.conditions); d < t.length; d++)
              if (
                ((r = t[d]),
                ("string" == typeof (e = this.s.conditions[r].conditionName)
                  ? e
                  : e(n, this.c.i18n)) === i[o].text() && r === s)
              ) {
                this.dom.condition
                  .prop(
                    "selectedIndex",
                    this.dom.condition.children().toArray().indexOf(i[o][0])
                  )
                  .removeClass(this.classes.italic),
                  this.dom.condition.trigger("change"),
                  (o = i.length);
                break;
              }
      } else this.dom.condition.prop("selectedIndex", 0);
    }),
    (b.prototype._populateData = function () {
      var t = this.s.dt.settings()[0].aoColumns,
        i = this.s.dt.columns(this.c.columns).indexes().toArray();
      this.dom.data.empty().append(this.dom.dataTitle);
      for (var e, n, s, o = 0; o < t.length; o++)
        (!0 !== this.c.columns && !i.includes(o)) ||
          ((s = ((e = t[(n = o)]).searchBuilderTitle || e.sTitle).replace(
            /(<([^>]+)>)/gi,
            ""
          )),
          this.dom.data.append(
            f("<option>", { text: s, value: n })
              .addClass(this.classes.option)
              .addClass(this.classes.notItalic)
              .prop("origData", e.data)
              .prop("selected", this.s.dataIdx === n)
          ),
          this.s.dataIdx !== n) ||
          this.dom.dataTitle.removeProp("selected");
    }),
    (b.prototype._populateValue = function (i) {
      for (
        var e = this,
          t = this.s.filled,
          n =
            ((this.s.filled = !1),
            setTimeout(function () {
              e.dom.defaultValue.remove();
            }, 50),
            function (t) {
              setTimeout(function () {
                void 0 !== t && t.remove();
              }, 50);
            }),
          s = 0,
          o = this.dom.value;
        s < o.length;
        s++
      )
        n(o[s]);
      if (1 < (s = this.dom.inputCont.children()).length)
        for (n = 0; n < s.length; n++) f(s[n]).remove();
      for (
        void 0 !== i &&
          this.s.dt.columns().every(function (t) {
            e.s.dt.settings()[0].aoColumns[t].sTitle === i.data &&
              (e.s.dataIdx = t);
          }),
          this.dom.value = [].concat(
            this.s.conditions[this.s.condition].init(
              this,
              b.updateListener,
              void 0 !== i ? i.value : void 0
            )
          ),
          void 0 !== i && void 0 !== i.value && (this.s.value = i.value),
          this.dom.inputCont.empty(),
          void 0 !== this.dom.value[0] &&
            f(this.dom.value[0])
              .appendTo(this.dom.inputCont)
              .trigger("dtsb-inserted"),
          n = 1;
        n < this.dom.value.length;
        n++
      )
        f(this.dom.value[n])
          .insertAfter(this.dom.value[n - 1])
          .trigger("dtsb-inserted");
      (this.s.filled = this.s.conditions[this.s.condition].isInputValid(
        this.dom.value,
        this
      )),
        this.setListeners(),
        this.s.preventRedraw ||
          t === this.s.filled ||
          (this.s.dt.page.info().serverSide || this.doSearch(),
          this.setListeners());
    }),
    (b.prototype._throttle = function (e, n) {
      var s = null,
        o = null,
        r = this;
      return (
        null === (n = void 0 === n ? 200 : n) && (n = 200),
        function () {
          for (var t = [], i = 0; i < arguments.length; i++)
            t[i] = arguments[i];
          (i = +new Date()),
            null !== s && i < s + n ? clearTimeout(o) : (s = i),
            (o = setTimeout(function () {
              (s = null), e.apply(r, t);
            }, n));
        }
      );
    }),
    (b.version = "1.1.0"),
    (b.classes = {
      button: "dtsb-button",
      buttonContainer: "dtsb-buttonContainer",
      condition: "dtsb-condition",
      container: "dtsb-criteria",
      data: "dtsb-data",
      delete: "dtsb-delete",
      dropDown: "dtsb-dropDown",
      greyscale: "dtsb-greyscale",
      input: "dtsb-input",
      inputCont: "dtsb-inputCont",
      italic: "dtsb-italic",
      joiner: "dtsb-joiner",
      left: "dtsb-left",
      notItalic: "dtsb-notItalic",
      option: "dtsb-option",
      right: "dtsb-right",
      select: "dtsb-select",
      value: "dtsb-value",
      vertical: "dtsb-vertical",
    }),
    (b.initSelect = function (e, t, n, i) {
      void 0 === n && (n = null), void 0 === i && (i = !1);
      var s = e.dom.data.children("option:selected").val(),
        o = e.s.dt.rows().indexes().toArray(),
        r = e.s.dt.settings()[0].fastData,
        a =
          (e.dom.valueTitle.prop("selected", !0),
          f("<select/>")
            .addClass(b.classes.value)
            .addClass(b.classes.dropDown)
            .addClass(b.classes.italic)
            .addClass(b.classes.select)
            .append(e.dom.valueTitle)
            .on("change.dtsb", function () {
              f(this).removeClass(b.classes.italic), t(e, this);
            }));
      e.c.greyscale && a.addClass(b.classes.greyscale);
      for (var d = [], l = [], u = 0; u < o.length; u++) {
        var c =
            "string" ==
            typeof (c = r(
              (h = o[u]),
              s,
              "string" == typeof e.c.orthogonal
                ? e.c.orthogonal
                : e.c.orthogonal.search
            ))
              ? c.replace(/[\r\n\u2028]/g, " ")
              : c,
          h = r(
            h,
            s,
            "string" == typeof e.c.orthogonal
              ? e.c.orthogonal
              : e.c.orthogonal.display
          ),
          p =
            ("array" === e.s.type &&
              ((c = Array.isArray(c) ? c : [c]),
              (h = Array.isArray(h) ? h : [h])),
            function (t, i) {
              e.s.type.includes("html") &&
                null !== t &&
                "string" == typeof t &&
                t.replace(/(<([^>]+)>)/gi, ""),
                (i = (t = f("<option>", {
                  type: Array.isArray(t) ? "Array" : "String",
                  value: t,
                })
                  .data("sbv", t)
                  .addClass(e.classes.option)
                  .addClass(e.classes.notItalic)
                  .html(
                    "string" == typeof i ? i.replace(/(<([^>]+)>)/gi, "") : i
                  )).val()),
                -1 === d.indexOf(i) &&
                  (d.push(i),
                  l.push(t),
                  null !== n &&
                    Array.isArray(n[0]) &&
                    (n[0] = n[0].sort().join(",")),
                  null !== n) &&
                  t.val() === n[0] &&
                  (t.prop("selected", !0),
                  a.removeClass(b.classes.italic),
                  e.dom.valueTitle.removeProp("selected"));
            });
        if (i) for (var m = 0; m < c.length; m++) p(c[m], h[m]);
        else p(c, Array.isArray(h) ? h.join(", ") : h);
      }
      for (
        l.sort(function (t, i) {
          return "array" === e.s.type ||
            "string" === e.s.type ||
            "html" === e.s.type
            ? t.val() < i.val()
              ? -1
              : t.val() > i.val()
              ? 1
              : 0
            : "num" === e.s.type || "html-num" === e.s.type
            ? +t.val().replace(/(<([^>]+)>)/gi, "") <
              +i.val().replace(/(<([^>]+)>)/gi, "")
              ? -1
              : +t.val().replace(/(<([^>]+)>)/gi, "") >
                +i.val().replace(/(<([^>]+)>)/gi, "")
              ? 1
              : 0
            : "num-fmt" === e.s.type || "html-num-fmt" === e.s.type
            ? +t.val().replace(/[^0-9.]/g, "") <
              +i.val().replace(/[^0-9.]/g, "")
              ? -1
              : +t.val().replace(/[^0-9.]/g, "") >
                +i.val().replace(/[^0-9.]/g, "")
              ? 1
              : 0
            : void 0;
        }),
          i = 0;
        i < l.length;
        i++
      )
        a.append(l[i]);
      return a;
    }),
    (b.initSelectSSP = function (t, i, e) {
      void 0 === e && (e = null), t.dom.valueTitle.prop("selected", !0);
      var n = f("<select/>")
        .addClass(b.classes.value)
        .addClass(b.classes.dropDown)
        .addClass(b.classes.italic)
        .addClass(b.classes.select)
        .append(t.dom.valueTitle)
        .on("change.dtsb", function () {
          f(this).removeClass(b.classes.italic), i(t, this);
        });
      t.c.greyscale && n.addClass(b.classes.greyscale);
      for (
        var s, o = [], r = 0, a = t.s.serverData[t.s.origData];
        r < a.length;
        r++
      ) {
        var d = a[r];
        (s = d.value),
          (d = d.label),
          t.s.type.includes("html") &&
            null !== s &&
            "string" == typeof s &&
            s.replace(/(<([^>]+)>)/gi, ""),
          (s = f("<option>", {
            type: Array.isArray(s) ? "Array" : "String",
            value: s,
          })
            .data("sbv", s)
            .addClass(t.classes.option)
            .addClass(t.classes.notItalic)
            .html("string" == typeof d ? d.replace(/(<([^>]+)>)/gi, "") : d)),
          o.push(s),
          null !== e &&
            s.val() === e[0] &&
            (s.prop("selected", !0),
            n.removeClass(b.classes.italic),
            t.dom.valueTitle.removeProp("selected"));
      }
      for (r = 0; r < o.length; r++) n.append(o[r]);
      return n;
    }),
    (b.initSelectArray = function (t, i, e) {
      return b.initSelect(t, i, (e = void 0 === e ? null : e), !0);
    }),
    (b.initInput = function (i, e, t) {
      void 0 === t && (t = null);
      var n = i.s.dt.settings()[0].searchDelay,
        n = f("<input/>")
          .addClass(b.classes.value)
          .addClass(b.classes.input)
          .on(
            "input.dtsb keypress.dtsb",
            i._throttle(
              function (t) {
                return e(i, this, t.keyCode || t.which);
              },
              null === n ? 100 : n
            )
          );
      return (
        i.c.greyscale && n.addClass(b.classes.greyscale),
        null !== t && n.val(t[0]),
        i.s.dt.one("draw.dtsb", function () {
          i.s.topGroup.trigger("dtsb-redrawLogic");
        }),
        n
      );
    }),
    (b.init2Input = function (i, e, t) {
      void 0 === t && (t = null);
      var n = i.s.dt.settings()[0].searchDelay,
        n = [
          f("<input/>")
            .addClass(b.classes.value)
            .addClass(b.classes.input)
            .on(
              "input.dtsb keypress.dtsb",
              i._throttle(
                function (t) {
                  return e(i, this, t.keyCode || t.which);
                },
                null === n ? 100 : n
              )
            ),
          f("<span>")
            .addClass(i.classes.joiner)
            .html(
              i.s.dt.i18n("searchBuilder.valueJoiner", i.c.i18n.valueJoiner)
            ),
          f("<input/>")
            .addClass(b.classes.value)
            .addClass(b.classes.input)
            .on(
              "input.dtsb keypress.dtsb",
              i._throttle(
                function (t) {
                  return e(i, this, t.keyCode || t.which);
                },
                null === n ? 100 : n
              )
            ),
        ];
      return (
        i.c.greyscale &&
          (n[0].addClass(b.classes.greyscale),
          n[2].addClass(b.classes.greyscale)),
        null !== t && (n[0].val(t[0]), n[2].val(t[1])),
        i.s.dt.one("draw.dtsb", function () {
          i.s.topGroup.trigger("dtsb-redrawLogic");
        }),
        n
      );
    }),
    (b.initDate = function (i, e, t) {
      void 0 === t && (t = null);
      var n = i.s.dt.settings()[0].searchDelay,
        s = i.s.dt.i18n("datetime", {}),
        s = f("<input/>")
          .addClass(b.classes.value)
          .addClass(b.classes.input)
          .dtDateTime({
            attachTo: "input",
            format: i.s.dateFormat || void 0,
            i18n: s,
          })
          .on(
            "change.dtsb",
            i._throttle(
              function () {
                return e(i, this);
              },
              null === n ? 100 : n
            )
          )
          .on("input.dtsb keypress.dtsb", function (t) {
            i._throttle(
              function () {
                return e(i, this, t.keyCode || t.which);
              },
              null === n ? 100 : n
            );
          });
      return (
        i.c.greyscale && s.addClass(b.classes.greyscale),
        null !== t && s.val(t[0]),
        i.s.dt.one("draw.dtsb", function () {
          i.s.topGroup.trigger("dtsb-redrawLogic");
        }),
        s
      );
    }),
    (b.initNoValue = function (t) {
      return (
        t.s.dt.one("draw.dtsb", function () {
          t.s.topGroup.trigger("dtsb-redrawLogic");
        }),
        []
      );
    }),
    (b.init2Date = function (i, e, t) {
      var n = this,
        s = (void 0 === t && (t = null), i.s.dt.settings()[0].searchDelay),
        o = i.s.dt.i18n("datetime", {}),
        o = [
          f("<input/>")
            .addClass(b.classes.value)
            .addClass(b.classes.input)
            .dtDateTime({
              attachTo: "input",
              format: i.s.dateFormat || void 0,
              i18n: o,
            })
            .on(
              "change.dtsb",
              null !== s
                ? p.util.throttle(function () {
                    return e(i, this);
                  }, s)
                : function () {
                    e(i, n);
                  }
            )
            .on("input.dtsb keypress.dtsb", function (t) {
              p.util.throttle(
                function () {
                  return e(i, this, t.keyCode || t.which);
                },
                null === s ? 0 : s
              );
            }),
          f("<span>")
            .addClass(i.classes.joiner)
            .html(
              i.s.dt.i18n("searchBuilder.valueJoiner", i.c.i18n.valueJoiner)
            ),
          f("<input/>")
            .addClass(b.classes.value)
            .addClass(b.classes.input)
            .dtDateTime({
              attachTo: "input",
              format: i.s.dateFormat || void 0,
              i18n: o,
            })
            .on(
              "change.dtsb",
              null !== s
                ? p.util.throttle(function () {
                    return e(i, this);
                  }, s)
                : function () {
                    e(i, n);
                  }
            )
            .on(
              "input.dtsb keypress.dtsb",
              i.c.enterSearch ||
                (void 0 !== i.s.dt.settings()[0].oInit.search &&
                  i.s.dt.settings()[0].oInit.search.return) ||
                null === s
                ? function (t) {
                    e(i, n, t.keyCode || t.which);
                  }
                : p.util.throttle(function () {
                    return e(i, this);
                  }, s)
            ),
        ];
      return (
        i.c.greyscale &&
          (o[0].addClass(b.classes.greyscale),
          o[2].addClass(b.classes.greyscale)),
        null !== t && 0 < t.length && (o[0].val(t[0]), o[2].val(t[1])),
        i.s.dt.one("draw.dtsb", function () {
          i.s.topGroup.trigger("dtsb-redrawLogic");
        }),
        o
      );
    }),
    (b.isInputValidSelect = function (t) {
      for (var i = !0, e = 0; e < t.length; e++) {
        var n = t[e];
        n.children("option:selected").length ===
          n.children("option").length -
            n.children("option." + b.classes.notItalic).length &&
          1 === n.children("option:selected").length &&
          n.children("option:selected")[0] === n.children("option")[0] &&
          (i = !1);
      }
      return i;
    }),
    (b.isInputValidInput = function (t) {
      for (var i = !0, e = 0; e < t.length; e++) {
        var n = t[e];
        n.is("input") && 0 === n.val().length && (i = !1);
      }
      return i;
    }),
    (b.inputValueSelect = function (t) {
      for (var i = [], e = 0; e < t.length; e++) {
        var n = t[e];
        n.is("select") &&
          i.push(b._escapeHTML(n.children("option:selected").data("sbv")));
      }
      return i;
    }),
    (b.inputValueInput = function (t) {
      for (var i = [], e = 0; e < t.length; e++) {
        var n = t[e];
        n.is("input") && i.push(b._escapeHTML(n.val()));
      }
      return i.map(l.util.diacritics);
    }),
    (b.updateListener = function (t, i, e) {
      var n = t.s.conditions[t.s.condition];
      if (
        ((t.s.filled = n.isInputValid(t.dom.value, t)),
        (t.s.value = n.inputValue(t.dom.value, t)),
        t.s.filled)
      ) {
        for (
          Array.isArray(t.s.value) || (t.s.value = [t.s.value]), n = 0;
          n < t.s.value.length;
          n++
        )
          Array.isArray(t.s.value[n]) && t.s.value[n].sort();
        for (var s = null, o = null, n = 0; n < t.dom.value.length; n++)
          i === t.dom.value[n][0] &&
            ((s = n), void 0 !== i.selectionStart) &&
            (o = i.selectionStart);
        ((t.c.enterSearch ||
          (void 0 !== t.s.dt.settings()[0].oInit.search &&
            t.s.dt.settings()[0].oInit.search.return)) &&
          13 !== e) ||
          t.doSearch(),
          null !== s &&
            (t.dom.value[s].removeClass(t.classes.italic),
            t.dom.value[s].focus(),
            null !== o) &&
            t.dom.value[s][0].setSelectionRange(o, o);
      } else
        ((t.c.enterSearch ||
          (void 0 !== t.s.dt.settings()[0].oInit.search &&
            t.s.dt.settings()[0].oInit.search.return)) &&
          13 !== e) ||
          t.doSearch();
    }),
    (b.dateConditions = {
      "=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.equals",
            i.conditions.date.equals
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return (t = t.replace(/(\/|-|,)/g, "-")) === i[0];
        },
      },
      "!=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.not",
            i.conditions.date.not
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return (t = t.replace(/(\/|-|,)/g, "-")) !== i[0];
        },
      },
      "<": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.before",
            i.conditions.date.before
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return (t = t.replace(/(\/|-|,)/g, "-")) < i[0];
        },
      },
      ">": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.after",
            i.conditions.date.after
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return (t = t.replace(/(\/|-|,)/g, "-")) > i[0];
        },
      },
      between: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.between",
            i.conditions.date.between
          );
        },
        init: b.init2Date,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return (
            (t = t.replace(/(\/|-|,)/g, "-")),
            i[0] < i[1] ? i[0] <= t && t <= i[1] : i[1] <= t && t <= i[0]
          );
        },
      },
      "!between": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.notBetween",
            i.conditions.date.notBetween
          );
        },
        init: b.init2Date,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return (
            (t = t.replace(/(\/|-|,)/g, "-")),
            i[0] < i[1] ? !(i[0] <= t && t <= i[1]) : !(i[1] <= t && t <= i[0])
          );
        },
      },
      null: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.empty",
            i.conditions.date.empty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return null == t || 0 === t.length;
        },
      },
      "!null": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.notEmpty",
            i.conditions.date.notEmpty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return !(null == t || 0 === t.length);
        },
      },
    }),
    (b.momentDateConditions = {
      "=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.equals",
            i.conditions.date.equals
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return (
            o()(t, e.s.dateFormat).valueOf() ===
            o()(i[0], e.s.dateFormat).valueOf()
          );
        },
      },
      "!=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.not",
            i.conditions.date.not
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return (
            o()(t, e.s.dateFormat).valueOf() !==
            o()(i[0], e.s.dateFormat).valueOf()
          );
        },
      },
      "<": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.before",
            i.conditions.date.before
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return (
            o()(t, e.s.dateFormat).valueOf() <
            o()(i[0], e.s.dateFormat).valueOf()
          );
        },
      },
      ">": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.after",
            i.conditions.date.after
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return (
            o()(t, e.s.dateFormat).valueOf() >
            o()(i[0], e.s.dateFormat).valueOf()
          );
        },
      },
      between: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.between",
            i.conditions.date.between
          );
        },
        init: b.init2Date,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          t = o()(t, e.s.dateFormat).valueOf();
          var n = o()(i[0], e.s.dateFormat).valueOf();
          return n < (i = o()(i[1], e.s.dateFormat).valueOf())
            ? n <= t && t <= i
            : i <= t && t <= n;
        },
      },
      "!between": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.notBetween",
            i.conditions.date.notBetween
          );
        },
        init: b.init2Date,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          t = o()(t, e.s.dateFormat).valueOf();
          var n = o()(i[0], e.s.dateFormat).valueOf();
          return n < (i = o()(i[1], e.s.dateFormat).valueOf())
            ? !(+n <= +t && +t <= +i)
            : !(+i <= +t && +t <= +n);
        },
      },
      null: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.empty",
            i.conditions.date.empty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return null == t || 0 === t.length;
        },
      },
      "!null": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.notEmpty",
            i.conditions.date.notEmpty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return !(null == t || 0 === t.length);
        },
      },
    }),
    (b.luxonDateConditions = {
      "=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.equals",
            i.conditions.date.equals
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return (
            m().DateTime.fromFormat(t, e.s.dateFormat).ts ===
            m().DateTime.fromFormat(i[0], e.s.dateFormat).ts
          );
        },
      },
      "!=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.not",
            i.conditions.date.not
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return (
            m().DateTime.fromFormat(t, e.s.dateFormat).ts !==
            m().DateTime.fromFormat(i[0], e.s.dateFormat).ts
          );
        },
      },
      "<": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.before",
            i.conditions.date.before
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return (
            m().DateTime.fromFormat(t, e.s.dateFormat).ts <
            m().DateTime.fromFormat(i[0], e.s.dateFormat).ts
          );
        },
      },
      ">": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.after",
            i.conditions.date.after
          );
        },
        init: b.initDate,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return (
            m().DateTime.fromFormat(t, e.s.dateFormat).ts >
            m().DateTime.fromFormat(i[0], e.s.dateFormat).ts
          );
        },
      },
      between: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.between",
            i.conditions.date.between
          );
        },
        init: b.init2Date,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          t = m().DateTime.fromFormat(t, e.s.dateFormat).ts;
          var n = m().DateTime.fromFormat(i[0], e.s.dateFormat).ts;
          return n < (i = m().DateTime.fromFormat(i[1], e.s.dateFormat).ts)
            ? n <= t && t <= i
            : i <= t && t <= n;
        },
      },
      "!between": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.notBetween",
            i.conditions.date.notBetween
          );
        },
        init: b.init2Date,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          t = m().DateTime.fromFormat(t, e.s.dateFormat).ts;
          var n = m().DateTime.fromFormat(i[0], e.s.dateFormat).ts;
          return n < (i = m().DateTime.fromFormat(i[1], e.s.dateFormat).ts)
            ? !(+n <= +t && +t <= +i)
            : !(+i <= +t && +t <= +n);
        },
      },
      null: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.empty",
            i.conditions.date.empty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return null == t || 0 === t.length;
        },
      },
      "!null": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.date.notEmpty",
            i.conditions.date.notEmpty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return !(null == t || 0 === t.length);
        },
      },
    }),
    (b.numConditions = {
      "=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.equals",
            i.conditions.number.equals
          );
        },
        init: b.initSelect,
        inputValue: b.inputValueSelect,
        isInputValid: b.isInputValidSelect,
        search: function (t, i) {
          return +t == +i[0];
        },
      },
      "!=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.not",
            i.conditions.number.not
          );
        },
        init: b.initSelect,
        inputValue: b.inputValueSelect,
        isInputValid: b.isInputValidSelect,
        search: function (t, i) {
          return +t != +i[0];
        },
      },
      "<": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.lt",
            i.conditions.number.lt
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return +t < +i[0];
        },
      },
      "<=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.lte",
            i.conditions.number.lte
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return +t <= +i[0];
        },
      },
      ">=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.gte",
            i.conditions.number.gte
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return +t >= +i[0];
        },
      },
      ">": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.gt",
            i.conditions.number.gt
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return +t > +i[0];
        },
      },
      between: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.between",
            i.conditions.number.between
          );
        },
        init: b.init2Input,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return +i[0] < +i[1]
            ? +i[0] <= +t && +t <= +i[1]
            : +i[1] <= +t && +t <= +i[0];
        },
      },
      "!between": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.notBetween",
            i.conditions.number.notBetween
          );
        },
        init: b.init2Input,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return +i[0] < +i[1]
            ? !(+i[0] <= +t && +t <= +i[1])
            : !(+i[1] <= +t && +t <= +i[0]);
        },
      },
      null: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.empty",
            i.conditions.number.empty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return null == t || 0 === t.length;
        },
      },
      "!null": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.notEmpty",
            i.conditions.number.notEmpty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return !(null == t || 0 === t.length);
        },
      },
    }),
    (b.numFmtConditions = {
      "=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.equals",
            i.conditions.number.equals
          );
        },
        init: b.initSelect,
        inputValue: b.inputValueSelect,
        isInputValid: b.isInputValidSelect,
        search: function (t, i, e) {
          return e.parseNumber(t) === e.parseNumber(i[0]);
        },
      },
      "!=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.not",
            i.conditions.number.not
          );
        },
        init: b.initSelect,
        inputValue: b.inputValueSelect,
        isInputValid: b.isInputValidSelect,
        search: function (t, i, e) {
          return e.parseNumber(t) !== e.parseNumber(i[0]);
        },
      },
      "<": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.lt",
            i.conditions.number.lt
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return e.parseNumber(t) < e.parseNumber(i[0]);
        },
      },
      "<=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.lte",
            i.conditions.number.lte
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return e.parseNumber(t) <= e.parseNumber(i[0]);
        },
      },
      ">=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.gte",
            i.conditions.number.gte
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return e.parseNumber(t) >= e.parseNumber(i[0]);
        },
      },
      ">": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.gt",
            i.conditions.number.gt
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          return e.parseNumber(t) > e.parseNumber(i[0]);
        },
      },
      between: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.between",
            i.conditions.number.between
          );
        },
        init: b.init2Input,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          t = e.parseNumber(t);
          var n = e.parseNumber(i[0]);
          return +n < +(i = e.parseNumber(i[1]))
            ? +n <= +t && +t <= +i
            : +i <= +t && +t <= +n;
        },
      },
      "!between": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.notBetween",
            i.conditions.number.notBetween
          );
        },
        init: b.init2Input,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i, e) {
          t = e.parseNumber(t);
          var n = e.parseNumber(i[0]);
          return +n < +(i = e.parseNumber(i[1]))
            ? !(+n <= +t && +t <= +i)
            : !(+i <= +t && +t <= +n);
        },
      },
      null: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.empty",
            i.conditions.number.empty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return null == t || 0 === t.length;
        },
      },
      "!null": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.number.notEmpty",
            i.conditions.number.notEmpty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return !(null == t || 0 === t.length);
        },
      },
    }),
    (b.stringConditions = {
      "=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.string.equals",
            i.conditions.string.equals
          );
        },
        init: b.initSelect,
        inputValue: b.inputValueSelect,
        isInputValid: b.isInputValidSelect,
        search: function (t, i) {
          return t === i[0];
        },
      },
      "!=": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.string.not",
            i.conditions.string.not
          );
        },
        init: b.initSelect,
        inputValue: b.inputValueSelect,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return t !== i[0];
        },
      },
      starts: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.string.startsWith",
            i.conditions.string.startsWith
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return 0 === t.toLowerCase().indexOf(i[0].toLowerCase());
        },
      },
      "!starts": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.string.notStartsWith",
            i.conditions.string.notStartsWith
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return 0 !== t.toLowerCase().indexOf(i[0].toLowerCase());
        },
      },
      contains: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.string.contains",
            i.conditions.string.contains
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return t.toLowerCase().includes(i[0].toLowerCase());
        },
      },
      "!contains": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.string.notContains",
            i.conditions.string.notContains
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return !t.toLowerCase().includes(i[0].toLowerCase());
        },
      },
      ends: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.string.endsWith",
            i.conditions.string.endsWith
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return t.toLowerCase().endsWith(i[0].toLowerCase());
        },
      },
      "!ends": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.string.notEndsWith",
            i.conditions.string.notEndsWith
          );
        },
        init: b.initInput,
        inputValue: b.inputValueInput,
        isInputValid: b.isInputValidInput,
        search: function (t, i) {
          return !t.toLowerCase().endsWith(i[0].toLowerCase());
        },
      },
      null: {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.string.empty",
            i.conditions.string.empty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return null == t || 0 === t.length;
        },
      },
      "!null": {
        conditionName: function (t, i) {
          return t.i18n(
            "searchBuilder.conditions.string.notEmpty",
            i.conditions.string.notEmpty
          );
        },
        init: b.initNoValue,
        inputValue: function () {},
        isInputValid: function () {
          return !0;
        },
        search: function (t) {
          return !(null == t || 0 === t.length);
        },
      },
    }),
    (b.defaults = {
      columns: !0,
      conditions: {
        array: (b.arrayConditions = {
          contains: {
            conditionName: function (t, i) {
              return t.i18n(
                "searchBuilder.conditions.array.contains",
                i.conditions.array.contains
              );
            },
            init: b.initSelectArray,
            inputValue: b.inputValueSelect,
            isInputValid: b.isInputValidSelect,
            search: function (t, i) {
              return t.includes(i[0]);
            },
          },
          without: {
            conditionName: function (t, i) {
              return t.i18n(
                "searchBuilder.conditions.array.without",
                i.conditions.array.without
              );
            },
            init: b.initSelectArray,
            inputValue: b.inputValueSelect,
            isInputValid: b.isInputValidSelect,
            search: function (t, i) {
              return -1 === t.indexOf(i[0]);
            },
          },
          "=": {
            conditionName: function (t, i) {
              return t.i18n(
                "searchBuilder.conditions.array.equals",
                i.conditions.array.equals
              );
            },
            init: b.initSelect,
            inputValue: b.inputValueSelect,
            isInputValid: b.isInputValidSelect,
            search: function (t, i) {
              if (t.length !== i[0].length) return !1;
              for (var e = 0; e < t.length; e++)
                if (t[e] !== i[0][e]) return !1;
              return !0;
            },
          },
          "!=": {
            conditionName: function (t, i) {
              return t.i18n(
                "searchBuilder.conditions.array.not",
                i.conditions.array.not
              );
            },
            init: b.initSelect,
            inputValue: b.inputValueSelect,
            isInputValid: b.isInputValidSelect,
            search: function (t, i) {
              if (t.length !== i[0].length) return !0;
              for (var e = 0; e < t.length; e++)
                if (t[e] !== i[0][e]) return !0;
              return !1;
            },
          },
          null: {
            conditionName: function (t, i) {
              return t.i18n(
                "searchBuilder.conditions.array.empty",
                i.conditions.array.empty
              );
            },
            init: b.initNoValue,
            inputValue: function () {},
            isInputValid: function () {
              return !0;
            },
            search: function (t) {
              return null == t || 0 === t.length;
            },
          },
          "!null": {
            conditionName: function (t, i) {
              return t.i18n(
                "searchBuilder.conditions.array.notEmpty",
                i.conditions.array.notEmpty
              );
            },
            init: b.initNoValue,
            inputValue: function () {},
            isInputValid: function () {
              return !0;
            },
            search: function (t) {
              return null != t && 0 !== t.length;
            },
          },
        }),
        date: b.dateConditions,
        html: b.stringConditions,
        "html-num": b.numConditions,
        "html-num-fmt": b.numFmtConditions,
        luxon: b.luxonDateConditions,
        moment: b.momentDateConditions,
        num: b.numConditions,
        "num-fmt": b.numFmtConditions,
        string: b.stringConditions,
      },
      depthLimit: !1,
      enterSearch: !1,
      filterChanged: void 0,
      greyscale: !1,
      i18n: {
        add: "Add Condition",
        button: { 0: "Search Builder", _: "Search Builder (%d)" },
        clearAll: "Clear All",
        condition: "Condition",
        data: "Data",
        delete: "&times",
        deleteTitle: "Delete filtering rule",
        left: "<",
        leftTitle: "Outdent criteria",
        logicAnd: "And",
        logicOr: "Or",
        right: ">",
        rightTitle: "Indent criteria",
        search: "Search",
        title: { 0: "Custom Search Builder", _: "Custom Search Builder (%d)" },
        value: "Value",
        valueJoiner: "and",
      },
      liveSearch: !0,
      logic: "AND",
      orthogonal: { display: "display", search: "filter" },
      preDefined: !1,
    }),
    (c = b),
    (v.prototype.destroy = function () {
      this.dom.add.off(".dtsb"),
        this.dom.logic.off(".dtsb"),
        this.dom.search.off(".dtsb"),
        this.dom.container.trigger("dtsb-destroy").remove(),
        (this.s.criteria = []);
    }),
    (v.prototype.getDetails = function (t) {
      if ((void 0 === t && (t = !1), 0 === this.s.criteria.length)) return {};
      for (
        var i = { criteria: [], logic: this.s.logic },
          e = 0,
          n = this.s.criteria;
        e < n.length;
        e++
      )
        i.criteria.push(n[e].criteria.getDetails(t));
      return i;
    }),
    (v.prototype.getNode = function () {
      return this.dom.container;
    }),
    (v.prototype.rebuild = function (t) {
      if (
        !(
          null == t.criteria ||
          (Array.isArray(t.criteria) && 0 === t.criteria.length)
        )
      ) {
        if (
          ((this.s.logic = t.logic),
          this.dom.logic
            .children()
            .first()
            .html(
              "OR" === this.s.logic
                ? this.s.dt.i18n("searchBuilder.logicOr", this.c.i18n.logicOr)
                : this.s.dt.i18n("searchBuilder.logicAnd", this.c.i18n.logicAnd)
            ),
          Array.isArray(t.criteria))
        )
          for (var i = 0, e = t.criteria; i < e.length; i++)
            void 0 !== (t = e[i]).logic
              ? this._addPrevGroup(t)
              : void 0 === t.logic && this._addPrevCriteria(t);
        for (i = 0, e = this.s.criteria; i < e.length; i++)
          (t = e[i]).criteria instanceof c &&
            (t.criteria.updateArrows(1 < this.s.criteria.length),
            this._setCriteriaListeners(t.criteria));
      }
    }),
    (v.prototype.redrawContents = function () {
      if (!this.s.preventRedraw) {
        this.dom.container.children().detach(),
          this.dom.container
            .append(this.dom.logicContainer)
            .append(this.dom.add),
          this.c.liveSearch || this.dom.container.append(this.dom.search),
          this.s.criteria.sort(function (t, i) {
            return t.criteria.s.index < i.criteria.s.index
              ? -1
              : t.criteria.s.index > i.criteria.s.index
              ? 1
              : 0;
          }),
          this.setListeners();
        for (var t = 0; t < this.s.criteria.length; t++) {
          var i = this.s.criteria[t].criteria;
          i instanceof c
            ? ((this.s.criteria[t].index = t),
              (this.s.criteria[t].criteria.s.index = t),
              this.s.criteria[t].criteria.dom.container.insertBefore(
                this.dom.add
              ),
              this._setCriteriaListeners(i),
              (this.s.criteria[t].criteria.s.preventRedraw =
                this.s.preventRedraw),
              this.s.criteria[t].criteria.rebuild(
                this.s.criteria[t].criteria.getDetails()
              ),
              (this.s.criteria[t].criteria.s.preventRedraw = !1))
            : i instanceof v && 0 < i.s.criteria.length
            ? ((this.s.criteria[t].index = t),
              (this.s.criteria[t].criteria.s.index = t),
              this.s.criteria[t].criteria.dom.container.insertBefore(
                this.dom.add
              ),
              (i.s.preventRedraw = this.s.preventRedraw),
              i.redrawContents(),
              (i.s.preventRedraw = !1),
              this._setGroupListeners(i))
            : (this.s.criteria.splice(t, 1), t--);
        }
        this.setupLogic();
      }
    }),
    (v.prototype.redrawLogic = function () {
      for (var t = 0, i = this.s.criteria; t < i.length; t++) {
        var e = i[t];
        e.criteria instanceof v && e.criteria.redrawLogic();
      }
      this.setupLogic();
    }),
    (v.prototype.search = function (t, i) {
      return "AND" === this.s.logic
        ? this._andSearch(t, i)
        : "OR" !== this.s.logic || this._orSearch(t, i);
    }),
    (v.prototype.setupLogic = function () {
      if (
        (this.dom.logicContainer.remove(),
        this.dom.clear.remove(),
        this.s.criteria.length < 1)
      )
        this.s.isChild ||
          (this.dom.container.trigger("dtsb-destroy"),
          this.dom.container.css("margin-left", 0)),
          this.dom.search.css("display", "none");
      else {
        this.dom.clear.height("0px"),
          this.dom.logicContainer.append(this.dom.clear),
          this.s.isChild || this.dom.search.css("display", "inline-block"),
          this.dom.container.prepend(this.dom.logicContainer);
        for (var t = 0, i = this.s.criteria; t < i.length; t++) {
          var e = i[t];
          e.criteria instanceof c && e.criteria.setupButtons();
        }
        (t = this.dom.container.outerHeight() - 1),
          this.dom.logicContainer.width(t),
          this._setLogicListener(),
          this.dom.container.css(
            "margin-left",
            this.dom.logicContainer.outerHeight(!0)
          ),
          (i =
            (i = (t = this.dom.logicContainer.offset()).left) -
            (i - (e = this.dom.container.offset().left)) -
            this.dom.logicContainer.outerHeight(!0)),
          this.dom.logicContainer.offset({ left: i }),
          (i = this.dom.logicContainer.next()),
          (t = t.top),
          (i = a(i).offset().top),
          this.dom.logicContainer.offset({ top: t - (t - i) }),
          this.dom.clear.outerHeight(this.dom.logicContainer.height()),
          this._setClearListener();
      }
    }),
    (v.prototype.setListeners = function () {
      var t = this;
      this.dom.add.unbind("click"),
        this.dom.add.on("click.dtsb", function () {
          return (
            t.s.isChild || t.dom.container.prepend(t.dom.logicContainer),
            t.addCriteria(),
            t.dom.container.trigger("dtsb-add"),
            t.s.dt.state.save(),
            !1
          );
        }),
        this.dom.search.off("click.dtsb").on("click.dtsb", function () {
          t.s.dt.draw();
        });
      for (var i = 0, e = this.s.criteria; i < e.length; i++)
        e[i].criteria.setListeners();
      this._setClearListener(), this._setLogicListener();
    }),
    (v.prototype.addCriteria = function (t) {
      var i =
          null === (t = void 0 === t ? null : t)
            ? this.s.criteria.length
            : t.s.index,
        e = new c(
          this.s.dt,
          this.s.opts,
          this.s.topGroup,
          i,
          this.s.depth,
          this.s.serverData,
          this.c.liveSearch
        );
      null !== t &&
        ((e.c = t.c),
        (e.s = t.s),
        (e.s.depth = this.s.depth),
        (e.classes = t.classes)),
        e.populate(),
        (t = !1);
      for (var n = 0; n < this.s.criteria.length; n++)
        0 === n && this.s.criteria[n].criteria.s.index > e.s.index
          ? (e
              .getNode()
              .insertBefore(this.s.criteria[n].criteria.dom.container),
            (t = !0))
          : n < this.s.criteria.length - 1 &&
            this.s.criteria[n].criteria.s.index < e.s.index &&
            this.s.criteria[n + 1].criteria.s.index > e.s.index &&
            (e.getNode().insertAfter(this.s.criteria[n].criteria.dom.container),
            (t = !0));
      for (
        t || e.getNode().insertBefore(this.dom.add),
          this.s.criteria.push({ criteria: e, index: i }),
          this.s.criteria = this.s.criteria.sort(function (t, i) {
            return t.criteria.s.index - i.criteria.s.index;
          }),
          i = 0,
          t = this.s.criteria;
        i < t.length;
        i++
      )
        (n = t[i]).criteria instanceof c &&
          n.criteria.updateArrows(1 < this.s.criteria.length);
      this._setCriteriaListeners(e), e.setListeners(), this.setupLogic();
    }),
    (v.prototype.checkFilled = function () {
      for (var t = 0, i = this.s.criteria; t < i.length; t++) {
        var e = i[t];
        if (
          (e.criteria instanceof c && e.criteria.s.filled) ||
          (e.criteria instanceof v && e.criteria.checkFilled())
        )
          return !0;
      }
      return !1;
    }),
    (v.prototype.count = function () {
      for (var t = 0, i = 0, e = this.s.criteria; i < e.length; i++) {
        var n = e[i];
        n.criteria instanceof v ? (t += n.criteria.count()) : t++;
      }
      return t;
    }),
    (v.prototype._addPrevGroup = function (t) {
      var i = this.s.criteria.length,
        e = new v(
          this.s.dt,
          this.c,
          this.s.topGroup,
          i,
          !0,
          this.s.depth + 1,
          this.s.serverData
        );
      this.s.criteria.push({ criteria: e, index: i, logic: e.s.logic }),
        e.rebuild(t),
        (this.s.criteria[i].criteria = e),
        this.s.topGroup.trigger("dtsb-redrawContents"),
        this._setGroupListeners(e);
    }),
    (v.prototype._addPrevCriteria = function (t) {
      var i = this.s.criteria.length,
        e = new c(
          this.s.dt,
          this.s.opts,
          this.s.topGroup,
          i,
          this.s.depth,
          this.s.serverData
        );
      e.populate(),
        this.s.criteria.push({ criteria: e, index: i }),
        (e.s.preventRedraw = this.s.preventRedraw),
        e.rebuild(t),
        (e.s.preventRedraw = !1),
        (this.s.criteria[i].criteria = e),
        this.s.preventRedraw || this.s.topGroup.trigger("dtsb-redrawContents");
    }),
    (v.prototype._andSearch = function (t, i) {
      if (0 !== this.s.criteria.length)
        for (var e = 0, n = this.s.criteria; e < n.length; e++) {
          var s = n[e];
          if (
            !(
              (s.criteria instanceof c && !s.criteria.s.filled) ||
              s.criteria.search(t, i)
            )
          )
            return !1;
        }
      return !0;
    }),
    (v.prototype._orSearch = function (t, i) {
      if (0 === this.s.criteria.length) return !0;
      for (var e = !1, n = 0, s = this.s.criteria; n < s.length; n++) {
        var o = s[n];
        if (o.criteria instanceof c && o.criteria.s.filled) {
          if (((e = !0), o.criteria.search(t, i))) return !0;
        } else if (
          o.criteria instanceof v &&
          o.criteria.checkFilled() &&
          ((e = !0), o.criteria.search(t, i))
        )
          return !0;
      }
      return !e;
    }),
    (v.prototype._removeCriteria = function (t, i) {
      if (
        (void 0 === i && (i = !1),
        this.s.criteria.length <= 1 && this.s.isChild)
      )
        this.destroy();
      else {
        for (var e = void 0, n = 0; n < this.s.criteria.length; n++)
          this.s.criteria[n].index === t.s.index &&
            (!i || this.s.criteria[n].criteria instanceof v) &&
            (e = n);
        for (
          void 0 !== e && this.s.criteria.splice(e, 1), n = 0;
          n < this.s.criteria.length;
          n++
        )
          (this.s.criteria[n].index = n),
            (this.s.criteria[n].criteria.s.index = n);
      }
    }),
    (v.prototype._setCriteriaListeners = function (n) {
      var s = this;
      n.dom.delete.unbind("click").on("click.dtsb", function () {
        s._removeCriteria(n), n.dom.container.remove();
        for (var t = 0, i = s.s.criteria; t < i.length; t++) {
          var e = i[t];
          e.criteria instanceof c &&
            e.criteria.updateArrows(1 < s.s.criteria.length);
        }
        return (
          n.destroy(),
          s.s.dt.draw(),
          s.s.topGroup.trigger("dtsb-redrawContents"),
          !1
        );
      }),
        n.dom.right.unbind("click").on("click.dtsb", function () {
          var t = n.s.index,
            i = new v(
              s.s.dt,
              s.s.opts,
              s.s.topGroup,
              n.s.index,
              !0,
              s.s.depth + 1,
              s.s.serverData
            );
          return (
            i.addCriteria(n),
            (s.s.criteria[t].criteria = i),
            (s.s.criteria[t].logic = "AND"),
            s.s.topGroup.trigger("dtsb-redrawContents"),
            s._setGroupListeners(i),
            !1
          );
        }),
        n.dom.left.unbind("click").on("click.dtsb", function () {
          (s.s.toDrop = new c(
            s.s.dt,
            s.s.opts,
            s.s.topGroup,
            n.s.index,
            void 0,
            s.s.serverData
          )),
            (s.s.toDrop.s = n.s),
            (s.s.toDrop.c = n.c),
            (s.s.toDrop.classes = n.classes),
            s.s.toDrop.populate();
          var t = s.s.toDrop.s.index;
          return (
            s.dom.container.trigger("dtsb-dropCriteria"),
            (n.s.index = t),
            s._removeCriteria(n),
            s.s.topGroup.trigger("dtsb-redrawContents"),
            s.s.dt.draw(),
            !1
          );
        });
    }),
    (v.prototype._setClearListener = function () {
      var t = this;
      this.dom.clear.unbind("click").on("click.dtsb", function () {
        return (
          t.s.isChild
            ? (t.destroy(), t.s.topGroup.trigger("dtsb-redrawContents"))
            : t.dom.container.trigger("dtsb-clearContents"),
          !1
        );
      });
    }),
    (v.prototype._setGroupListeners = function (i) {
      var e = this;
      i.dom.add.unbind("click").on("click.dtsb", function () {
        return e.setupLogic(), e.dom.container.trigger("dtsb-add"), !1;
      }),
        i.dom.container.unbind("dtsb-add").on("dtsb-add.dtsb", function () {
          return e.setupLogic(), e.dom.container.trigger("dtsb-add"), !1;
        }),
        i.dom.container
          .unbind("dtsb-destroy")
          .on("dtsb-destroy.dtsb", function () {
            return (
              e._removeCriteria(i, !0),
              i.dom.container.remove(),
              e.setupLogic(),
              !1
            );
          }),
        i.dom.container
          .unbind("dtsb-dropCriteria")
          .on("dtsb-dropCriteria.dtsb", function () {
            var t = i.s.toDrop;
            return (
              (t.s.index = i.s.index),
              t.updateArrows(1 < e.s.criteria.length),
              e.addCriteria(t),
              !1
            );
          }),
        i.setListeners();
    }),
    (v.prototype._setup = function () {
      this.setListeners(),
        this.dom.add.html(this.s.dt.i18n("searchBuilder.add", this.c.i18n.add)),
        this.dom.search.html(
          this.s.dt.i18n("searchBuilder.search", this.c.i18n.search)
        ),
        this.dom.logic
          .children()
          .first()
          .html(
            "OR" === this.c.logic
              ? this.s.dt.i18n("searchBuilder.logicOr", this.c.i18n.logicOr)
              : this.s.dt.i18n("searchBuilder.logicAnd", this.c.i18n.logicAnd)
          ),
        (this.s.logic = "OR" === this.c.logic ? "OR" : "AND"),
        this.c.greyscale && this.dom.logic.addClass(this.classes.greyscale),
        this.dom.logicContainer.append(this.dom.logic).append(this.dom.clear),
        this.s.isChild && this.dom.container.append(this.dom.logicContainer),
        this.dom.container.append(this.dom.add),
        this.c.liveSearch || this.dom.container.append(this.dom.search);
    }),
    (v.prototype._setLogicListener = function () {
      var e = this;
      this.dom.logic.unbind("click").on("click.dtsb", function () {
        e._toggleLogic(), e.s.dt.draw();
        for (var t = 0, i = e.s.criteria; t < i.length; t++)
          i[t].criteria.setListeners();
      });
    }),
    (v.prototype._toggleLogic = function () {
      "OR" === this.s.logic
        ? ((this.s.logic = "AND"),
          this.dom.logic
            .children()
            .first()
            .html(
              this.s.dt.i18n("searchBuilder.logicAnd", this.c.i18n.logicAnd)
            ))
        : "AND" === this.s.logic &&
          ((this.s.logic = "OR"),
          this.dom.logic
            .children()
            .first()
            .html(
              this.s.dt.i18n("searchBuilder.logicOr", this.c.i18n.logicOr)
            ));
    }),
    (v.version = "1.1.0"),
    (v.classes = {
      add: "dtsb-add",
      button: "dtsb-button",
      clearGroup: "dtsb-clearGroup",
      greyscale: "dtsb-greyscale",
      group: "dtsb-group",
      inputButton: "dtsb-iptbtn",
      logic: "dtsb-logic",
      logicContainer: "dtsb-logicContainer",
      search: "dtsb-search",
    }),
    (v.defaults = {
      columns: !0,
      conditions: {
        date: c.dateConditions,
        html: c.stringConditions,
        "html-num": c.numConditions,
        "html-num-fmt": c.numFmtConditions,
        luxon: c.luxonDateConditions,
        moment: c.momentDateConditions,
        num: c.numConditions,
        "num-fmt": c.numFmtConditions,
        string: c.stringConditions,
      },
      depthLimit: !1,
      enterSearch: !1,
      filterChanged: void 0,
      greyscale: !1,
      liveSearch: !0,
      i18n: {
        add: "Add Condition",
        button: { 0: "Search Builder", _: "Search Builder (%d)" },
        clearAll: "Clear All",
        condition: "Condition",
        data: "Data",
        delete: "&times",
        deleteTitle: "Delete filtering rule",
        left: "<",
        leftTitle: "Outdent criteria",
        logicAnd: "And",
        logicOr: "Or",
        right: ">",
        rightTitle: "Indent criteria",
        search: "Search",
        title: { 0: "Custom Search Builder", _: "Custom Search Builder (%d)" },
        value: "Value",
        valueJoiner: "and",
      },
      logic: "AND",
      orthogonal: { display: "display", search: "filter" },
      preDefined: !1,
    }),
    (h = v),
    (g.prototype.getDetails = function (t) {
      return (
        void 0 === t && (t = !1),
        this.s.topGroup ? this.s.topGroup.getDetails(t) : {}
      );
    }),
    (g.prototype.getNode = function () {
      return this.dom.container;
    }),
    (g.prototype.rebuild = function (t) {
      return (
        this.dom.clearAll.click(),
        null != t &&
          ((this.s.topGroup.s.preventRedraw = !0),
          this.s.topGroup.rebuild(t),
          (this.s.topGroup.s.preventRedraw = !1),
          this._checkClear(),
          this._updateTitle(this.s.topGroup.count()),
          this.s.topGroup.redrawContents(),
          this.s.dt.draw(!1),
          this.s.topGroup.setListeners()),
        this
      );
    }),
    (g.prototype._applyPreDefDefaults = function (t) {
      var e = this;
      void 0 !== t.criteria && void 0 === t.logic && (t.logic = "AND");
      for (var n = this, i = 0, s = t.criteria; i < s.length; i++)
        ((i) => {
          void 0 !== i.criteria
            ? (i = n._applyPreDefDefaults(i))
            : n.s.dt.columns().every(function (t) {
                e.s.dt.settings()[0].aoColumns[t].sTitle === i.data &&
                  (i.dataIdx = t);
              });
        })(s[i]);
      return t;
    }),
    (g.prototype._setUp = function (t) {
      var n = this;
      if (
        (void 0 === t && (t = !0),
        "function" != typeof this.s.dt.column().type &&
          p.Api.registerPlural(
            "columns().types()",
            "column().type()",
            function () {
              return this.iterator(
                "column",
                function (t, i) {
                  return t.aoColumns[i].sType;
                },
                1
              );
            }
          ),
        !u.DateTime)
      ) {
        if (
          void 0 === (i = this.s.dt.columns().types().toArray()) ||
          i.includes(void 0) ||
          i.includes(null)
        )
          for (
            var i = [], e = 0, s = this.s.dt.settings()[0].aoColumns;
            e < s.length;
            e++
          ) {
            var o = s[e];
            i.push(
              void 0 !== o.searchBuilderType ? o.searchBuilderType : o.sType
            );
          }
        for (
          e = this.s.dt.columns().toArray(),
            (void 0 === i || i.includes(void 0) || i.includes(null)) &&
              (r.fn.dataTable.ext.oApi &&
                r.fn.dataTable.ext.oApi._fnColumnTypes(this.s.dt.settings()[0]),
              (i = this.s.dt.columns().types().toArray())),
            s = 0;
          s < e[0].length;
          s++
        )
          if (
            ((o = i[e[0][s]]),
            (!0 === this.c.columns ||
              (Array.isArray(this.c.columns) && this.c.columns.includes(s))) &&
              (o.includes("date") ||
                o.includes("moment") ||
                o.includes("luxon")))
          )
            throw (
              (alert("SearchBuilder Requires DateTime when used with dates."),
              Error("SearchBuilder requires DateTime"))
            );
      }
      (this.s.topGroup = new h(
        this.s.dt,
        this.c,
        void 0,
        void 0,
        void 0,
        void 0,
        this.s.serverData
      )),
        this._setClearListener(),
        this.s.dt.on("stateSaveParams.dtsb", function (t, i, e) {
          (e.searchBuilder = n.getDetails()),
            e.scroller
              ? (e.start = n.s.dt.state().start)
              : (e.page = n.s.dt.page());
        }),
        this.s.dt.on("stateLoadParams.dtsb", function (t, i, e) {
          n.rebuild(e.searchBuilder);
        }),
        this._build(),
        this.s.dt.on("preXhr.dtsb", function (t, i, e) {
          n.s.dt.page.info().serverSide &&
            (e.searchBuilder = n._collapseArray(n.getDetails(!0)));
        }),
        this.s.dt.on("columns-reordered", function () {
          n.rebuild(n.getDetails());
        }),
        t &&
          (null !== (t = this.s.dt.state.loaded()) && void 0 !== t.searchBuilder
            ? (this.s.topGroup.rebuild(t.searchBuilder),
              this.s.topGroup.dom.container.trigger("dtsb-redrawContents"),
              this.s.dt.page.info().serverSide ||
                (t.page
                  ? this.s.dt.page(t.page).draw("page")
                  : this.s.dt.scroller &&
                    t.scroller &&
                    this.s.dt.scroller().scrollToRow(t.scroller.topRow)),
              this.s.topGroup.setListeners())
            : !1 !== this.c.preDefined &&
              ((this.c.preDefined = this._applyPreDefDefaults(
                this.c.preDefined
              )),
              this.rebuild(this.c.preDefined))),
        this._setEmptyListener(),
        this.s.dt.state.save();
    }),
    (g.prototype._collapseArray = function (t) {
      if (void 0 === t.logic)
        void 0 !== t.value &&
          (t.value.sort(function (t, i) {
            return (
              isNaN(+t) || ((t = +t), (i = +i)), t < i ? -1 : i < t ? 1 : 0
            );
          }),
          (t.value1 = t.value[0]),
          (t.value2 = t.value[1]));
      else
        for (var i = 0; i < t.criteria.length; i++)
          t.criteria[i] = this._collapseArray(t.criteria[i]);
      return t;
    }),
    (g.prototype._updateTitle = function (t) {
      this.dom.title.html(
        this.s.dt.i18n("searchBuilder.title", this.c.i18n.title, t)
      );
    }),
    (g.prototype._build = function () {
      var n = this,
        t =
          (this.dom.clearAll.remove(),
          this.dom.container.empty(),
          this.s.topGroup.count()),
        s =
          (this._updateTitle(t),
          this.dom.titleRow.append(this.dom.title),
          this.dom.container.append(this.dom.titleRow),
          (this.dom.topGroup = this.s.topGroup.getNode()),
          this.dom.container.append(this.dom.topGroup),
          this._setRedrawListener(),
          this.s.dt.table(0).node());
      r.fn.dataTable.ext.search.includes(this.s.search) ||
        ((this.s.search = function (t, i, e) {
          return t.nTable !== s || n.s.topGroup.search(i, e);
        }),
        r.fn.dataTable.ext.search.push(this.s.search)),
        this.s.dt.on("destroy.dtsb", function () {
          n.dom.container.remove(), n.dom.clearAll.remove();
          for (
            var t = r.fn.dataTable.ext.search.indexOf(n.s.search);
            -1 !== t;

          )
            r.fn.dataTable.ext.search.splice(t, 1),
              (t = r.fn.dataTable.ext.search.indexOf(n.s.search));
          n.s.dt.off(".dtsb"), r(n.s.dt.table().node()).off(".dtsb");
        });
    }),
    (g.prototype._checkClear = function () {
      0 < this.s.topGroup.s.criteria.length
        ? (this.dom.clearAll.insertAfter(this.dom.title),
          this._setClearListener())
        : this.dom.clearAll.remove();
    }),
    (g.prototype._filterChanged = function (t) {
      var i = this.c.filterChanged;
      "function" == typeof i &&
        i(t, this.s.dt.i18n("searchBuilder.button", this.c.i18n.button, t));
    }),
    (g.prototype._setClearListener = function () {
      var t = this;
      this.dom.clearAll.unbind("click"),
        this.dom.clearAll.on("click.dtsb", function () {
          return (
            (t.s.topGroup = new h(
              t.s.dt,
              t.c,
              void 0,
              void 0,
              void 0,
              void 0,
              t.s.serverData
            )),
            t._build(),
            t.s.dt.draw(),
            t.s.topGroup.setListeners(),
            t.dom.clearAll.remove(),
            t._setEmptyListener(),
            t._filterChanged(0),
            !1
          );
        });
    }),
    (g.prototype._setRedrawListener = function () {
      var i = this;
      this.s.topGroup.dom.container.unbind("dtsb-redrawContents"),
        this.s.topGroup.dom.container.on(
          "dtsb-redrawContents.dtsb",
          function () {
            i._checkClear(),
              i.s.topGroup.redrawContents(),
              i.s.topGroup.setupLogic(),
              i._setEmptyListener();
            var t = i.s.topGroup.count();
            i._updateTitle(t),
              i._filterChanged(t),
              i.s.dt.page.info().serverSide || i.s.dt.draw(),
              i.s.dt.state.save();
          }
        ),
        this.s.topGroup.dom.container.unbind("dtsb-redrawContents-noDraw"),
        this.s.topGroup.dom.container.on(
          "dtsb-redrawContents-noDraw.dtsb",
          function () {
            i._checkClear(),
              (i.s.topGroup.s.preventRedraw = !0),
              i.s.topGroup.redrawContents(),
              (i.s.topGroup.s.preventRedraw = !1),
              i.s.topGroup.setupLogic(),
              i._setEmptyListener();
            var t = i.s.topGroup.count();
            i._updateTitle(t), i._filterChanged(t);
          }
        ),
        this.s.topGroup.dom.container.unbind("dtsb-redrawLogic"),
        this.s.topGroup.dom.container.on("dtsb-redrawLogic.dtsb", function () {
          i.s.topGroup.redrawLogic();
          var t = i.s.topGroup.count();
          i._updateTitle(t), i._filterChanged(t);
        }),
        this.s.topGroup.dom.container.unbind("dtsb-add"),
        this.s.topGroup.dom.container.on("dtsb-add.dtsb", function () {
          var t = i.s.topGroup.count();
          i._updateTitle(t), i._filterChanged(t), i._checkClear();
        }),
        this.s.dt.on(
          "postEdit.dtsb postCreate.dtsb postRemove.dtsb",
          function () {
            i.s.topGroup.redrawContents();
          }
        ),
        this.s.topGroup.dom.container.unbind("dtsb-clearContents"),
        this.s.topGroup.dom.container.on(
          "dtsb-clearContents.dtsb",
          function () {
            i._setUp(!1), i._filterChanged(0), i.s.dt.draw();
          }
        );
    }),
    (g.prototype._setEmptyListener = function () {
      var t = this;
      this.s.topGroup.dom.add.on("click.dtsb", function () {
        t._checkClear();
      }),
        this.s.topGroup.dom.container.on("dtsb-destroy.dtsb", function () {
          t.dom.clearAll.remove();
        });
    }),
    (g.version = "1.8.1"),
    (g.classes = {
      button: "dtsb-button",
      clearAll: "dtsb-clearAll",
      container: "dtsb-searchBuilder",
      inputButton: "dtsb-iptbtn",
      title: "dtsb-title",
      titleRow: "dtsb-titleRow",
    }),
    (g.defaults = {
      columns: !0,
      conditions: {
        date: c.dateConditions,
        html: c.stringConditions,
        "html-num": c.numConditions,
        "html-num-fmt": c.numFmtConditions,
        luxon: c.luxonDateConditions,
        moment: c.momentDateConditions,
        num: c.numConditions,
        "num-fmt": c.numFmtConditions,
        string: c.stringConditions,
      },
      depthLimit: !1,
      enterSearch: !1,
      filterChanged: void 0,
      greyscale: !1,
      liveSearch: !0,
      i18n: {
        add: "Add Condition",
        button: { 0: "Search Builder", _: "Search Builder (%d)" },
        clearAll: "Clear All",
        condition: "Condition",
        conditions: {
          array: {
            contains: "Contains",
            empty: "Empty",
            equals: "Equals",
            not: "Not",
            notEmpty: "Not Empty",
            without: "Without",
          },
          date: {
            after: "After",
            before: "Before",
            between: "Between",
            empty: "Empty",
            equals: "Equals",
            not: "Not",
            notBetween: "Not Between",
            notEmpty: "Not Empty",
          },
          number: {
            between: "Between",
            empty: "Empty",
            equals: "Equals",
            gt: "Greater Than",
            gte: "Greater Than Equal To",
            lt: "Less Than",
            lte: "Less Than Equal To",
            not: "Not",
            notBetween: "Not Between",
            notEmpty: "Not Empty",
          },
          string: {
            contains: "Contains",
            empty: "Empty",
            endsWith: "Ends With",
            equals: "Equals",
            not: "Not",
            notContains: "Does Not Contain",
            notEmpty: "Not Empty",
            notEndsWith: "Does Not End With",
            notStartsWith: "Does Not Start With",
            startsWith: "Starts With",
          },
        },
        data: "Data",
        delete: "&times",
        deleteTitle: "Delete filtering rule",
        left: "<",
        leftTitle: "Outdent criteria",
        logicAnd: "And",
        logicOr: "Or",
        right: ">",
        rightTitle: "Indent criteria",
        search: "Search",
        title: { 0: "Custom Search Builder", _: "Custom Search Builder (%d)" },
        value: "Value",
        valueJoiner: "and",
      },
      logic: "AND",
      orthogonal: { display: "display", search: "filter" },
      preDefined: !1,
    }),
    (e = g),
    (u = (r = s).fn.DataTable),
    (a = s).fn.dataTable,
    (l = (f = s).fn.dataTable),
    (i = s.fn.dataTable),
    (p.SearchBuilder = e),
    (i.SearchBuilder = e),
    (p.Group = h),
    (i.Group = h),
    (p.Criteria = c),
    (i.Criteria = c),
    (i = p.Api.register),
    (p.ext.searchBuilder = { conditions: {} }),
    (p.ext.buttons.searchBuilder = {
      action: function (t, i, e, n) {
        this.popover(n._searchBuilder.getNode(), {
          align: "container",
          span: "container",
        }),
          void 0 !== (t = n._searchBuilder.s.topGroup) &&
            t.dom.container.trigger("dtsb-redrawContents-noDraw"),
          0 === t.s.criteria.length &&
            s(
              "." + s.fn.dataTable.Group.classes.add.replace(/ /g, ".")
            ).click();
      },
      config: {},
      init: function (i, t, e) {
        var n = this,
          s = new p.SearchBuilder(i, e.config);
        i.on("draw", function () {
          var t = s.s.topGroup ? s.s.topGroup.count() : 0;
          n.text(i.i18n("searchBuilder.button", s.c.i18n.button, t));
        }),
          n.text(e.text || i.i18n("searchBuilder.button", s.c.i18n.button, 0)),
          (e._searchBuilder = s);
      },
      text: null,
    }),
    i("searchBuilder.getDetails()", function (t) {
      void 0 === t && (t = !1);
      var i = this.context[0];
      return i._searchBuilder ? i._searchBuilder.getDetails(t) : null;
    }),
    i("searchBuilder.rebuild()", function (t) {
      var i = this.context[0];
      return void 0 === i._searchBuilder
        ? null
        : (i._searchBuilder.rebuild(t), this);
    }),
    i("searchBuilder.container()", function () {
      var t = this.context[0];
      return t._searchBuilder ? t._searchBuilder.getNode() : null;
    }),
    s(t).on("preInit.dt.dtsp", function (t, i) {
      "dt" !== t.namespace ||
        (!i.oInit.searchBuilder && !p.defaults.searchBuilder) ||
        i._searchBuilder ||
        n(i);
    }),
    p.ext.feature.push({ cFeature: "Q", fnInit: n }),
    p.feature && p.feature.register("searchBuilder", n),
    p
  );
});

// dataTables.searchPanes
((e) => {
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
            return (t ||= window), (s ||= a(t)), i(t, s), e(s, t, t.document);
          })
        : (i(window, a), (module.exports = e(a, window, window.document))))
    : e(jQuery, window, document);
})(function (n, i, o) {
  var d,
    r,
    l,
    h,
    c,
    p,
    u,
    a,
    f,
    g,
    m,
    v,
    w,
    P,
    y,
    b,
    _,
    t,
    C,
    S,
    O,
    x,
    A,
    j,
    D,
    T = n.fn.dataTable;
  function N(s, e, t) {
    var a = new (
      (a = n.extend(
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
      )) &&
      (a.cascadePanes || a.viewTotal)
        ? T.SearchPanesST
        : T.SearchPanes
    )(s, a);
    s
      .button(e)
      .text(t.text || s.i18n("searchPanes.collapse", a.c.i18n.collapse, 0)),
      (t._panes = a);
  }
  function e(t, s, e) {
    return (
      void 0 === s && (s = null),
      void 0 === e && (e = !1),
      (t = new D.Api(t)),
      new ((s = s || t.init().searchPanes || D.defaults.searchPanes) &&
      (s.cascadePanes || s.viewTotal)
        ? A
        : x)(t, s, e).getNode()
    );
  }
  function s(t, s, e) {
    var a,
      i = this,
      o =
        (s.cascadePanes && s.viewTotal
          ? (a = O)
          : s.cascadePanes
          ? (a = S)
          : s.viewTotal && (a = C),
        (t = (i = u.call(this, t, s, (e = void 0 === e ? !1 : e), a) || this).s
          .dt).state.loaded());
    return (
      (s = function () {
        return i._initSelectionListeners(
          !0,
          o && o.searchPanes && o.searchPanes.selectionList
            ? o.searchPanes.selectionList
            : i.c.preSelect
        );
      }),
      t.settings()[0]._bInitComplete
        ? s()
        : t.off("init.dtsps").on("init.dtsps", s),
      i
    );
  }
  function B(t, s, e, a) {
    var n = this;
    if (
      (void 0 === e && (e = !1),
      void 0 === a && (a = _),
      !p || !p.versionCheck || !p.versionCheck("1.10.0"))
    )
      throw Error("SearchPane requires DataTables 1.10 or newer");
    if (!p.select) throw Error("SearchPane requires Select");
    var r,
      i = new p.Api(t);
    if (
      ((this.classes = c.extend(!0, {}, B.classes)),
      (this.c = c.extend(!0, {}, B.defaults, s)),
      (this.dom = {
        clearAll: c('<button type="button"/>')
          .addClass(this.classes.clearAll)
          .html(i.i18n("searchPanes.clearMessage", this.c.i18n.clearMessage)),
        collapseAll: c('<button type="button"/>')
          .addClass(this.classes.collapseAll)
          .html(
            i.i18n("searchPanes.collapseMessage", this.c.i18n.collapseMessage)
          ),
        container: c("<div/>")
          .addClass(this.classes.panes)
          .html(i.i18n("searchPanes.loadMessage", this.c.i18n.loadMessage)),
        emptyMessage: c("<div/>").addClass(this.classes.emptyMessage),
        panes: c("<div/>").addClass(this.classes.container),
        showAll: c('<button type="button"/>')
          .addClass(this.classes.showAll)
          .addClass(this.classes.disabledButton)
          .attr("disabled", "true")
          .html(i.i18n("searchPanes.showMessage", this.c.i18n.showMessage)),
        title: c("<div/>").addClass(this.classes.title),
        titleRow: c("<div/>").addClass(this.classes.titleRow),
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
        c(o).on("draw.dt", function (t) {
          n.dom.container.find(t.target).length && n._updateFilterCount();
        }),
        this._getState(),
        this.s.dt.page.info().serverSide &&
          ((r = this.s.dt.settings()[0]),
          this.s.dt.on("preXhr.dtsps", function (t, s, e) {
            if (r === s) {
              for (
                void 0 === e.searchPanes && (e.searchPanes = {}),
                  void 0 === e.searchPanes_null && (e.searchPanes_null = {}),
                  t = 0,
                  s = n.s.selectionList;
                t < s.length;
                t++
              ) {
                var a = s[t],
                  i = n.s.dt.column(a.column).dataSrc();
                void 0 === e.searchPanes[i] && (e.searchPanes[i] = {}),
                  void 0 === e.searchPanes_null[i] &&
                    (e.searchPanes_null[i] = {});
                for (var o = 0; o < a.rows.length; o++)
                  (e.searchPanes[i][o] = a.rows[o]),
                    (e.searchPanes_null[i][o] = null === e.searchPanes[i][o]);
              }
              0 < n.s.selectionList.length && (e.searchPanesLast = i),
                (e.searchPanes_options = {
                  cascade: n.c.cascadePanes,
                  viewCount: n.c.viewCount,
                  viewTotal: n.c.viewTotal,
                });
            }
          })),
        this._setXHR(),
        (i.settings()[0]._searchPanes = this).s.dt.settings()[0]
          ._bInitComplete || e
          ? this._paneDeclare(i, t, s)
          : i.one("preInit.dtsps", function () {
              n._paneDeclare(i, t, s);
            }),
        this
      );
  }
  function L(t, s, e, a, i) {
    return (
      f.call(
        this,
        t,
        j.extend(
          { i18n: { count: "{total}", countFiltered: "{shown} ({total})" } },
          s
        ),
        e,
        a,
        i
      ) || this
    );
  }
  function R(t, s, e, a, i) {
    return (
      m.call(this, t, h.extend({ i18n: { count: "{shown}" } }, s), e, a, i) ||
      this
    );
  }
  function k(t, s, e, a, i) {
    return (
      w.call(
        this,
        t,
        l.extend({ i18n: { countFiltered: "{shown} ({total})" } }, s),
        e,
        a,
        i
      ) || this
    );
  }
  function M(t, s, e, a, i) {
    return y.call(this, t, s, e, a, i) || this;
  }
  function F(t, s, e, a, i) {
    var o = this;
    if (
      (void 0 === i && (i = null),
      !r || !r.versionCheck || !r.versionCheck("1.10.0"))
    )
      throw Error("SearchPane requires DataTables 1.10 or newer");
    if (!r.select) throw Error("SearchPane requires Select");
    (t = new r.Api(t)),
      (this.classes = d.extend(!0, {}, F.classes)),
      (this.c = d.extend(!0, {}, F.defaults, s, i)),
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
        buttonGroup: d("<div/>").addClass(this.classes.buttonGroup),
        clear: d('<button type="button">&#215;</button>')
          .attr("disabled", "true")
          .addClass(this.classes.disabledButton)
          .addClass(this.classes.paneButton)
          .addClass(this.classes.clearButton)
          .html(this.s.dt.i18n("searchPanes.clearPane", this.c.i18n.clearPane)),
        collapseButton: d(
          '<button type="button"><span class="' +
            this.classes.caret +
            '">&#x5e;</span></button>'
        )
          .addClass(this.classes.paneButton)
          .addClass(this.classes.collapseButton),
        container: d("<div/>")
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
        countButton: d('<button type="button"><span></span></button>')
          .addClass(this.classes.paneButton)
          .addClass(this.classes.countButton),
        dtP: d(
          '<table width="100%"><thead><tr><th></th><th></th></tr></thead></table>'
        ),
        lower: d("<div/>")
          .addClass(this.classes.subRow2)
          .addClass(this.classes.narrowButton),
        nameButton: d('<button type="button"><span></span></button>')
          .addClass(this.classes.paneButton)
          .addClass(this.classes.nameButton),
        panesContainer: d(a),
        searchBox: d("<input/>")
          .addClass(this.classes.paneInputButton)
          .addClass(this.classes.search),
        searchButton: d('<button type="button"><span></span></button>')
          .addClass(this.classes.searchIcon)
          .addClass(this.classes.paneButton),
        searchCont: d("<div/>").addClass(this.classes.searchCont),
        searchLabelCont: d("<div/>").addClass(this.classes.searchLabelCont),
        topRow: d("<div/>").addClass(this.classes.topRow),
        upper: d("<div/>")
          .addClass(this.classes.subRow1)
          .addClass(this.classes.narrowSearch),
      }),
      (e = ""),
      this.s.colExists
        ? ((e = d(this.s.dt.column(this.s.index).header()).text()),
          this.dom.dtP.find("th").eq(0).text(e))
        : ((e = this.s.customPaneSettings.header || "Custom Pane"),
          this.dom.dtP.find("th").eq(0).html(e)),
      (this.s.name =
        this.s.colOpts.name ||
        (this.s.customPaneSettings && this.s.customPaneSettings.name
          ? this.s.customPaneSettings.name
          : e));
    var n = this.s.dt.table(0).node();
    return (
      (this.s.searchFunction = function (t, s, e) {
        return (
          0 === o.s.selections.length ||
          t.nTable !== n ||
          ((t = null),
          o.s.colExists &&
            ((t = s[o.s.index]), "filter" !== o.s.colOpts.orthogonal.filter) &&
            (t = o.s.rowData.filterMap.get(e)) instanceof d.fn.dataTable.Api &&
            (t = t.toArray()),
          o._search(t, e))
        );
      }),
      d.fn.dataTable.ext.search.push(this.s.searchFunction),
      this.c.clear &&
        this.dom.clear.on("click.dtsp", function () {
          o.dom.container
            .find("." + o.classes.search.replace(/\s+/g, "."))
            .each(function () {
              d(this).val("").trigger("input");
            }),
            o.clearPane();
        }),
      this.s.dt.on("draw.dtsp", function () {
        return o.adjustTopRow();
      }),
      this.s.dt.on("buttons-action.dtsp", function () {
        return o.adjustTopRow();
      }),
      this.s.dt.on("column-reorder.dtsp", function (t, s, e) {
        o.s.index = e.mapping[o.s.index];
      }),
      this
    );
  }
  return (
    (F.prototype.addRow = function (t, s, e, a, i, o, n) {
      (o ||= this.s.rowData.bins[s] || 0), (n ||= this._getShown(s));
      for (var r, l = 0, d = this.s.indexes; l < d.length; l++) {
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
    (F.prototype.adjustTopRow = function () {
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
      (d(t[0]).width() < 252 || d(a[0]).width() < 252) && 0 !== d(t[0]).width()
        ? (d(t[0]).addClass(this.classes.narrow),
          d(s[0])
            .addClass(this.classes.narrowSub)
            .removeClass(this.classes.narrowSearch),
          d(e[0])
            .addClass(this.classes.narrowSub)
            .removeClass(this.classes.narrowButton))
        : (d(t[0]).removeClass(this.classes.narrow),
          d(s[0])
            .removeClass(this.classes.narrowSub)
            .addClass(this.classes.narrowSearch),
          d(e[0])
            .removeClass(this.classes.narrowSub)
            .addClass(this.classes.narrowButton));
    }),
    (F.prototype.clearData = function () {
      this.s.rowData = {
        arrayFilter: [],
        arrayOriginal: [],
        bins: {},
        binsOriginal: {},
        filterMap: new Map(),
        totalOptions: 0,
      };
    }),
    (F.prototype.clearPane = function () {
      return (
        this.s.dtPane.rows({ selected: !0 }).deselect(),
        this.updateTable(),
        this
      );
    }),
    (F.prototype.collapse = function () {
      var t = this;
      this.s.displayed &&
        (this.c.collapse || !0 === this.s.colOpts.collapse) &&
        !1 !== this.s.colOpts.collapse &&
        (d(this.s.dtPane.table().container()).addClass(this.classes.hidden),
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
    (F.prototype.destroy = function () {
      this.s.dtPane && this.s.dtPane.off(".dtsp"),
        this.s.dt.off(".dtsp"),
        this.dom.clear.off(".dtsp"),
        this.dom.nameButton.off(".dtsp"),
        this.dom.countButton.off(".dtsp"),
        this.dom.searchButton.off(".dtsp"),
        this.dom.collapseButton.off(".dtsp"),
        d(this.s.dt.table().node()).off(".dtsp"),
        this.dom.container.detach();
      for (
        var t = d.fn.dataTable.ext.search.indexOf(this.s.searchFunction);
        -1 !== t;

      )
        d.fn.dataTable.ext.search.splice(t, 1),
          (t = d.fn.dataTable.ext.search.indexOf(this.s.searchFunction));
      this.s.dtPane && this.s.dtPane.destroy(), (this.s.listSet = !1);
    }),
    (F.prototype.emptyMessage = function () {
      var t = this.c.i18n.emptyMessage;
      return (
        this.c.emptyMessage && (t = this.c.emptyMessage),
        !1 !== this.s.colOpts.emptyMessage &&
          null !== this.s.colOpts.emptyMessage &&
          (t = this.s.colOpts.emptyMessage),
        this.s.dt.i18n("searchPanes.emptyMessage", t)
      );
    }),
    (F.prototype.getPaneCount = function () {
      return this.s.dtPane
        ? this.s.dtPane.rows({ selected: !0 }).data().toArray().length
        : 0;
    }),
    (F.prototype.rebuildPane = function (t, s) {
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
          d.fn.dataTable.ext.search.push(this.s.searchFunction)),
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
    (F.prototype.resize = function (t) {
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
    (F.prototype.setListeners = function () {
      var l = this;
      this.s.dtPane &&
        (this.s.dtPane.off("select.dtsp").on("select.dtsp", function () {
          clearTimeout(l.s.deselectTimeout),
            l._updateSelection(!l.s.updating),
            l.dom.clear
              .removeClass(l.classes.disabledButton)
              .removeAttr("disabled");
        }),
        this.s.dtPane.off("deselect.dtsp").on("deselect.dtsp", function () {
          l.s.deselectTimeout = setTimeout(function () {
            l._updateSelection(!0),
              0 === l.s.dtPane.rows({ selected: !0 }).data().toArray().length &&
                l.dom.clear
                  .addClass(l.classes.disabledButton)
                  .attr("disabled", "true");
          }, 50);
        }),
        this.s.firstSet &&
          ((this.s.firstSet = !1),
          this.s.dt.on("stateSaveParams.dtsp", function (t, s, e) {
            if (d.isEmptyObject(e)) l.s.dtPane.state.clear();
            else {
              var a, i, o, n, r;
              for (
                t = [],
                  l.s.dtPane &&
                    ((t = l.s.dtPane
                      .rows({ selected: !0 })
                      .data()
                      .map(function (t) {
                        return null !== t.filter ? t.filter.toString() : null;
                      })
                      .toArray()),
                    (a = l.dom.searchBox.val()),
                    (i = l.s.dtPane.order()),
                    (o = l.s.rowData.binsOriginal),
                    (n = l.s.rowData.arrayOriginal),
                    (r = l.dom.collapseButton.hasClass(l.classes.rotated))),
                  void 0 === e.searchPanes && (e.searchPanes = {}),
                  void 0 === e.searchPanes.panes && (e.searchPanes.panes = []),
                  s = 0;
                s < e.searchPanes.panes.length;
                s++
              )
                e.searchPanes.panes[s].id === l.s.index &&
                  (e.searchPanes.panes.splice(s, 1), s--);
              e.searchPanes.panes.push({
                arrayFilter: n,
                bins: o,
                collapsed: r,
                id: l.s.index,
                order: i,
                searchTerm: a,
                selected: t,
              });
            }
          })),
        this.s.dtPane
          .off("user-select.dtsp")
          .on("user-select.dtsp", function (t, s, e, a, i) {
            i.stopPropagation();
          }),
        this.s.dtPane.off("draw.dtsp").on("draw.dtsp", function () {
          return l.adjustTopRow();
        }),
        this.dom.nameButton.off("click.dtsp").on("click.dtsp", function () {
          var t = l.s.dtPane.order()[0][1];
          l.s.dtPane.order([[0, "asc" === t ? "desc" : "asc"]]).draw(),
            l.s.dt.state.save();
        }),
        this.dom.countButton.off("click.dtsp").on("click.dtsp", function () {
          var t = l.s.dtPane.order()[0][1];
          l.s.dtPane.order([[1, "asc" === t ? "desc" : "asc"]]).draw(),
            l.s.dt.state.save();
        }),
        this.dom.collapseButton
          .off("click.dtsp")
          .on("click.dtsp", function (t) {
            t.stopPropagation(),
              (t = d(l.s.dtPane.table().container())).toggleClass(
                l.classes.hidden
              ),
              l.dom.topRow.toggleClass(l.classes.bordered),
              l.dom.nameButton.toggleClass(l.classes.disabledButton),
              l.dom.countButton.toggleClass(l.classes.disabledButton),
              l.dom.searchButton.toggleClass(l.classes.disabledButton),
              l.dom.collapseButton.toggleClass(l.classes.rotated),
              t.hasClass(l.classes.hidden)
                ? l.dom.topRow.on("click.dtsp", function () {
                    return l.dom.collapseButton.click();
                  })
                : l.dom.topRow.off("click.dtsp"),
              l.s.dt.state.save(),
              l.dom.topRow.trigger("collapse.dtsps");
          }),
        this.dom.clear.off("click.dtsp").on("click.dtsp", function () {
          l.dom.container
            .find("." + l.classes.search.replace(/ /g, "."))
            .each(function () {
              d(this).val("").trigger("input");
            }),
            l.clearPane();
        }),
        this.dom.searchButton.off("click.dtsp").on("click.dtsp", function () {
          return l.dom.searchBox.focus();
        }),
        this.dom.searchBox.off("click.dtsp").on("input.dtsp", function () {
          var t = l.dom.searchBox.val();
          l.s.dtPane.search(t).draw(),
            "string" == typeof t &&
            (0 < t.length ||
              (0 === t.length &&
                0 < l.s.dtPane.rows({ selected: !0 }).data().toArray().length))
              ? l.dom.clear
                  .removeClass(l.classes.disabledButton)
                  .removeAttr("disabled")
              : l.dom.clear
                  .addClass(l.classes.disabledButton)
                  .attr("disabled", "true"),
            l.s.dt.state.save();
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
    (F.prototype._serverPopulate = function (t) {
      t.tableLength
        ? ((this.s.tableLength = t.tableLength),
          (this.s.rowData.totalOptions = this.s.tableLength))
        : (null === this.s.tableLength ||
            this.s.dt.rows()[0].length > this.s.tableLength) &&
          ((this.s.tableLength = this.s.dt.rows()[0].length),
          (this.s.rowData.totalOptions = this.s.tableLength));
      var s = this.s.dt.column(this.s.index).dataSrc();
      if (t.searchPanes.options[s]) {
        var e = 0;
        for (t = t.searchPanes.options[s]; e < t.length; e++)
          (s = t[e]),
            this.s.rowData.arrayFilter.push({
              display: s.label,
              filter: s.value,
              sort: s.label,
              type: s.label,
            }),
            (this.s.rowData.bins[s.value] = s.total);
      }
      (e = Object.keys(this.s.rowData.bins).length),
        (t = this._uniqueRatio(e, this.s.tableLength)),
        !1 === this.s.displayed &&
        ((void 0 === this.s.colOpts.show && null === this.s.colOpts.threshold
          ? t > this.c.threshold
          : t > this.s.colOpts.threshold) ||
          (!0 !== this.s.colOpts.show && e <= 1))
          ? (this.dom.container.addClass(this.classes.hidden),
            (this.s.displayed = !1))
          : ((this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter),
            (this.s.rowData.binsOriginal = this.s.rowData.bins),
            (this.s.displayed = !0));
    }),
    (F.prototype.show = function () {
      this.s.displayed &&
        (this.dom.topRow.removeClass(this.classes.bordered),
        this.dom.nameButton.removeClass(this.classes.disabledButton),
        this.dom.countButton.removeClass(this.classes.disabledButton),
        this.dom.searchButton.removeClass(this.classes.disabledButton),
        this.dom.collapseButton.removeClass(this.classes.rotated),
        d(this.s.dtPane.table().container()).removeClass(this.classes.hidden),
        this.dom.topRow.trigger("collapse.dtsps"));
    }),
    (F.prototype._uniqueRatio = function (t, s) {
      return 0 < s &&
        ((0 < this.s.rowData.totalOptions &&
          !this.s.dt.page.info().serverSide) ||
          (this.s.dt.page.info().serverSide && 0 < this.s.tableLength))
        ? t / this.s.rowData.totalOptions
        : 1;
    }),
    (F.prototype.updateTable = function () {
      var t = this.s.dtPane
        .rows({ selected: !0 })
        .data()
        .toArray()
        .map(function (t) {
          return t.filter;
        });
      (this.s.selections = t), this._searchExtras();
    }),
    (F.prototype._getComparisonRows = function () {
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
        for (var i = 0; i < t.length; i++) {
          var o = t[i],
            n = "" !== o.label ? o.label : this.emptyMessage(),
            r = o.className,
            l = n,
            d = "function" == typeof o.value ? o.value : [],
            h = void 0 !== o.order ? o.order : n,
            c = 0;
          if ("function" == typeof o.value) {
            for (var p = 0; p < e.length; p++)
              o.value.call(this.s.dt, e[p], s[0][p]) && c++;
            "function" != typeof d && d.push(o.filter);
          }
          a.push(this.addRow(l, d, h, n, r, c));
        }
        return a;
      }
    }),
    (F.prototype._getMessage = function (t) {
      return this.s.dt
        .i18n("searchPanes.count", this.c.i18n.count)
        .replace(/{total}/g, t.total);
    }),
    (F.prototype._getShown = function (t) {}),
    (F.prototype._getPaneConfig = function () {
      var a = this,
        t = r.Scroller,
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
                      '<span class="' + a.classes.pill + '">' + e + "</span>"),
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
    (F.prototype._makeSelection = function () {
      this.updateTable(),
        (this.s.updating = !0),
        this.s.dt.draw(),
        (this.s.updating = !1);
    }),
    (F.prototype._populatePaneArray = function (t, s, a, e) {
      void 0 === e && (e = this.s.rowData.bins);
      var i,
        o =
          a.fastData ||
          function (t, s, e) {
            return a.oApi._fnGetCellData(a, t, s, e);
          };
      "string" == typeof this.s.colOpts.orthogonal
        ? ((o = o(t, this.s.index, this.s.colOpts.orthogonal)),
          this.s.rowData.filterMap.set(t, o),
          this._addOption(o, o, o, o, s, e))
        : ("string" ==
            typeof (i =
              null ===
              (i = o(t, this.s.index, this.s.colOpts.orthogonal.search))
                ? ""
                : i) && (i = i.replace(/<[^>]*>/g, "")),
          this.s.rowData.filterMap.set(t, i),
          e[i]
            ? e[i]++
            : ((e[i] = 1),
              this._addOption(
                i,
                o(t, this.s.index, this.s.colOpts.orthogonal.display),
                o(t, this.s.index, this.s.colOpts.orthogonal.sort),
                o(t, this.s.index, this.s.colOpts.orthogonal.type),
                s,
                e
              ))),
        this.s.rowData.totalOptions++;
    }),
    (F.prototype._reloadSelect = function (t) {
      if (void 0 !== t) {
        for (var s = 0; s < t.searchPanes.panes.length; s++)
          if (t.searchPanes.panes[s].id === this.s.index) {
            i = s;
            break;
          }
        if (i) {
          var e = (s = this.s.dtPane)
              .rows({ order: "index" })
              .data()
              .map(function (t) {
                return null !== t.filter ? t.filter.toString() : null;
              })
              .toArray(),
            a = 0;
          for (t = t.searchPanes.panes[i].selected; a < t.length; a++) {
            var i,
              o = -1;
            -1 < (o = null !== (i = t[a]) ? e.indexOf(i.toString()) : o) &&
              ((this.s.serverSelecting = !0),
              s.row(o).select(),
              (this.s.serverSelecting = !1));
          }
        }
      }
    }),
    (F.prototype._updateSelection = function (t) {
      function s(t) {
        T.versionCheck("2")
          ? e.s.dt.processing(t)
          : (t = e.s.dt.settings()[0]).oApi._fnProcessingDisplay(t, !1);
      }
      var e = this;
      s(!0),
        setTimeout(function () {
          (e.s.scrollTop = d(e.s.dtPane.table().node()).parent()[0].scrollTop),
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
    (F.prototype._addOption = function (t, s, e, a, i, o) {
      if (Array.isArray(t) || t instanceof r.Api) {
        if (
          (t instanceof r.Api && ((t = t.toArray()), (s = s.toArray())),
          t.length !== s.length)
        )
          throw Error("display and filter not the same length");
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
    (F.prototype._buildPane = function (t, s, e) {
      var a = this,
        i =
          (void 0 === t && (t = []),
          void 0 === s && (s = null),
          void 0 === e && (e = null),
          (this.s.selections = []),
          this.s.dt.state.loaded());
      if ((this.s.listSet && (i = this.s.dt.state()), this.s.colExists)) {
        var o = -1;
        if (i && i.searchPanes && i.searchPanes.panes)
          for (var n = 0; n < i.searchPanes.panes.length; n++)
            if (i.searchPanes.panes[n].id === this.s.index) {
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
          if (
            (0 === this.s.rowData.arrayFilter.length &&
              ((this.s.rowData.totalOptions = 0),
              this._populatePane(),
              (this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter),
              (this.s.rowData.binsOriginal = this.s.rowData.bins)),
            (o = Object.keys(this.s.rowData.binsOriginal).length),
            (n = this._uniqueRatio(o, this.s.dt.rows()[0].length)),
            !1 === this.s.displayed &&
              ((void 0 === this.s.colOpts.show &&
              null === this.s.colOpts.threshold
                ? n > this.c.threshold
                : n > this.s.colOpts.threshold) ||
                (!0 !== this.s.colOpts.show && o <= 1)))
          )
            return (
              this.dom.container.addClass(this.classes.hidden),
              void (this.s.displayed = !1)
            );
          this.dom.container.addClass(this.classes.show),
            (this.s.displayed = !0);
        }
      } else this.s.displayed = !0;
      if (
        (this._displayPane(),
        this.s.listSet ||
          this.dom.dtP.on("stateLoadParams.dtsp", function (t, s, e) {
            d.isEmptyObject(a.s.dt.state.loaded()) &&
              d.each(e, function (t) {
                delete e[t];
              });
          }),
        null !== e && 0 < this.dom.panesContainer.has(e).length
          ? this.dom.container.insertAfter(e)
          : this.dom.panesContainer.prepend(this.dom.container),
        (e = d.fn.dataTable.ext.errMode),
        (d.fn.dataTable.ext.errMode = "none"),
        this.dom.dtP.on("init.dt", function (t, s) {
          (s = (t = a.dom.dtP.DataTable()).select.style()), t.select.style(s);
        }),
        (this.s.dtPane = this.dom.dtP.DataTable(
          d.extend(
            !0,
            this._getPaneConfig(),
            this.c.dtOpts,
            this.s.colOpts ? this.s.colOpts.dtOpts : {},
            this.s.colOpts.options || !this.s.colExists
              ? {
                  createdRow: function (t, s) {
                    d(t).addClass(s.className);
                  },
                }
              : void 0,
            null !== this.s.customPaneSettings &&
              this.s.customPaneSettings.dtOpts
              ? this.s.customPaneSettings.dtOpts
              : {},
            d.fn.dataTable.versionCheck("2")
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
        (o = "Custom Pane"),
        this.s.customPaneSettings && this.s.customPaneSettings.header
          ? (o = this.s.customPaneSettings.header)
          : this.s.colOpts.header
          ? (o = this.s.colOpts.header)
          : this.s.colExists &&
            (o = d.fn.dataTable.versionCheck("2")
              ? this.s.dt.column(this.s.index).title()
              : this.s.dt.settings()[0].aoColumns[this.s.index].sTitle),
        (o = this._escapeHTML(o)),
        this.dom.searchBox.attr("placeholder", o),
        (d.fn.dataTable.ext.errMode = e),
        this.s.colExists)
      )
        for (o = 0, n = this.s.rowData.arrayFilter.length; o < n; o++)
          if (this.s.dt.page.info().serverSide) {
            e = this.addRow(
              this.s.rowData.arrayFilter[o].display,
              this.s.rowData.arrayFilter[o].filter,
              this.s.rowData.arrayFilter[o].sort,
              this.s.rowData.arrayFilter[o].type
            );
            for (var r = 0, l = this.s.serverSelect; r < l.length; r++)
              l[r].filter === this.s.rowData.arrayFilter[o].filter &&
                ((this.s.serverSelecting = !0),
                e.select(),
                (this.s.serverSelecting = !1));
          } else
            !this.s.dt.page.info().serverSide && this.s.rowData.arrayFilter[o]
              ? this.addRow(
                  this.s.rowData.arrayFilter[o].display,
                  this.s.rowData.arrayFilter[o].filter,
                  this.s.rowData.arrayFilter[o].sort,
                  this.s.rowData.arrayFilter[o].type
                )
              : this.s.dt.page.info().serverSide || this.addRow("", "", "", "");
      for (
        (this.s.colOpts.options ||
          (this.s.customPaneSettings && this.s.customPaneSettings.options)) &&
          this._getComparisonRows(),
          this.s.dtPane.draw(),
          this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop,
          this.adjustTopRow(),
          this.setListeners(),
          this.s.listSet = !0,
          o = 0;
        o < t.length;
        o++
      )
        if ((n = t[o]))
          for (
            r = 0, l = this.s.dtPane.rows().indexes().toArray();
            r < l.length;
            r++
          )
            (e = l[r]),
              this.s.dtPane.row(e).data() &&
                n.filter === this.s.dtPane.row(e).data().filter &&
                (this.s.dt.page.info().serverSide
                  ? ((this.s.serverSelecting = !0),
                    this.s.dtPane.row(e).select(),
                    (this.s.serverSelecting = !1))
                  : this.s.dtPane.row(e).select());
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
                return a.collapse();
              })),
        i && i.searchPanes && i.searchPanes.panes && (!s || 1 === s.draw))
      )
        for (
          this._reloadSelect(i), s = 0, i = i.searchPanes.panes;
          s < i.length;
          s++
        )
          (t = i[s]).id === this.s.index &&
            (t.searchTerm &&
              0 < t.searchTerm.length &&
              this.dom.searchBox.val(t.searchTerm).trigger("input"),
            t.order && this.s.dtPane.order(t.order).draw(),
            t.collapsed ? this.collapse() : this.show());
      return !0;
    }),
    (F.prototype._displayPane = function () {
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
    (F.prototype._escapeHTML = function (t) {
      return t
        .toString()
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&");
    }),
    (F.prototype._getBonusOptions = function () {
      return d.extend(!0, {}, F.defaults, { threshold: null }, this.c || {});
    }),
    (F.prototype._getOptions = function () {
      var t = this.s.dt.settings()[0].aoColumns[this.s.index].searchPanes,
        s = d.extend(
          !0,
          {},
          F.defaults,
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
    (F.prototype._populatePane = function () {
      (this.s.rowData.arrayFilter = []), (this.s.rowData.bins = {});
      var t = this.s.dt.context[0];
      if (!this.s.dt.page.info().serverSide)
        for (
          var s = 0, e = this.s.dt.rows().indexes().toArray();
          s < e.length;
          s++
        )
          this._populatePaneArray(e[s], this.s.rowData.arrayFilter, t);
    }),
    (F.prototype._search = function (t, s) {
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
    (F.prototype._searchContSetup = function () {
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
    (F.prototype._searchExtras = function () {
      var t = this.s.updating,
        s =
          ((this.s.updating = !0),
          this.s.dtPane
            .rows({ selected: !0 })
            .data()
            .pluck("filter")
            .toArray()),
        e = s.indexOf(this.emptyMessage()),
        a = d(this.s.dtPane.table().container());
      -1 < e && (s[e] = ""),
        0 < s.length
          ? a.addClass(this.classes.selected)
          : 0 === s.length && a.removeClass(this.classes.selected),
        (this.s.updating = t);
    }),
    (F.version = "2.1.2"),
    (F.classes = {
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
    (F.defaults = {
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
    (_ = F),
    (
      (i && i.__extends) ||
      ((b = function (t, s) {
        return (b =
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
        b(t, s),
          (t.prototype =
            null === s
              ? Object.create(s)
              : ((e.prototype = s.prototype), new e()));
      })
    )(M, (y = _)),
    (M.prototype._emptyPane = function () {
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
    (M.prototype._serverPopulate = function (t) {
      (this.s.rowData.binsShown = {}),
        (this.s.rowData.arrayFilter = []),
        void 0 !== t.tableLength
          ? ((this.s.tableLength = t.tableLength),
            (this.s.rowData.totalOptions = this.s.tableLength))
          : (null === this.s.tableLength ||
              this.s.dt.rows()[0].length > this.s.tableLength) &&
            ((this.s.tableLength = this.s.dt.rows()[0].length),
            (this.s.rowData.totalOptions = this.s.tableLength));
      var s = this.s.dt.column(this.s.index).dataSrc();
      if (void 0 !== t.searchPanes.options[s]) {
        var e = 0;
        for (t = t.searchPanes.options[s]; e < t.length; e++)
          (s = t[e]),
            this.s.rowData.arrayFilter.push({
              display: s.label,
              filter: s.value,
              shown: +s.count,
              sort: s.label,
              total: +s.total,
              type: s.label,
            }),
            (this.s.rowData.binsShown[s.value] = +s.count),
            (this.s.rowData.bins[s.value] = +s.total);
      }
      if (
        ((e = Object.keys(this.s.rowData.bins).length),
        (t = this._uniqueRatio(e, this.s.tableLength)),
        !this.s.colOpts.show &&
          !1 === this.s.displayed &&
          ((void 0 === this.s.colOpts.show && null === this.s.colOpts.threshold
            ? t > this.c.threshold
            : t > this.s.colOpts.threshold) ||
            (!0 !== this.s.colOpts.show && e <= 1)))
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
          var a = this.s.serverSelect,
            i = this._emptyPane(),
            o = 0,
            n = this.s.rowData.arrayFilter;
          o < n.length;
          o++
        )
          if (((s = n[o]), this._shouldAddRow(s))) {
            t = this.addRow(s.display, s.filter, s.sort, s.type);
            for (var r = 0; r < a.length; r++)
              if ((e = a[r]).filter === s.filter) {
                (this.s.serverSelecting = !0),
                  t.select(),
                  (this.s.serverSelecting = !1),
                  a.splice(r, 1),
                  this.s.selections.push(s.filter);
                break;
              }
          }
        for (o = 0; o < a.length; o++)
          for (
            e = a[o], n = 0, r = this.s.rowData.arrayOriginal;
            n < r.length;
            n++
          )
            (s = r[n]).filter === e.filter &&
              ((t = this.addRow(s.display, s.filter, s.sort, s.type)),
              (this.s.serverSelecting = !0),
              t.select(),
              (this.s.serverSelecting = !1),
              this.s.selections.push(s.filter));
        (this.s.serverSelect = this.s.dtPane
          .rows({ selected: !0 })
          .data()
          .toArray()),
          this.s.dtPane.draw(),
          i();
      }
    }),
    (M.prototype.updateRows = function () {
      if (!this.s.dt.page.info().serverSide) {
        this.s.rowData.binsShown = {};
        for (
          var t = 0,
            s = this.s.dt.rows({ search: "applied" }).indexes().toArray();
          t < s.length;
          t++
        )
          this._updateShown(
            s[t],
            this.s.dt.settings()[0],
            this.s.rowData.binsShown
          );
      }
      for (
        var t = function (e) {
            (e.shown =
              "number" == typeof a.s.rowData.binsShown[e.filter]
                ? a.s.rowData.binsShown[e.filter]
                : 0),
              a.s.dtPane
                .row(function (t, s) {
                  return s && s.index === e.index;
                })
                .data(e);
          },
          a = this,
          s = 0,
          e = this.s.dtPane.rows().data().toArray();
        s < e.length;
        s++
      )
        t(e[s]);
      this.s.dtPane.draw(),
        (this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop);
    }),
    (M.prototype._makeSelection = function () {}),
    (M.prototype._reloadSelect = function () {}),
    (M.prototype._shouldAddRow = function (t) {
      return !0;
    }),
    (M.prototype._updateSelection = function () {
      !this.s.dt.page.info().serverSide ||
        this.s.updating ||
        this.s.serverSelecting ||
        (this.s.serverSelect = this.s.dtPane
          .rows({ selected: !0 })
          .data()
          .toArray());
    }),
    (M.prototype._updateShown = function (t, a, s) {
      void 0 === s && (s = this.s.rowData.binsShown),
        (t = (
          a.fastData ||
          function (t, s, e) {
            return a.oApi._fnGetCellData(a, t, s, e);
          }
        )(
          t,
          this.s.index,
          "string" == typeof this.s.colOpts.orthogonal
            ? this.s.colOpts.orthogonal
            : this.s.colOpts.orthogonal.search
        ));
      function e(t) {
        s[t] ? s[t]++ : (s[t] = 1);
      }
      if (Array.isArray(t)) for (var i = 0; i < t.length; i++) e(t[i]);
      else e(t);
    }),
    (t = M),
    (
      (i && i.__extends) ||
      ((P = function (t, s) {
        return (P =
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
        P(t, s),
          (t.prototype =
            null === s
              ? Object.create(s)
              : ((e.prototype = s.prototype), new e()));
      })
    )(k, (w = t)),
    (k.prototype._getMessage = function (t) {
      var s = this.s.dt.i18n("searchPanes.count", this.c.i18n.count),
        e = this.s.dt.i18n(
          "searchPanes.countFiltered",
          this.c.i18n.countFiltered
        );
      return (this.s.filteringActive ? e : s)
        .replace(/{total}/g, t.total)
        .replace(/{shown}/g, t.shown);
    }),
    (k.prototype._getShown = function (t) {
      return this.s.rowData.binsShown && this.s.rowData.binsShown[t]
        ? this.s.rowData.binsShown[t]
        : 0;
    }),
    (C = k),
    (
      (i && i.__extends) ||
      ((v = function (t, s) {
        return (v =
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
        v(t, s),
          (t.prototype =
            null === s
              ? Object.create(s)
              : ((e.prototype = s.prototype), new e()));
      })
    )(R, (m = t)),
    (R.prototype.updateRows = function () {
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
              for (var o = 0, n = t; o < n.length; o++) {
                var r = n[o];
                if (i.filter === r.filter) {
                  a.select(), t.splice(e, 1), this.s.selections.push(i.filter);
                  break;
                }
              }
        }
      } else {
        if (!this.s.dt.page.info().serverSide)
          for (
            this._activePopulatePane(),
              this.s.rowData.binsShown = {},
              r = 0,
              s = this.s.dt.rows({ search: "applied" }).indexes().toArray();
            r < s.length;
            r++
          )
            this._updateShown(
              s[r],
              this.s.dt.settings()[0],
              this.s.rowData.binsShown
            );
        for (
          this.s.dtPane.rows().remove(), r = 0, s = this.s.rowData.arrayFilter;
          r < s.length;
          r++
        )
          if (0 !== (e = s[r]).shown)
            for (
              a = this.addRow(e.display, e.filter, e.sort, e.type, void 0),
                i = 0;
              i < t.length;
              i++
            )
              if (t[i].filter === e.filter) {
                a.select(), t.splice(i, 1), this.s.selections.push(e.filter);
                break;
              }
        for (s = 0; s < t.length; s++)
          for (
            r = t[s], e = 0, a = this.s.rowData.arrayOriginal;
            e < a.length;
            e++
          )
            (i = a[e]).filter === r.filter &&
              (this.addRow(
                i.display,
                i.filter,
                i.sort,
                i.type,
                void 0
              ).select(),
              this.s.selections.push(i.filter));
      }
      this.s.dtPane.draw(),
        (this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop),
        this.s.dt.page.info().serverSide || this.s.dt.draw(!1);
    }),
    (R.prototype._activePopulatePane = function () {
      (this.s.rowData.arrayFilter = []), (this.s.rowData.bins = {});
      var t = this.s.dt.settings()[0];
      if (!this.s.dt.page.info().serverSide)
        for (
          var s = 0,
            e = this.s.dt.rows({ search: "applied" }).indexes().toArray();
          s < e.length;
          s++
        )
          this._populatePaneArray(e[s], this.s.rowData.arrayFilter, t);
    }),
    (R.prototype._getComparisonRows = function () {
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
        for (var n = 0; n < t.length; n++) {
          var r = t[n],
            l = "" !== r.label ? r.label : this.emptyMessage(),
            d = r.className,
            h = l,
            c = "function" == typeof r.value ? r.value : [],
            p = 0,
            u = l,
            f = 0;
          if ("function" == typeof r.value) {
            for (var g = 0; g < a.length; g++)
              r.value.call(this.s.dt, a[g], s[0][g]) && f++;
            for (g = 0; g < i.length; g++)
              r.value.call(this.s.dt, i[g], e[0][g]) && p++;
            "function" != typeof c && c.push(r.filter);
          }
          o.push(this.addRow(h, c, u, l, d, f, p));
        }
        return o;
      }
    }),
    (R.prototype._getMessage = function (t) {
      return this.s.dt
        .i18n("searchPanes.count", this.c.i18n.count)
        .replace(/{total}/g, t.total)
        .replace(/{shown}/g, t.shown);
    }),
    (R.prototype._getShown = function (t) {
      return this.s.rowData.binsShown && this.s.rowData.binsShown[t]
        ? this.s.rowData.binsShown[t]
        : 0;
    }),
    (R.prototype._shouldAddRow = function (t) {
      return 0 < t.shown;
    }),
    (S = R),
    (
      (i && i.__extends) ||
      ((g = function (t, s) {
        return (g =
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
        g(t, s),
          (t.prototype =
            null === s
              ? Object.create(s)
              : ((e.prototype = s.prototype), new e()));
      })
    )(L, (f = S)),
    (L.prototype._activePopulatePane = function () {
      (this.s.rowData.arrayFilter = []), (this.s.rowData.binsShown = {});
      var t = this.s.dt.settings()[0];
      if (!this.s.dt.page.info().serverSide)
        for (
          var s = 0,
            e = this.s.dt.rows({ search: "applied" }).indexes().toArray();
          s < e.length;
          s++
        )
          this._populatePaneArray(
            e[s],
            this.s.rowData.arrayFilter,
            t,
            this.s.rowData.binsShown
          );
    }),
    (L.prototype._getMessage = function (t) {
      var s = this.s.dt.i18n("searchPanes.count", this.c.i18n.count),
        e = this.s.dt.i18n(
          "searchPanes.countFiltered",
          this.c.i18n.countFiltered
        );
      return (this.s.filteringActive ? e : s)
        .replace(/{total}/g, t.total)
        .replace(/{shown}/g, t.shown);
    }),
    (O = L),
    (B.prototype.clearSelections = function () {
      for (var t, s = 0, e = this.s.panes; s < e.length; s++)
        (t = e[s]).s.dtPane &&
          (t.s.scrollTop = t.s.dtPane.table().node().parentNode.scrollTop);
      this.dom.container
        .find("." + this.classes.search.replace(/\s+/g, "."))
        .each(function () {
          c(this).val("").trigger("input");
        }),
        (this.s.selectionList = []);
      for (var s = [], e = 0, a = this.s.panes; e < a.length; e++)
        (t = a[e]).s.dtPane && s.push(t.clearPane());
      return s;
    }),
    (B.prototype.getNode = function () {
      return this.dom.container;
    }),
    (B.prototype.rebuild = function (t, s) {
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
    (B.prototype.resizePanes = function () {
      if ("auto" === this.c.layout) {
        for (
          var t = c(this.s.dt.searchPanes.container()).width(),
            s = Math.floor(t / this.s.minPaneWidth),
            e = 1,
            a = 0,
            t = [],
            i = 0,
            o = this.s.panes;
          i < o.length;
          i++
        ) {
          var n = o[i];
          n.s.displayed && t.push(n.s.index);
        }
        if (s === (n = t.length)) e = s;
        else
          for (; 1 < s; s--) {
            if (0 === (i = n % s)) {
              (e = s), (a = 0);
              break;
            }
            a < i && ((e = s), (a = i));
          }
        var r = 0 !== a ? t.slice(t.length - a, t.length) : [];
        this.s.panes.forEach(function (t) {
          t.s.displayed &&
            t.resize("columns-" + (r.includes(t.s.index) ? a : e));
        });
      } else
        for (t = 0, s = this.s.panes; t < s.length; t++)
          (n = s[t]).adjustTopRow();
      return this;
    }),
    (B.prototype._initSelectionListeners = function (t) {}),
    (B.prototype._serverTotals = function () {}),
    (B.prototype._setXHR = function () {
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
    (B.prototype._stateLoadListener = function () {
      var n = this,
        r = this.s.dt.settings()[0];
      this.s.dt.on("stateLoadParams.dtsps", function (t, s, e) {
        if (void 0 !== e.searchPanes && s === r) {
          if (
            (n.clearSelections(),
            (n.s.selectionList = e.searchPanes.selectionList || []),
            e.searchPanes.panes)
          )
            for (t = 0, e = e.searchPanes.panes; t < e.length; t++) {
              s = e[t];
              for (var a = 0, i = n.s.panes; a < i.length; a++) {
                var o = i[a];
                s.id === o.s.index &&
                  o.s.dtPane &&
                  (o.dom.searchBox.val(s.searchTerm),
                  o.s.dtPane.order(s.order));
              }
            }
          n._makeSelections(n.s.selectionList);
        }
      });
    }),
    (B.prototype._updateSelection = function () {
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
    (B.prototype._attach = function () {
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
      for (var s = 0, e = this.s.panes; s < e.length; s++)
        this.dom.panes.append(e[s].dom.container);
      this.dom.container
        .text("")
        .removeClass(this.classes.hide)
        .append(this.dom.titleRow)
        .append(this.dom.panes),
        this.s.panes.forEach(function (t) {
          return t.setListeners();
        }),
        0 === c("div." + this.classes.container).length &&
          this.dom.container.prependTo(this.s.dt);
    }),
    (B.prototype._attachMessage = function () {
      try {
        var s = this.s.dt.i18n(
          "searchPanes.emptyPanes",
          this.c.i18n.emptyPanes
        );
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
    (B.prototype._attachPaneContainer = function () {
      for (var t = 0, s = this.s.panes; t < s.length; t++)
        if (!0 === s[t].s.displayed) return void this._attach();
      this._attachMessage();
    }),
    (B.prototype._checkCollapse = function () {
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
    (B.prototype._checkMessage = function () {
      for (var t = 0, s = this.s.panes; t < s.length; t++)
        if (!0 === s[t].s.displayed)
          return (
            this.dom.emptyMessage.detach(),
            void this.dom.titleRow.removeClass(this.classes.hide)
          );
      this._attachMessage();
    }),
    (B.prototype._collapseAll = function () {
      for (var t = 0, s = this.s.panes; t < s.length; t++) s[t].collapse();
    }),
    (B.prototype._findPane = function (t) {
      for (var s = 0, e = this.s.panes; s < e.length; s++) {
        var a = e[s];
        if (t === a.s.name) return a;
      }
    }),
    (B.prototype._getState = function () {
      var t = this.s.dt.state.loaded();
      t &&
        t.searchPanes &&
        t.searchPanes.selectionList &&
        (this.s.selectionList = t.searchPanes.selectionList);
    }),
    (B.prototype._makeSelections = function (t) {
      for (var s = 0; s < t.length; s++) {
        for (
          var e = t[s], a = void 0, i = 0, o = this.s.panes;
          i < o.length;
          i++
        ) {
          var n = o[i];
          if (n.s.index === e.column) {
            a = n;
            break;
          }
        }
        if (a && a.s.dtPane) {
          for (i = 0; i < a.s.dtPane.rows().data().toArray().length; i++)
            e.rows.includes(
              "function" == typeof a.s.dtPane.row(i).data().filter
                ? a.s.dtPane.cell(i, 0).data()
                : a.s.dtPane.row(i).data().filter
            ) && a.s.dtPane.row(i).select();
          a.updateTable();
        }
      }
    }),
    (B.prototype._paneDeclare = function (t, s, e) {
      var a = this;
      t.columns(0 < this.c.columns.length ? this.c.columns : void 0)
        .eq(0)
        .each(function (t) {
          a.s.panes.push(new a.s.paneClass(s, e, t, a.dom.panes));
        });
      for (
        var i = t.columns().eq(0).toArray().length, o = 0;
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
          : p.versionCheck("2")
          ? this.s.dt.settings()[0].aoInitComplete.push(function () {
              return a._startup(t);
            })
          : this.s.dt.settings()[0].aoInitComplete.push({
              fn: function () {
                return a._startup(t);
              },
            });
    }),
    (B.prototype._setCollapseListener = function () {
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
    (B.prototype._showAll = function () {
      for (var t = 0, s = this.s.panes; t < s.length; t++) s[t].show();
    }),
    (B.prototype._startup = function (e) {
      var r = this;
      this._attach(), this.dom.panes.empty();
      for (
        var l = this.s.dt.settings()[0], t = 0, s = this.s.panes;
        t < s.length;
        t++
      ) {
        var a = s[t];
        a.rebuildPane(
          0 < Object.keys(this.s.serverData).length ? this.s.serverData : void 0
        ),
          this.dom.panes.append(a.dom.container);
      }
      "auto" === this.c.layout && this.resizePanes(),
        (t = this.s.dt.state.loaded()),
        !this.s.stateRead &&
          t &&
          this.s.dt.page(t.start / this.s.dt.page.len()).draw("page"),
        (this.s.stateRead = !0),
        this._checkMessage(),
        e.on("preDraw.dtsps", function () {
          r.s.updating ||
            r.s.paging ||
            (r._updateFilterCount(), r._updateSelection()),
            (r.s.paging = !1);
        }),
        c(i).on(
          "resize.dtsps",
          p.util.throttle(function () {
            return r.resizePanes();
          })
        ),
        this.s.dt.on("stateSaveParams.dtsps", function (t, s, e) {
          s === l &&
            (void 0 === e.searchPanes && (e.searchPanes = {}),
            (e.searchPanes.selectionList = r.s.selectionList));
        }),
        this._stateLoadListener(),
        e
          .off("page.dtsps page-nc.dtsps")
          .on("page.dtsps page-nc.dtsps", function (t, s) {
            (r.s.paging = !0), (r.s.pagingST = !0), (r.s.page = r.s.dt.page());
          }),
        this.s.dt.page.info().serverSide
          ? e.off("preXhr.dtsps").on("preXhr.dtsps", function (t, s, e) {
              if (s === l) {
                e.searchPanes || (e.searchPanes = {}),
                  e.searchPanes_null || (e.searchPanes_null = {}),
                  (s = t = 0);
                for (var a = r.s.panes; s < a.length; s++) {
                  var i = a[s],
                    o = r.s.dt.column(i.s.index).dataSrc();
                  if (
                    (e.searchPanes[o] || (e.searchPanes[o] = {}),
                    e.searchPanes_null[o] || (e.searchPanes_null[o] = {}),
                    i.s.dtPane)
                  )
                    for (
                      var i = i.s.dtPane
                          .rows({ selected: !0 })
                          .data()
                          .toArray(),
                        n = 0;
                      n < i.length;
                      n++
                    )
                      (e.searchPanes[o][n] = i[n].filter),
                        (e.searchPanes_null[o][n] = !e.searchPanes[o][n]),
                        t++;
                }
                0 < t &&
                  (t !== r.s.filterCount
                    ? ((e.start = 0), (r.s.page = 0))
                    : (e.start = r.s.page * r.s.dt.page.len()),
                  r.s.dt.page(r.s.page),
                  (r.s.filterCount = t)),
                  0 < r.s.selectionList.length &&
                    (e.searchPanesLast = r.s.dt
                      .column(
                        r.s.selectionList[r.s.selectionList.length - 1].column
                      )
                      .dataSrc()),
                  (e.searchPanes_options = {
                    cascade: r.c.cascadePanes,
                    viewCount: r.c.viewCount,
                    viewTotal: r.c.viewTotal,
                  });
              }
            })
          : e.on("preXhr.dtsps", function () {
              return r.s.panes.forEach(function (t) {
                return t.clearData();
              });
            }),
        this.s.dt.on("xhr.dtsps", function (t, s) {
          var i;
          s.nTable !== r.s.dt.table().node() ||
            r.s.dt.page.info().serverSide ||
            ((i = !1),
            r.s.dt.one("preDraw.dtsps", function () {
              if (!i) {
                var t = r.s.dt.page();
                (i = !0), (r.s.updating = !0), r.dom.panes.empty();
                for (var s = 0, e = r.s.panes; s < e.length; s++) {
                  var a = e[s];
                  a.clearData(),
                    a.rebuildPane(void 0, !0),
                    r.dom.panes.append(a.dom.container);
                }
                r.s.dt.page.info().serverSide || r.s.dt.draw(),
                  (r.s.updating = !1),
                  r._updateSelection(),
                  r._checkMessage(),
                  r.s.dt.one("draw.dtsps", function () {
                    (r.s.updating = !0),
                      r.s.dt.page(t).draw(!1),
                      (r.s.updating = !1);
                  });
              }
            }));
        }),
        (s = this.c.preSelect),
        t &&
          t.searchPanes &&
          t.searchPanes.selectionList &&
          (s = t.searchPanes.selectionList),
        this._makeSelections(s),
        this._updateFilterCount(),
        e.on("destroy.dtsps", function (t, s) {
          if (s === l) {
            for (t = 0, s = r.s.panes; t < s.length; t++) s[t].destroy();
            e.off(".dtsps"),
              r.dom.showAll.off(".dtsps"),
              r.dom.clearAll.off(".dtsps"),
              r.dom.collapseAll.off(".dtsps"),
              c(e.table().node()).off(".dtsps"),
              r.dom.container.detach(),
              r.clearSelections();
          }
        }),
        this.c.collapse && this._setCollapseListener(),
        this.c.clear &&
          this.dom.clearAll.off("click.dtsps").on("click.dtsps", function () {
            return r.clearSelections();
          }),
        (l._searchPanes = this).s.dt.state.save();
    }),
    (B.prototype._updateFilterCount = function () {
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
    (B.version = "2.3.2"),
    (B.classes = {
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
    (B.defaults = {
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
    (x = B),
    (
      (i && i.__extends) ||
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
    )(s, (u = x)),
    (s.prototype._initSelectionListeners = function (t, s) {
      for (
        void 0 === s && (s = []),
          (t = void 0 === t ? !0 : t) && (this.s.selectionList = s),
          t = 0,
          s = this.s.panes;
        t < s.length;
        t++
      ) {
        var e = s[t];
        e.s.displayed &&
          e.s.dtPane
            .off("select.dtsp")
            .on("select.dtsp", this._update(e))
            .off("deselect.dtsp")
            .on("deselect.dtsp", this._updateTimeout(e));
      }
      this.s.dt.off("draw.dtsps").on("draw.dtsps", this._update()),
        this._updateSelectionList();
    }),
    (s.prototype._serverTotals = function () {
      for (var t = 0, s = this.s.panes; t < s.length; t++) {
        var e = s[t];
        if (e.s.colOpts.show) {
          var a = this.s.dt.column(e.s.index).dataSrc(),
            i = !0;
          if (this.s.serverData.searchPanes.options[a])
            for (
              var o = 0, a = this.s.serverData.searchPanes.options[a];
              o < a.length;
              o++
            ) {
              var n = a[o];
              if (n.total !== n.count) {
                i = !1;
                break;
              }
            }
          (e.s.filteringActive = !i), e._serverPopulate(this.s.serverData);
        }
      }
    }),
    (s.prototype._stateLoadListener = function () {
      function t(t, s, e) {
        if (void 0 !== e.searchPanes) {
          if (
            ((n.s.selectionList = e.searchPanes.selectionList || []),
            e.searchPanes.panes)
          )
            for (t = 0, e = e.searchPanes.panes; t < e.length; t++) {
              s = e[t];
              for (var a = 0, i = n.s.panes; a < i.length; a++) {
                var o = i[a];
                s.id === o.s.index &&
                  o.s.dtPane &&
                  (o.dom.searchBox.val(s.searchTerm),
                  o.s.dtPane.order(s.order));
              }
            }
          n._updateSelectionList();
        }
      }
      var n = this;
      this.s.dt.off("stateLoadParams.dtsps", t).on("stateLoadParams.dtsps", t);
    }),
    (s.prototype._updateSelection = function () {}),
    (s.prototype._update = function (t) {
      var s = this;
      return (
        void 0 === t && (t = void 0),
        function () {
          t && clearTimeout(t.s.deselectTimeout), s._updateSelectionList(t);
        }
      );
    }),
    (s.prototype._updateTimeout = function (t) {
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
    (s.prototype._updateSelectionList = function (s) {
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
    (s.prototype._remakeSelections = function () {
      if (((this.s.updating = !0), this.s.dt.page.info().serverSide)) {
        0 < this.s.selectionList.length &&
          (i =
            this.s.panes[
              this.s.selectionList[this.s.selectionList.length - 1].column
            ]);
        for (var t = 0, s = this.s.panes; t < s.length; t++) {
          var e = s[t];
          !e.s.displayed || (i && e.s.index === i.s.index) || e.updateRows();
        }
      } else {
        (i = this.s.selectionList),
          (t = !1),
          this.clearSelections(),
          this.s.dt.draw(!1),
          this.s.dt.rows().toArray()[0].length >
            this.s.dt.rows({ search: "applied" }).toArray()[0].length &&
            (t = !0),
          (this.s.selectionList = i);
        for (var s = 0, a = this.s.panes; s < a.length; s++)
          (i = a[s]).s.displayed && ((i.s.filteringActive = t), i.updateRows());
        for (s = 0, a = this.s.selectionList; s < a.length; s++) {
          for (
            var e = a[s], i = null, o = 0, n = this.s.panes;
            o < n.length;
            o++
          ) {
            var r = n[o];
            if (r.s.index === e.column) {
              i = r;
              break;
            }
          }
          if (i.s.dtPane) {
            for (
              o = i.s.dtPane.rows().indexes().toArray(), n = 0;
              n < e.rows.length;
              n++
            ) {
              for (var r = !1, l = 0, d = o; l < d.length; l++) {
                var h = i.s.dtPane.row(d[l]),
                  c = h.data();
                e.rows[n] === c.filter && (h.select(), (r = !0));
              }
              r || (e.rows.splice(n, 1), n--);
            }
            if (((i.s.selections = e.rows), 0 !== e.rows.length)) {
              for (
                this.s.dt.draw(), l = o = r = n = 0, d = this.s.panes;
                l < d.length;
                l++
              )
                (e = d[l]).s.dtPane &&
                  r < (n += e.getPaneCount()) &&
                  (o++, (r = n));
              for (n = 0 < n, r = 0, l = this.s.panes; r < l.length; r++)
                (e = l[r]).s.displayed &&
                  (t || i.s.index !== e.s.index || !n
                    ? (e.s.filteringActive = n || t)
                    : 1 === o && (e.s.filteringActive = !1),
                  e.s.index !== i.s.index) &&
                  e.updateRows();
            }
          }
        }
        this.s.dt.draw(!1);
      }
      this.s.updating = !1;
    }),
    (A = s),
    (r = (d = n).fn.dataTable),
    (p = (c = n).fn.dataTable),
    (j = h = l = n),
    ((D = n.fn.dataTable).SearchPanes = x),
    (T.SearchPanes = x),
    (D.SearchPanesST = A),
    (T.SearchPanesST = A),
    (T.SearchPane = D.SearchPane = _),
    (T.SearchPaneViewTotal = D.SearchPaneViewTotal = C),
    (T.SearchPaneCascade = D.SearchPaneCascade = S),
    (T.SearchPaneCascadeViewTotal = D.SearchPaneCascadeViewTotal = O),
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
        e(s, null, !0);
    }),
    T.ext.feature.push({ cFeature: "P", fnInit: e }),
    T.feature && T.feature.register("searchPanes", e),
    T
  );
});

// dataTables.select.js
((l) => {
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
            return (e ||= window), (t ||= s(e)), c(e, t), l(t, e, e.document);
          })
        : (c(window, s), (module.exports = l(s, window, window.document))))
    : l(jQuery, window, document);
})(function (m, a, e) {
  function i(n, e, t) {
    function l(t, l) {
      var e,
        s = n.rows({ search: "applied" }).indexes(),
        c = (s.indexOf(t) > s.indexOf(l) && ((e = l), (l = t), (t = e)), !1);
      return s.filter(function (e) {
        return e === t && (c = !0), e === l ? !(c = !1) : c;
      });
    }
    var s = function (t, l) {
      l < t && ((e = l), (l = t), (t = e));
      var e,
        s = !1;
      return n
        .columns(":visible")
        .indexes()
        .filter(function (e) {
          return e === t && (s = !0), e === l ? !(s = !1) : s;
        });
    };
    (t =
      n.cells({ selected: !0 }).any() || t
        ? ((s = s(t.column, e.column)), l(t.row, e.row))
        : ((s = s(0, e.column)), l(0, e.row))),
      (t = n.cells(t, s).flatten()),
      n.cells(e, { selected: !0 }).any()
        ? n.cells(t).deselect()
        : n.cells(t).select();
  }
  function p(e) {
    var t = b.select.classes.checkbox;
    return e ? t.replace(/ /g, ".") : t;
  }
  function o(e) {
    var t = e.settings()[0]._select.selector;
    m(e.table().container())
      .off("mousedown.dtSelect", t)
      .off("mouseup.dtSelect", t)
      .off("click.dtSelect", t),
      m("body").off("click.dtSelect" + w(e.table().node()));
  }
  function r(n) {
    var o,
      t = m(n.table().container()),
      l = n.settings()[0],
      s = l._select.selector;
    t
      .on("mousedown.dtSelect", s, function (e) {
        (e.shiftKey || e.metaKey || e.ctrlKey) &&
          t
            .css("-moz-user-select", "none")
            .one("selectstart.dtSelect", s, function () {
              return !1;
            }),
          a.getSelection && (o = a.getSelection());
      })
      .on("mouseup.dtSelect", s, function () {
        t.css("-moz-user-select", "");
      })
      .on("click.dtSelect", s, function (e) {
        var t = n.select.items();
        if (o) {
          var l = a.getSelection();
          if (
            (!l.anchorNode ||
              m(l.anchorNode).closest("table")[0] === n.table().node()) &&
            l !== o
          )
            return;
        }
        var s,
          l = n.settings()[0],
          c = n.table().container();
        m(e.target).closest("div.dt-container")[0] == c &&
          (c = n.cell(m(e.target).closest("td, th"))).any() &&
          ((s = m.Event("user-select.dt")),
          u(n, s, [t, c, e]),
          s.isDefaultPrevented() ||
            ((s = c.index()),
            "row" === t
              ? ((t = s.row), _(e, n, l, "row", t))
              : "column" === t
              ? ((t = c.index().column), _(e, n, l, "column", t))
              : "cell" === t && ((t = c.index()), _(e, n, l, "cell", t)),
            (l._select_lastCell = s)));
      }),
      m("body").on("click.dtSelect" + w(n.table().node()), function (e) {
        var t;
        !l._select.blurable ||
          m(e.target).parents().filter(n.table().container()).length ||
          0 === m(e.target).parents("html").length ||
          m(e.target).parents("div.DTE").length ||
          ((t = m.Event("select-blur.dt")),
          u(n, t, [e.target, e]),
          t.isDefaultPrevented()) ||
          h(l, !0);
      });
  }
  function u(e, t, l, s) {
    (s && !e.flatten().length) ||
      ("string" == typeof t && (t += ".dt"),
      l.unshift(e),
      m(e.table().node()).trigger(t, l));
  }
  function v(e) {
    return e.mRender && "selectCheckbox" === e.mRender._name;
  }
  function d(s, e) {
    var t, l, c, n, o;
    "api" !== s.select.style() &&
      !1 !== s.select.info() &&
      ((t =
        (t = s.settings()[0]._select_set.length) ||
        s.rows({ selected: !0 }).count()),
      (l = s.columns({ selected: !0 }).count()),
      (c = s.cells({ selected: !0 }).count()),
      (n = function (e, t, l) {
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
      n((o = m('<span class="select-info"/>')), "row", t),
      n(o, "column", l),
      n(o, "cell", c),
      (t = e.children("span.select-info")).length && t.remove(),
      "" !== o.text()) &&
      e.append(o);
  }
  function f(e, t, l, s) {
    var c,
      n = e[t + "s"]({ search: "applied" }).indexes(),
      o = ((s = n.indexOf(s)), n.indexOf(l));
    e[t + "s"]({ selected: !0 }).any() || -1 !== s
      ? (o < s && ((c = o), (o = s), (s = c)),
        n.splice(o + 1, n.length),
        n.splice(0, s))
      : n.splice(n.indexOf(l) + 1, n.length),
      e[t](l, { selected: !0 }).any()
        ? (n.splice(n.indexOf(l), 1), e[t + "s"](n).deselect())
        : e[t + "s"](n).select();
  }
  function h(e, t) {
    (!t && "single" !== e._select.style) ||
      ((e = new b.Api(e)).rows({ selected: !0 }).deselect(),
      e.columns({ selected: !0 }).deselect(),
      e.cells({ selected: !0 }).deselect());
  }
  function _(e, t, l, s, c) {
    var n = t.select.style(),
      o = t.select.toggleable(),
      a = t[s](c, { selected: !0 }).any();
    (a && !o) ||
      ("os" === n
        ? e.ctrlKey || e.metaKey
          ? t[s](c).select(!a)
          : e.shiftKey
          ? "cell" === s
            ? i(t, c, l._select_lastCell || null)
            : f(t, s, c, l._select_lastCell ? l._select_lastCell[s] : null)
          : ((e = t[s + "s"]({ selected: !0 })),
            a && 1 === e.flatten().length
              ? t[s](c).deselect()
              : (e.deselect(), t[s](c).select()))
        : "multi+shift" == n && e.shiftKey
        ? "cell" === s
          ? i(t, c, l._select_lastCell || null)
          : f(t, s, c, l._select_lastCell ? l._select_lastCell[s] : null)
        : t[s](c).select(!a));
  }
  function w(e) {
    return e.id.replace(/[^a-zA-Z0-9\-_]/g, "-");
  }
  function l(t, l) {
    return function (e) {
      return e.i18n("buttons." + t, l);
    };
  }
  function n(e) {
    return (
      "draw.dt.DT" +
      (e = e._eventNamespace) +
      " select.dt.DT" +
      e +
      " deselect.dt.DT" +
      e
    );
  }
  var b = m.fn.dataTable,
    t =
      ((b.select = {}),
      (b.select.classes = { checkbox: "dt-select-checkbox" }),
      (b.select.version = "2.1.0"),
      (b.select.init = function (s) {
        var e,
          t,
          l,
          c,
          n,
          o,
          a,
          i,
          r,
          u,
          d,
          f,
          h,
          _ = s.settings()[0];
        if (!b.versionCheck("2"))
          throw "Warning: Select requires DataTables 2 or newer";
        !_._select &&
          ((e = s.state.loaded()),
          (t = function (e, t, l) {
            if (null !== l && void 0 !== l.select) {
              if (
                (s.rows({ selected: !0 }).any() && s.rows().deselect(),
                void 0 !== l.select.rows && s.rows(l.select.rows).select(),
                s.columns({ selected: !0 }).any() && s.columns().deselect(),
                void 0 !== l.select.columns &&
                  s.columns(l.select.columns).select(),
                s.cells({ selected: !0 }).any() && s.cells().deselect(),
                void 0 !== l.select.cells)
              )
                for (e = 0; e < l.select.cells.length; e++)
                  s.cell(
                    l.select.cells[e].row,
                    l.select.cells[e].column
                  ).select();
              s.state.save();
            }
          }),
          s
            .on("stateSaveParams", function (e, t, l) {
              (l.select = {}),
                (l.select.rows = s.rows({ selected: !0 }).ids(!0).toArray()),
                (l.select.columns = s.columns({ selected: !0 })[0]),
                (l.select.cells = s
                  .cells({ selected: !0 })[0]
                  .map(function (e) {
                    return { row: s.row(e.row).id(!0), column: e.column };
                  }));
            })
            .on("stateLoadParams", t)
            .one("init", function () {
              t(void 0, 0, e);
            }),
          (l = _.oInit.select),
          (c = b.defaults.select),
          (l = void 0 === l ? c : l),
          (c = "row"),
          (a = !(o = !(n = "api"))),
          (u = "td, th"),
          (d = "selected"),
          (h = !(f = r = !(i = null))),
          (_._select = { infoEls: [] }),
          !0 === l
            ? ((n = "os"), (h = !0))
            : "string" == typeof l
            ? ((n = l), (h = !0))
            : m.isPlainObject(l) &&
              (void 0 !== l.blurable && (o = l.blurable),
              void 0 !== l.toggleable && (a = l.toggleable),
              void 0 !== l.info && (r = l.info),
              void 0 !== l.items && (c = l.items),
              (n = void 0 !== l.style ? l.style : "os"),
              (h = !0),
              void 0 !== l.selector && (u = l.selector),
              void 0 !== l.className && (d = l.className),
              void 0 !== l.headerCheckbox && (f = l.headerCheckbox),
              void 0 !== l.selectable) &&
              (i = l.selectable),
          s.select.selector(u),
          s.select.items(c),
          s.select.style(n),
          s.select.blurable(o),
          s.select.toggleable(a),
          s.select.info(r),
          s.select.selectable(i),
          (_._select.className = d),
          !h &&
            m(s.table().node()).hasClass("selectable") &&
            s.select.style("os"),
          f || "select-page" === f || "select-all" === f) &&
          s.ready(function () {
            var r, u, l;
            (u = f),
              (l = (r = s).settings()[0].aoColumns),
              r.columns().iterator("column", function (e, t) {
                var i;
                v(l[t]) &&
                  ((e = r.column(t).header()), !m("input", e).length) &&
                  ((i = m("<input>")
                    .attr({
                      class: p(!0),
                      type: "checkbox",
                      "aria-label":
                        r.i18n("select.aria.headerCheckbox") ||
                        "Select all rows",
                    })
                    .appendTo(e)
                    .on("change", function () {
                      this.checked
                        ? ("select-page" == u
                            ? r.rows({ page: "current" })
                            : r.rows({ search: "applied" })
                          ).select()
                        : ("select-page" == u
                            ? r.rows({ page: "current", selected: !0 })
                            : r.rows({ selected: !0 })
                          ).deselect();
                    })
                    .on("click", function (e) {
                      e.stopPropagation();
                    })),
                  r.on("draw select deselect", function (e, t, l) {
                    if ("row" === l || !l) {
                      (t = (e = r.settings()[0])._select.selectable), (l = 0);
                      var s = (
                          "select-page" == u
                            ? r.rows({ page: "current", selected: !0 })
                            : r.rows({ selected: !0 })
                        ).count(),
                        c = (
                          "select-page" == u
                            ? r.rows({ page: "current", selected: !0 })
                            : r.rows({ search: "applied", selected: !0 })
                        ).count();
                      if (t)
                        for (
                          var n = (
                              "select-page" == u
                                ? r.rows({ page: "current" })
                                : r.rows({ search: "applied" })
                            ).indexes(),
                            o = 0;
                          o < n.length;
                          o++
                        ) {
                          var a = e.aoData[n[o]];
                          t(a._aData, a.nTr, n[o]) && l++;
                        }
                      else
                        l = (
                          "select-page" == u
                            ? r.rows({ page: "current" })
                            : r.rows({ search: "applied" })
                        ).count();
                      c && c <= s && c === l
                        ? i.prop("checked", !0).prop("indeterminate", !1)
                        : 0 === c && 0 === s
                        ? i.prop("checked", !1).prop("indeterminate", !1)
                        : i.prop("checked", !1).prop("indeterminate", !0);
                    }
                  }));
              });
          });
      }),
      m.each(
        [
          { type: "row", prop: "aoData" },
          { type: "column", prop: "aoColumns" },
        ],
        function (e, a) {
          b.ext.selector[a.type].push(function (e, t, l) {
            var s,
              c = [];
            if (!0 !== (t = t.selected) && !1 !== t) return l;
            for (var n = 0, o = l.length; n < o; n++)
              (s = e[a.prop][l[n]]) &&
                ((!0 === t && !0 === s._select_selected) ||
                  (!1 === t && !s._select_selected)) &&
                c.push(l[n]);
            return c;
          });
        }
      ),
      b.ext.selector.cell.push(function (e, t, l) {
        var s,
          c = [];
        if (void 0 === (t = t.selected)) return l;
        for (var n = 0, o = l.length; n < o; n++)
          (s = e.aoData[l[n].row]) &&
            ((!0 === t &&
              s._selected_cells &&
              !0 === s._selected_cells[l[n].column]) ||
              !(
                !1 !== t ||
                (s._selected_cells && s._selected_cells[l[n].column])
              )) &&
            c.push(l[n]);
        return c;
      }),
      b.Api.register),
    s = b.Api.registerPlural,
    g =
      (t("select()", function () {
        return this.iterator("table", function (e) {
          b.select.init(new b.Api(e));
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
              (e._select.items = t), u(new b.Api(e), "selectItems", [t]);
            });
      }),
      t("select.style()", function (l) {
        return void 0 === l
          ? this.context[0]._select.style
          : this.iterator("table", function (e) {
              e._select || b.select.init(new b.Api(e)),
                e._select_init ||
                  ((s = e),
                  (n = new b.Api(s)),
                  (s._select_init = !0),
                  (s._select_set = []),
                  s.aoRowCreatedCallback.push(function (e, t, l) {
                    for (
                      t = s.aoData[l],
                        l = n.row(l).id(),
                        (t._select_selected ||
                          ("undefined" !== l && s._select_set.includes(l))) &&
                          ((t._select_selected = !0),
                          m(e)
                            .addClass(s._select.className)
                            .find("input." + p(!0))
                            .prop("checked", !0)),
                        e = 0,
                        l = s.aoColumns.length;
                      e < l;
                      e++
                    )
                      (s.aoColumns[e]._select_selected ||
                        (t._selected_cells && t._selected_cells[e])) &&
                        m(t.anCells[e]).addClass(s._select.className);
                  }),
                  (c = n).on("select", function (e, t, l, s) {
                    if ("row" === l)
                      for (
                        e = c.settings()[0]._select_set, t = 0;
                        t < s.length;
                        t++
                      )
                        (l = c.row(s[t]).id()) &&
                          "undefined" !== l &&
                          !e.includes(l) &&
                          e.push(l);
                  }),
                  c.on("deselect", function (e, t, l, s) {
                    if ("row" === l)
                      for (
                        e = c.settings()[0]._select_set, t = 0;
                        t < s.length;
                        t++
                      )
                        (l = c.row(s[t]).id()),
                          -1 !== (l = e.indexOf(l)) && e.splice(l, 1);
                  }),
                  n.on("info.dt", function (e, t, l) {
                    t._select.infoEls.includes(l) || t._select.infoEls.push(l),
                      d(n, l);
                  }),
                  n.on("select.dtSelect.dt deselect.dtSelect.dt", function () {
                    s._select.infoEls.forEach(function (e) {
                      d(n, e);
                    }),
                      n.state.save();
                  }),
                  n.on("destroy.dtSelect", function () {
                    m(n.rows({ selected: !0 }).nodes()).removeClass(
                      n.settings()[0]._select.className
                    ),
                      m("input." + p(!0), n.table().header()).remove(),
                      o(n),
                      n.off(".dtSelect"),
                      m("body").off(".dtSelect" + w(n.table().node()));
                  })),
                (e._select.style = l);
              var s,
                c,
                n,
                t = new b.Api(e);
              "api" !== l
                ? t.ready(function () {
                    o(t), r(t);
                  })
                : o(t),
                u(new b.Api(e), "selectStyle", [l]);
            });
      }),
      t("select.selector()", function (s) {
        return void 0 === s
          ? this.context[0]._select.selector
          : this.iterator("table", function (e) {
              var t = new b.Api(e),
                l = e._select.style;
              o(t),
                (e._select.selector = s),
                l && "api" !== l
                  ? t.ready(function () {
                      o(t), r(t);
                    })
                  : o(t);
            });
      }),
      t("select.selectable()", function (e) {
        var t = this.context[0];
        return e ? ((t._select.selectable = e), this) : t._select.selectable;
      }),
      t("select.last()", function (e) {
        var t = this.context[0];
        return e ? ((t._select_lastCell = e), this) : t._select_lastCell;
      }),
      t("select.cumulative()", function () {
        var e = this.context[0];
        return e && e._select_set ? e._select_set : [];
      }),
      s("rows().select()", "row().select()", function (e) {
        var c = this,
          n = [];
        return !1 === e
          ? this.deselect()
          : (this.iterator("row", function (e, t) {
              h(e);
              var l = e.aoData[t],
                s = e.aoColumns;
              if (
                !e._select.selectable ||
                !1 !== e._select.selectable(l._aData, l.nTr, t)
              )
                for (
                  m(l.nTr).addClass(e._select.className),
                    l._select_selected = !0,
                    n.push(t),
                    e = 0;
                  e < s.length;
                  e++
                )
                  null === (t = s[e]).sType && c.columns().types(),
                    v(t) &&
                      ((t = l.anCells) &&
                        t[e] &&
                        m("input." + p(!0), t[e]).prop("checked", !0),
                      null !== l._aSortData) &&
                      (l._aSortData[e] = null);
            }),
            this.iterator("table", function (e) {
              u(c, "select", ["row", n], !0);
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
      s("columns().select()", "column().select()", function (e) {
        var l = this;
        return !1 === e
          ? this.deselect()
          : (this.iterator("column", function (e, t) {
              h(e),
                (e.aoColumns[t]._select_selected = !0),
                (t = new b.Api(e).column(t)),
                m(t.header()).addClass(e._select.className),
                m(t.footer()).addClass(e._select.className),
                t.nodes().to$().addClass(e._select.className);
            }),
            this.iterator("table", function (e, t) {
              u(l, "select", ["column", l[t]], !0);
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
      s("cells().select()", "cell().select()", function (e) {
        var l = this;
        return !1 === e
          ? this.deselect()
          : (this.iterator("cell", function (e, t, l) {
              h(e),
                void 0 === (t = e.aoData[t])._selected_cells &&
                  (t._selected_cells = []),
                (t._selected_cells[l] = !0),
                t.anCells && m(t.anCells[l]).addClass(e._select.className);
            }),
            this.iterator("table", function (e, t) {
              u(l, "select", ["cell", l.cells(l[t]).indexes().toArray()], !0);
            }),
            this);
      }),
      t("cell().selected()", function () {
        var e = this.context[0];
        return !!(
          e &&
          this.length &&
          (e = e.aoData[this[0][0].row]) &&
          e._selected_cells &&
          e._selected_cells[this[0][0].column]
        );
      }),
      s("rows().deselect()", "row().deselect()", function () {
        var c = this;
        return (
          this.iterator("row", function (e, t) {
            t = e.aoData[t];
            var l = e.aoColumns;
            for (
              m(t.nTr).removeClass(e._select.className),
                t._select_selected = !1,
                e._select_lastCell = null,
                e = 0;
              e < l.length;
              e++
            ) {
              var s = l[e];
              null === s.sType && c.columns().types(),
                v(s) &&
                  ((s = t.anCells) &&
                    s[e] &&
                    m("input." + p(!0), t.anCells[e]).prop("checked", !1),
                  null !== t._aSortData) &&
                  (t._aSortData[e] = null);
            }
          }),
          this.iterator("table", function (e, t) {
            u(c, "deselect", ["row", c[t]], !0);
          }),
          this
        );
      }),
      s("columns().deselect()", "column().deselect()", function () {
        var l = this;
        return (
          this.iterator("column", function (s, e) {
            s.aoColumns[e]._select_selected = !1;
            var t = new b.Api(s),
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
            u(l, "deselect", ["column", l[t]], !0);
          }),
          this
        );
      }),
      s("cells().deselect()", "cell().deselect()", function () {
        var l = this;
        return (
          this.iterator("cell", function (e, t, l) {
            void 0 !== (t = e.aoData[t])._selected_cells &&
              (t._selected_cells[l] = !1),
              t.anCells &&
                !e.aoColumns[l]._select_selected &&
                m(t.anCells[l]).removeClass(e._select.className);
          }),
          this.iterator("table", function (e, t) {
            u(l, "deselect", ["cell", l[t]], !0);
          }),
          this
        );
      }),
      0);
  return (
    m.extend(b.ext.buttons, {
      selected: {
        text: l("selected", "Selected"),
        className: "buttons-selected",
        limitTo: ["rows", "columns", "cells"],
        init: function (l, e, s) {
          var c = this;
          (s._eventNamespace = ".select" + g++),
            l.on(n(s), function () {
              var e = c.enable,
                t = !!(
                  (-1 !== s.limitTo.indexOf("rows") &&
                    l.rows({ selected: !0 }).any()) ||
                  (-1 !== s.limitTo.indexOf("columns") &&
                    l.columns({ selected: !0 }).any()) ||
                  (-1 !== s.limitTo.indexOf("cells") &&
                    l.cells({ selected: !0 }).any())
                );
              e.call(c, t);
            }),
            this.disable();
        },
        destroy: function (e, t, l) {
          e.off(l._eventNamespace);
        },
      },
      selectedSingle: {
        text: l("selectedSingle", "Selected single"),
        className: "buttons-selected-single",
        init: function (t, e, l) {
          var s = this;
          (l._eventNamespace = ".select" + g++),
            t.on(n(l), function () {
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
        text: l("selectAll", "Select all"),
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
        text: l("selectNone", "Deselect all"),
        className: "buttons-select-none",
        action: function () {
          h(this.settings()[0], !0);
        },
        init: function (t, e, l) {
          var s = this;
          (l._eventNamespace = ".select" + g++),
            t.on(n(l), function () {
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
        text: l("showSelected", "Show only selected"),
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
      b.ext.buttons["select" + t + "s"] = {
        text: l("select" + t + "s", "Select " + c + "s"),
        className: "buttons-select-" + c + "s",
        action: function () {
          this.select.items(c);
        },
        init: function (e) {
          var s = this;
          this.active(e.select.items() === c),
            e.on("selectItems.dt.DT", function (e, t, l) {
              s.active(l === c);
            });
        },
      };
    }),
    b.type("select-checkbox", {
      className: "dt-select",
      detect: b.versionCheck("2.1")
        ? {
            oneOf: function () {
              return !1;
            },
            allOf: function () {
              return !1;
            },
            init: function (e, t, l) {
              return v(t);
            },
          }
        : function (e) {
            return "select-checkbox" === e && e;
          },
      order: {
        pre: function (e) {
          return "X" === e ? -1 : 0;
        },
      },
    }),
    m.extend(!0, b.defaults.oLanguage, {
      select: { aria: { rowCheckbox: "Select row" } },
    }),
    (b.render.select = function (e, t) {
      var a = e ? b.util.get(e) : null,
        i = t ? b.util.get(t) : null;
      return (
        ((e = function (e, t, l, s) {
          var c = (e = s.settings.aoData[s.row])._select_selected,
            n = s.settings.oLanguage.select.aria.rowCheckbox,
            o = s.settings._select.selectable;
          return "display" === t
            ? o && !1 === o(l, e.nTr, s.row)
              ? ""
              : m("<input>")
                  .attr({
                    "aria-label": n,
                    class: p(),
                    name: i ? i(l) : null,
                    type: "checkbox",
                    value: a ? a(l) : null,
                    checked: c,
                  })
                  .on("input", function (e) {
                    e.preventDefault(),
                      (this.checked = m(this)
                        .closest("tr")
                        .hasClass("selected"));
                  })[0]
            : "type" === t
            ? "select-checkbox"
            : "filter" !== t && c
            ? "X"
            : "";
        })._name = "selectCheckbox"),
        e
      );
    }),
    (b.ext.order["select-checkbox"] = function (t, e) {
      return this.api()
        .column(e, { order: "index" })
        .nodes()
        .map(function (e) {
          return "row" === t._select.items
            ? m(e).parent().hasClass(t._select.className).toString()
            : "cell" === t._select.items &&
                m(e).hasClass(t._select.className).toString();
        });
    }),
    (m.fn.DataTable.select = b.select),
    m(e).on("i18n.dt.dtSelect preInit.dt.dtSelect", function (e, t) {
      "dt" === e.namespace && b.select.init(new b.Api(t));
    }),
    b
  );
});

// jquery.mark.js
((e, t) => {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = t(require("jquery")))
    : "function" == typeof define && define.amd
    ? define(["jquery"], t)
    : (e.Mark = t(e.jQuery));
})(this, function (e) {
  function r(e) {
    return (r =
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
  function o(e, t) {
    if (!(e instanceof t))
      throw new TypeError("Cannot call a class as a function");
  }
  function i(e, t) {
    for (var n = 0; n < t.length; n++) {
      var r = t[n];
      (r.enumerable = r.enumerable || !1),
        (r.configurable = !0),
        "value" in r && (r.writable = !0),
        Object.defineProperty(e, r.key, r);
    }
  }
  function t(e, t, n) {
    t && i(e.prototype, t), n && i(e, n);
  }
  function n() {
    return (n =
      Object.assign ||
      function (e) {
        for (var t = 1; t < arguments.length; t++) {
          var n,
            r = arguments[t];
          for (n in r)
            Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
        }
        return e;
      }).apply(this, arguments);
  }
  e = e && e.hasOwnProperty("default") ? e.default : e;
  t(
    h,
    [
      {
        key: "getContexts",
        value: function () {
          var n = [];
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
              var e =
                0 <
                n.filter(function (e) {
                  return e.contains(t);
                }).length;
              -1 !== n.indexOf(t) || e || n.push(t);
            }),
            n
          );
        },
      },
      {
        key: "getIframeContents",
        value: function (e, t) {
          var n =
            2 < arguments.length && void 0 !== arguments[2]
              ? arguments[2]
              : function () {};
          try {
            var r = e.contentWindow,
              o = r.document;
            if (!r || !o) throw Error("iframe inaccessible");
          } catch (e) {
            n();
          }
          o && t(o);
        },
      },
      {
        key: "isIframeBlank",
        value: function (e) {
          var t = e.getAttribute("src").trim();
          return (
            "about:blank" === e.contentWindow.location.href &&
            "about:blank" !== t &&
            t
          );
        },
      },
      {
        key: "observeIframeLoad",
        value: function (e, t, n) {
          function r() {
            if (!i) {
              (i = !0), clearTimeout(a);
              try {
                o.isIframeBlank(e) ||
                  (e.removeEventListener("load", r),
                  o.getIframeContents(e, t, n));
              } catch (e) {
                n();
              }
            }
          }
          var o = this,
            i = !1,
            a = null;
          e.addEventListener("load", r),
            (a = setTimeout(r, this.iframesTimeout));
        },
      },
      {
        key: "onIframeReady",
        value: function (e, t, n) {
          try {
            "complete" !== e.contentWindow.document.readyState ||
            this.isIframeBlank(e)
              ? this.observeIframeLoad(e, t, n)
              : this.getIframeContents(e, t, n);
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
        value: function (e, n, r) {
          function o() {
            --a <= 0 && t(s);
          }
          var i = this,
            t =
              3 < arguments.length && void 0 !== arguments[3]
                ? arguments[3]
                : function () {},
            a = (e = e.querySelectorAll("iframe")).length,
            s = 0,
            e = Array.prototype.slice.call(e);
          a || o(),
            e.forEach(function (t) {
              h.matches(t, i.exclude)
                ? o()
                : i.onIframeReady(
                    t,
                    function (e) {
                      n(t) && (s++, r(e)), o();
                    },
                    o
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
        value: function (e) {
          return new h(e.querySelector("html"), this.iframes);
        },
      },
      {
        key: "compareNodeIframe",
        value: function (e, t, n) {
          if (e.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING) {
            if (null === t) return !0;
            if (t.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING)
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
            node: (e = (null === t || e.nextNode()) && e.nextNode()),
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
        value: function (t, e, n, r, o) {
          for (
            var i,
              a,
              s,
              c = this,
              u = this.createIterator(e, t, r),
              l = [],
              h = [];
            (s = void 0),
              (s = c.getIteratorNode(u)),
              (a = s.prevNode),
              (i = s.node);

          )
            this.iframes &&
              this.forEachIframe(
                e,
                function (e) {
                  return c.checkIframeFilter(i, a, e, l);
                },
                function (e) {
                  c.createInstanceOnIframe(e).forEachNode(
                    t,
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
            this.iframes && this.handleOpenIframes(l, t, n, r),
            o();
        },
      },
      {
        key: "forEachNode",
        value: function (n, r, o) {
          var i = this,
            a =
              3 < arguments.length && void 0 !== arguments[3]
                ? arguments[3]
                : function () {},
            e = this.getContexts(),
            s = e.length;
          s || a(),
            e.forEach(function (e) {
              function t() {
                i.iterateThroughNodes(n, e, r, o, function () {
                  --s <= 0 && a();
                });
              }
              i.iframes ? i.waitForIframes(e, t) : t();
            });
        },
      },
    ],
    [
      {
        key: "matches",
        value: function (t, e) {
          e = "string" == typeof e ? [e] : e;
          var n,
            r =
              t.matches ||
              t.matchesSelector ||
              t.msMatchesSelector ||
              t.mozMatchesSelector ||
              t.oMatchesSelector ||
              t.webkitMatchesSelector;
          return (
            !!r &&
            ((n = !1),
            e.every(function (e) {
              return !r.call(t, e) || !(n = !0);
            }),
            n)
          );
        },
      },
    ]
  );
  var a = h,
    u =
      (t(l, [
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
                ? t < e
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
            var t,
              n,
              r = this,
              o = this.opt.synonyms,
              i = this.opt.caseSensitive ? "" : "i",
              a =
                this.opt.ignoreJoiners || this.opt.ignorePunctuation.length
                  ? "\0"
                  : "";
            for (t in o)
              o.hasOwnProperty(t) &&
                ((n = Array.isArray(o[t]) ? o[t] : [o[t]]).unshift(t),
                1 <
                  (n = this.sortByLength(n)
                    .map(function (e) {
                      return (
                        "disabled" !== r.opt.wildcards &&
                          (e = r.setupWildcardsRegExp(e)),
                        r.escapeStr(e)
                      );
                    })
                    .filter(function (e) {
                      return "" !== e;
                    })).length) &&
                (e = e.replace(
                  new RegExp(
                    "(".concat(
                      n
                        .map(function (e) {
                          return r.escapeStr(e);
                        })
                        .join("|"),
                      ")"
                    ),
                    "gm".concat(i)
                  ),
                  a +
                    "(".concat(
                      n
                        .map(function (e) {
                          return r.processSynonyms(e);
                        })
                        .join("|"),
                      ")"
                    ) +
                    a
                ));
            return e;
          },
        },
        {
          key: "processSynonyms",
          value: function (e) {
            return (e =
              this.opt.ignoreJoiners || this.opt.ignorePunctuation.length
                ? this.setupIgnoreJoinersRegExp(e)
                : e);
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
              return (
                (t = n.charAt(t + 1)),
                /[(|)\\]/.test(t) || "" === t ? e : e + "\0"
              );
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
              this.opt.ignoreJoiners && t.push("\\u00ad\\u200b\\u200c\\u200d"),
              t.length
                ? e.split(/\u0000+/).join("[".concat(t.join(""), "]*"))
                : e
            );
          },
        },
        {
          key: "createDiacriticsRegExp",
          value: function (n) {
            var r = this.opt.caseSensitive ? "" : "i",
              e = (
                this.opt.caseSensitive
                  ? "aàáảãạăằắẳẵặâầấẩẫậäåāą AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ cçćč CÇĆČ dđď DĐĎ eèéẻẽẹêềếểễệëěēę EÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ iìíỉĩịîïī IÌÍỈĨỊÎÏĪ lł LŁ nñňń NÑŇŃ oòóỏõọôồốổỗộơởỡớờợöøō OÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ rř RŘ sšśșş SŠŚȘŞ tťțţ TŤȚŢ uùúủũụưừứửữựûüůū UÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ yýỳỷỹỵÿ YÝỲỶỸỴŸ zžżź ZŽŻŹ"
                  : "aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ cçćčCÇĆČ dđďDĐĎ eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ iìíỉĩịîïīIÌÍỈĨỊÎÏĪ lłLŁ nñňńNÑŇŃ oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ rřRŘ sšśșşSŠŚȘŞ tťțţTŤȚŢ uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ yýỳỷỹỵÿYÝỲỶỸỴŸ zžżźZŽŻŹ"
              ).split(" "),
              o = [];
            return (
              n.split("").forEach(function (t) {
                e.every(function (e) {
                  if (-1 !== e.indexOf(t)) {
                    if (-1 < o.indexOf(e)) return !1;
                    (n = n.replace(
                      new RegExp("[".concat(e, "]"), "gm".concat(r)),
                      "[".concat(e, "]")
                    )),
                      o.push(e);
                  }
                  return !0;
                });
              }),
              n
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
              o = "";
            switch (
              (("string" == typeof n ? [] : n.limiters).forEach(function (e) {
                o += "|".concat(t.escapeStr(e));
              }),
              r)
            ) {
              default:
                return "()(".concat(e, ")");
              case "complementary":
                return (
                  (o =
                    "\\s" +
                    (o ||
                      this.escapeStr("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~¡¿"))),
                  "()([^".concat(o, "]*").concat(e, "[^").concat(o, "]*)")
                );
              case "exactly":
                return "(^|\\s"
                  .concat(o, ")(")
                  .concat(e, ")(?=$|\\s")
                  .concat(o, ")");
            }
          },
        },
      ]),
      l),
    s =
      (t(c, [
        {
          key: "log",
          value: function (e) {
            var t =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : "debug",
              n = this.opt.log;
            this.opt.debug &&
              "object" === r(n) &&
              "function" == typeof n[t] &&
              n[t]("mark.js: ".concat(e));
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
            var o,
              i,
              a = this;
            return Array.isArray(e) &&
              "[object Object]" === Object.prototype.toString.call(e[0])
              ? ((o = []),
                (i = 0),
                e
                  .sort(function (e, t) {
                    return e.start - t.start;
                  })
                  .forEach(function (e) {
                    var t = a.callNoMatchOnInvalidRanges(e, i),
                      n = t.start,
                      r = t.end;
                    t.valid &&
                      ((e.start = n), (e.length = r - n), o.push(e), (i = r));
                  }),
                o)
              : (this.log("markRanges() will only accept an array of objects"),
                this.opt.noMatch(e),
                []);
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
                  0 < r - t &&
                  0 < r - n
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
            var r = !0,
              o = n.length,
              i = ((t -= o), parseInt(e.start, 10) - t);
            return (
              o < (t = (i = o < i ? o : i) + parseInt(e.length, 10)) &&
                this.log(
                  "End range automatically set to the max value of ".concat(
                    (t = o)
                  )
                ),
              i < 0 || t - i < 0 || o < i || o < t
                ? ((r = !1),
                  this.log("Invalid range: ".concat(JSON.stringify(e))),
                  this.opt.noMatch(e))
                : "" === n.substring(i, t).replace(/\s+/g, "") &&
                  ((r = !1),
                  this.log(
                    "Skipping whitespace only range: " + JSON.stringify(e)
                  ),
                  this.opt.noMatch(e)),
              { start: i, end: t, valid: r }
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
            var r = this.opt.element || "mark";
            return (
              (t = (e = e.splitText(t)).splitText(n - t)),
              (r = document.createElement(r)).setAttribute(
                "data-markjs",
                "true"
              ),
              this.opt.className && r.setAttribute("class", this.opt.className),
              (r.textContent = e.textContent),
              e.parentNode.replaceChild(r, e),
              t
            );
          },
        },
        {
          key: "wrapRangeInMappedTextNode",
          value: function (a, s, c, u, l) {
            var h = this;
            a.nodes.every(function (e, n) {
              if (void 0 === (t = a.nodes[n + 1]) || t.start > s) {
                if (!u(e.node)) return !1;
                var t = s - e.start,
                  r = (e.end < c ? e.end : c) - e.start,
                  o = a.value.substr(0, e.start),
                  i = a.value.substr(r + e.start);
                if (
                  ((e.node = h.wrapRangeInTextNode(e.node, t, r)),
                  (a.value = o + i),
                  a.nodes.forEach(function (e, t) {
                    n <= t &&
                      (0 < a.nodes[t].start &&
                        t !== n &&
                        (a.nodes[t].start -= r),
                      (a.nodes[t].end -= r));
                  }),
                  (c -= r),
                  l(e.node.previousSibling, e.start),
                  !(c > e.end))
                )
                  return !1;
                s = e.end;
              }
              return !0;
            });
          },
        },
        {
          key: "wrapGroups",
          value: function (e, t, n, r) {
            return (
              r((e = this.wrapRangeInTextNode(e, t, t + n)).previousSibling), e
            );
          },
        },
        {
          key: "separateGroups",
          value: function (e, t, n, r, o) {
            n = t.length;
            for (var i = 1; i < n; i++) {
              var a = e.textContent.indexOf(t[i]);
              t[i] &&
                -1 < a &&
                r(t[i], e) &&
                (e = this.wrapGroups(e, a, t[i].length, o));
            }
            return e;
          },
        },
        {
          key: "wrapMatches",
          value: function (o, e, i, a, t) {
            var s = this,
              c = 0 === e ? 0 : e + 1;
            this.getTextNodes(function (e) {
              e.nodes.forEach(function (e) {
                e = e.node;
                for (
                  var t;
                  null !== (t = o.exec(e.textContent)) && "" !== t[c];

                ) {
                  if (s.opt.separateGroups) e = s.separateGroups(e, t, c, i, a);
                  else {
                    if (!i(t[c], e)) continue;
                    var n = t.index;
                    if (0 !== c) for (var r = 1; r < c; r++) n += t[r].length;
                    e = s.wrapGroups(e, n, t[c].length, a);
                  }
                  o.lastIndex = 0;
                }
              }),
                t();
            });
          },
        },
        {
          key: "wrapMatchesAcrossElements",
          value: function (o, e, i, a, s) {
            var c = this,
              u = 0 === e ? 0 : e + 1;
            this.getTextNodes(function (e) {
              for (var t; null !== (t = o.exec(e.value)) && "" !== t[u]; ) {
                var n = t.index;
                if (0 !== u) for (var r = 1; r < u; r++) n += t[r].length;
                c.wrapRangeInMappedTextNode(
                  e,
                  n,
                  n + t[u].length,
                  function (e) {
                    return i(t[u], e);
                  },
                  function (e, t) {
                    (o.lastIndex = t), a(e);
                  }
                );
              }
              s();
            });
          },
        },
        {
          key: "wrapRangeFromIndex",
          value: function (e, s, c, t) {
            var u = this;
            this.getTextNodes(function (i) {
              var a = i.value.length;
              e.forEach(function (t, n) {
                var e = u.checkWhitespaceRanges(t, a, i.value),
                  r = e.start,
                  o = e.end;
                e.valid &&
                  u.wrapRangeInMappedTextNode(
                    i,
                    r,
                    o,
                    function (e) {
                      return s(e, t, i.value.substring(r, o), n);
                    },
                    function (e) {
                      c(e, t);
                    }
                  );
              }),
                t();
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
            var n = this,
              r =
                ((this.opt = t),
                this.log('Searching with expression "'.concat(e, '"')),
                0);
            (t = "wrapMatches"),
              this[
                (t = this.opt.acrossElements ? "wrapMatchesAcrossElements" : t)
              ](
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
            var o = this,
              i = ((this.opt = t), 0),
              a = "wrapMatches",
              s = (e = this.getSeparatedKeywords(
                "string" == typeof e ? [e] : e
              )).keywords,
              c = e.length;
            (e = function e(n) {
              var t = new u(o.opt).create(n),
                r = 0;
              o.log('Searching with expression "'.concat(t, '"')),
                o[a](
                  t,
                  1,
                  function (e, t) {
                    return o.opt.filter(t, n, i, r);
                  },
                  function (e) {
                    r++, i++, o.opt.each(e);
                  },
                  function () {
                    0 === r && o.opt.noMatch(n),
                      s[c - 1] === n ? o.opt.done(i) : e(s[s.indexOf(n) + 1]);
                  }
                );
            }),
              this.opt.acrossElements && (a = "wrapMatchesAcrossElements"),
              0 === c ? this.opt.done(i) : e(s[0]);
          },
        },
        {
          key: "markRanges",
          value: function (e, t) {
            var o = this,
              n = ((this.opt = t), 0);
            (e = this.checkRanges(e)) && e.length
              ? (this.log(
                  "Starting to mark with the following ranges: " +
                    JSON.stringify(e)
                ),
                this.wrapRangeFromIndex(
                  e,
                  function (e, t, n, r) {
                    return o.opt.filter(e, t, n, r);
                  },
                  function (e, t) {
                    n++, o.opt.each(e, t);
                  },
                  function () {
                    o.opt.done(n);
                  }
                ))
              : this.opt.done(n);
          },
        },
        {
          key: "unmark",
          value: function (e) {
            var n = this,
              r = ((this.opt = e), this.opt.element || "*");
            (r += "[data-markjs]"),
              this.opt.className && (r += ".".concat(this.opt.className)),
              this.log('Removal selector "'.concat(r, '"')),
              this.iterator.forEachNode(
                NodeFilter.SHOW_ELEMENT,
                function (e) {
                  n.unwrapMatches(e);
                },
                function (e) {
                  var t = a.matches(e, r);
                  return (
                    (e = n.matchesExclude(e)),
                    !t || e
                      ? NodeFilter.FILTER_REJECT
                      : NodeFilter.FILTER_ACCEPT
                  );
                },
                this.opt.done
              );
          },
        },
        {
          key: "opt",
          set: function (e) {
            this._opt = n(
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
      c);
  function c(e) {
    o(this, c),
      (this.ctx = e),
      (this.ie = !1),
      (-1 < (e = window.navigator.userAgent).indexOf("MSIE") ||
        -1 < e.indexOf("Trident")) &&
        (this.ie = !0);
  }
  function l(e) {
    o(this, l),
      (this.opt = n(
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
        e
      ));
  }
  function h(e) {
    var t = !(1 < arguments.length && void 0 !== arguments[1]) || arguments[1],
      n = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : [],
      r = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : 5e3;
    o(this, h),
      (this.ctx = e),
      (this.iframes = t),
      (this.exclude = n),
      (this.iframesTimeout = r);
  }
  return (
    (e.fn.mark = function (e, t) {
      return new s(this.get()).mark(e, t), this;
    }),
    (e.fn.markRegExp = function (e, t) {
      return new s(this.get()).markRegExp(e, t), this;
    }),
    (e.fn.markRanges = function (e, t) {
      return new s(this.get()).markRanges(e, t), this;
    }),
    (e.fn.unmark = function (e) {
      return new s(this.get()).unmark(e), this;
    }),
    e
  );
});

// datatables.mark.js
((n) => {
  var i, s;
  "function" == typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (t) {
        return n(t, window, document);
      })
    : "object" == typeof exports
    ? ((i = require("jquery")),
      (s = function (t, e) {
        e.fn.dataTable || require("datatables.net")(t, e);
      }),
      "undefined" == typeof window
        ? (module.exports = function (t, e) {
            return (
              (t = t || window), (e = e || i(t)), s(t, e), n(e, 0, t.document)
            );
          })
        : (s(window, i), (module.exports = n(i, window, window.document))))
    : n(jQuery, window, document);
})(function (a, t, e) {
  var i = a.fn.dataTable;
  class s {
    instance;
    options;
    intervalThreshold;
    intervalMs;
    constructor(t, e) {
      if (!a.fn.mark || !a.fn.unmark)
        throw new Error("jquery.mark.js is necessary for datatables.mark.js");
      (this.instance = t),
        (this.options = "object" == typeof e ? e : {}),
        (this.intervalThreshold = 49),
        (this.intervalMs = 300),
        this.initMarkListener();
    }
    initMarkListener() {
      let t = "draw.dt.dth column-visibility.dt.dth column-reorder.dt.dth",
        e = ((t += " responsive-display.dt.dth"), null);
      this.instance.on(t, () => {
        this.instance.rows({ filter: "applied", page: "current" }).nodes()
          .length > this.intervalThreshold
          ? (clearTimeout(e),
            (e = setTimeout(() => {
              this.mark();
            }, this.intervalMs)))
          : this.mark();
      }),
        this.instance.on("destroy", () => {
          this.instance.off(t);
        }),
        this.mark();
    }
    mark() {
      let s = this.instance.search();
      var t = a(this.instance.table().body());
      t.unmark(this.options),
        this.instance.table().rows({ search: "applied" }).data().length &&
          t.mark(s, this.options),
        this.instance
          .columns({ search: "applied", page: "current" })
          .nodes()
          .each((t, e) => {
            let n = this.instance.column(e).search(),
              i = n || s;
            i &&
              t.forEach((t) => {
                a(t).unmark(this.options).mark(i, this.options);
              });
          });
    }
  }
  return (
    a(e).on("init.dt.dth", (e, n) => {
      if ("dt" === e.namespace) {
        e = new i.Api(n);
        let t = !1;
        e.init().mark
          ? (t = e.init().mark)
          : i.defaults.mark && (t = i.defaults.mark),
          t && new s(e, t);
      }
    }),
    i
  );
});

// dataTables.keepConditions.js
class KeepConditions {
  constructor(t) {
    if (!$.fn.DataTable.isDataTable(t) && !t instanceof $.fn.dataTable.Api)
      throw Error(
        "Failed to initialize KeepConditions plugin on non-datatable object"
      );
    (this._dtApi =
      t instanceof $.fn.dataTable.Api ? t : new $.fn.dataTable.Api(t)),
      (this._dtSettings = t = this._dtApi.settings()[0]),
      (this._tableId = $(this._dtApi.table().node()).attr("id")),
      (this._dtDefaults = $.fn.dataTable.defaults),
      (this._keysToCons = this._keyMap()),
      (this._shouldDraw = !1),
      (this._enabledConditions = []),
      (this._eventNamespace = "keepConditions"),
      (t.oKeepConditions = this)._init();
  }
  static queryString() {
    var e = {},
      i = window.location.hash.substring(1).split("&");
    for (let t = 0; t < i.length; t++) {
      var n = i[t].split("=");
      void 0 === e[n[0]]
        ? (e[n[0]] = n[1])
        : "string" == typeof e[n[0]]
        ? (e[n[0]] = [e[n[0]], n[1]])
        : e[n[0]].push(n[1]);
    }
    return e || !1;
  }
  static structureHash(t, e) {
    if (!t) throw Error("Illegal execution of KeepConditions.structureHash()");
    if (t instanceof KeepConditions) var i = t.dtSettings();
    else if (void 0 !== t.type && void 0 !== t.data.dtSettings)
      i = t.data.dtSettings;
    else if (t instanceof $.fn.dataTable.Api) i = t.settings()[0];
    else if ($.fn.DataTable.isDataTable(t))
      i = new $.fn.dataTable.Api(t).settings()[0];
    else {
      if (!$.isPlainObject(t) || ($.isPlainObject(t.oKeepConditions), 0))
        throw Error(
          "Unable to determine what you passed to KeepConditions.structureHash(), should be either an instance of KeepConditions, a proper jQuery event, or a DataTable instance with keepConditions enabled"
        );
      i = t;
    }
    t = new $.fn.dataTable.Api(i);
    var n = i.oKeepConditions.getEnabledConditions(),
      o = KeepConditions.queryString(),
      s = $(t.table().node()).attr("id"),
      a = {},
      d = [],
      r = [];
    if (void 0 === n || !1 === n)
      throw Error("Couldn't get conditions from table settings");
    if (
      ($.each(o, (t, e) => {
        (t || e) && t !== s && (a[t] = e || "");
      }),
      $.each(n, (t, e) => {
        i.oKeepConditions.conditions()[e].isset() &&
          void 0 !== (t = i.oKeepConditions.conditions()[e].newHashVal()) &&
          !1 !== t &&
          d.push(i.oKeepConditions.conditions()[e].key + t);
      }),
      (a[s] = d.join(":")),
      $.each(a, (t, e) => {
        0 < e.length && r.push(t + "=" + e);
      }),
      (t = r.join("&")),
      !0 === e)
    )
      return t;
    window.location.hash = t || "_";
  }
  _init() {
    this._collectEnabled(),
      (!0 === this._dtSettings.oInit.keepConditions ||
        "string" == typeof this._dtSettings.oInit.keepConditions ||
        $.isArray(this._dtSettings.oInit.keepConditions) ||
        ($.isPlainObject(this._dtSettings.oInit.keepConditions) &&
          (void 0 === this._dtSettings.oInit.keepConditions.attachEvents ||
            !0 === this._dtSettings.oInit.keepConditions.attachEvents))) &&
        this.attachEvents(),
      this.processHash();
  }
  _collectEnabled() {
    $.each(this.conditions(), (t, e) => {
      this._isEnabled(t) && e.isInit() && this.enableCondition(t);
    });
  }
  _keyMap() {
    {
      var t = this.conditions();
      let i = {};
      return (
        $.each(t, (t, e) => {
          i[e.key] = t;
        }),
        i
      );
    }
  }
  _isEnabled(t) {
    var e = this._dtSettings.oInit.keepConditions;
    if (1 === t.length) {
      var i = this.nameByKey(t);
      if (!t)
        throw Error(`Unable to find an existing condition with the key '${t}'`);
      t = i;
    } else if (!1 === this.conditions(t))
      throw Error(`Unable to find an existing condition with the name '${t}'`);
    return (
      !0 === e ||
      void 0 === e ||
      ("string" == typeof e && -1 !== e.indexOf(this.conditions(t).key)) ||
      ($.isArray(e) && -1 !== $.inArray(t, e)) ||
      ($.isPlainObject(e) &&
        $.isArray(e.conditions) &&
        -1 !== $.inArray(t, e.conditions)) ||
      ($.isPlainObject(e) &&
        "string" == typeof e.conditions &&
        -1 !== e.conditions.indexOf(this.conditions(t).key))
    );
  }
  _drawTable(t, e) {
    (!0 !== this._shouldDraw && !0 !== t) ||
      (this._dtApi.draw(!0 === e), (this._shouldDraw = !1));
  }
  _lang(t, e) {}
  structureHash(t) {
    return KeepConditions.structureHash(this._dtSettings, t);
  }
  dtSettings() {
    return this._dtSettings;
  }
  attachEvents() {
    var i = { dtSettings: this._dtSettings },
      t = this.getEnabledConditions();
    if (!1 === t) throw Error("No enabled conditions to attach to events");
    (t = this.conditions(t)),
      $.each(t, (t, e) => {
        this._dtApi.on(
          e.event + "." + this._eventNamespace,
          i,
          KeepConditions.structureHash.bind(KeepConditions)
        );
      });
  }
  detachEvents() {
    var t = this.getEnabledConditions();
    if (!1 === t) throw Error("No enabled conditions to attach to events");
    (t = this.conditions(t)),
      $.each(t, (t, e) => {
        this._isEnabled(t) &&
          e.isInit() &&
          this._dtApi.off(e.event + "." + this._eventNamespace);
      });
  }
  detachEvent(t) {
    if (void 0 === t)
      console.warn(
        "No condition or event specified for KeepConditions.detachEvent(), nothing is getting detached"
      );
    else {
      var i,
        n = this.conditions(t);
      if (!n) return !1;
      "string" == typeof t
        ? ((i = t.endsWith(".dt") ? t : n.event),
          this._dtApi.off(i, KeepConditions.structureHash.bind(KeepConditions)))
        : $.isArray(t) && 0 < t.length
        ? $.each(t, (t, e) => {
            if (e.endsWith(".dt")) i = e;
            else {
              if (void 0 === n[e])
                throw Error("Unknown condition specified: " + e);
              i = n[e].event;
            }
            this._dtApi.off(i + "." + this._eventNamespace);
          })
        : console.warn(
            "Illegal parameter type for KeepConditions.detachEvent(), should be array or string, was: ",
            typeof t
          );
    }
  }
  attachEvent(t) {
    if (void 0 === t)
      console.warn(
        "No condition or event specified for KeepConditions.attachEvent(), nothing is getting attached"
      );
    else {
      var i,
        e = { dtSettings: this._dtSettings },
        n = this.conditions(t);
      if (!n) return !1;
      "string" == typeof t
        ? ((i = t.endsWith(".dt") ? t : n.event),
          this._dtApi.on(
            i,
            e,
            KeepConditions.structureHash.bind(KeepConditions)
          ))
        : $.isArray(t) && 0 < t.length
        ? $.each(t, (t, e) => {
            if (e.endsWith(".dt")) i = e;
            else {
              if (void 0 === n[e])
                throw Error("Unknown condition specified: " + e);
              i = n[e].event;
            }
            this._dtApi.on(
              i + "." + this._eventNamespace,
              KeepConditions.structureHash.bind(KeepConditions)
            );
          })
        : console.warn(
            "Illegal parameter type for KeepConditions.attachEvent(), should be array or string, was: " +
              typeof t
          );
    }
  }
  processHash() {
    $.each(KeepConditions.queryString(), (t, e) => {
      ($.isArray(e) || $.isPlainObject(e)) && (e = e[0]),
        t === this._tableId &&
          ($.each(e.split(":"), (t, e) => {
            (t = e.charAt(0)), (e = e.substring(1));
            var i = this.nameByKey(t),
              n = this.conditions()[i];
            -1 !== $.inArray(i, this.getEnabledConditions()) &&
              (void 0 === n
                ? console.warn(
                    `[keepConditions:' ${this._tableId}] No condition object found for condition key:`,
                    t
                  )
                : n.onLoad(e));
          }),
          this._drawTable());
    });
  }
  enableCondition(t, e) {
    var i = !1;
    $.isArray(t)
      ? $.each(t, (t, e) => {
          1 === e.length && (e = this.nameByKey(e)),
            !1 !== this.conditions(e) &&
              (this._enabledConditions.push(e), (i = !0));
        })
      : "string" == typeof t &&
        (1 === t.length && (t = this.nameByKey(t)),
        !1 !== this.conditions(t)) &&
        (this._enabledConditions.push(t), (i = !0)),
      !0 === e &&
        !0 === i &&
        KeepConditions.structureHash(this._dtSettings, !1);
  }
  disableCondition(t, e) {
    var i = !1;
    $.isArray(t)
      ? $.each(t, (t, e) => {
          1 === e.length && (e = this.nameByKey(e)),
            !1 !== this.conditions(e) &&
              (this._enabledConditions.splice(
                $.inArray(e, this._enabledConditions),
                1
              ),
              (i = !0));
        })
      : "string" == typeof t &&
        (1 === t.length && (t = this.nameByKey(t)),
        !1 !== this.conditions(t)) &&
        (this._enabledConditions.splice(
          $.inArray(t, this._enabledConditions),
          1
        ),
        (i = !0)),
      !0 === e &&
        !0 === i &&
        KeepConditions.structureHash(this._dtSettings, !1);
  }
  getEnabledConditions() {
    return (
      0 < this._enabledConditions.length && $.unique(this._enabledConditions)
    );
  }
  nameByKey(t) {
    return this._keysToCons[t] || !1;
  }
  conditions(t) {
    var i,
      a = this,
      n = {
        search: {
          key: "f",
          event: "search.dt",
          isInit: () =>
            void 0 === a._dtSettings.oInit.searching ||
            !1 !== a._dtSettings.oInit.searching,
          onLoad: (t) => {
            void 0 !== t &&
              a._dtApi.search() !== decodeURIComponent(t) &&
              (a._dtApi.search(decodeURIComponent(t)), (a._shouldDraw = !0));
          },
          isset: () => 0 !== a._dtApi.search().length,
          newHashVal: () => encodeURIComponent(a._dtApi.search()),
        },
        length: {
          key: "l",
          event: "length.dt",
          isInit: () =>
            !(
              !1 === a._dtSettings.oInit.lengthChange ||
              (void 0 === a._dtSettings.oInit.lengthChange &&
                !1 === a._dtDefaults.bLengthChange)
            ),
          onLoad: (t) => {
            void 0 !== t &&
              (a._dtApi.page.len(parseInt(t)), (a._shouldDraw = !0));
          },
          isset: () =>
            a._dtApi.page.len() &&
            a._dtApi.page.len() !==
              (a._dtSettings.oInit.pageLength || a._dtDefaults.iDisplayLength),
          newHashVal: () => a._dtApi.page.len(),
        },
        page: {
          key: "p",
          event: "page.dt",
          isInit: () =>
            !(
              !1 === a._dtSettings.oInit.paging ||
              (void 0 === a._dtSettings.oInit.paging &&
                !1 === a._dtDefaults.bPaginate)
            ),
          onLoad: (t) => {
            void 0 !== t &&
              0 !== parseInt(t) &&
              (a._dtApi.page(parseInt(t)), (a._shouldDraw = !0));
          },
          isset: () => a._dtApi.page.info() && 0 !== a._dtApi.page.info().page,
          newHashVal: () => a._dtApi.page.info().page,
        },
        colvis: {
          key: "v",
          event: "column-visibility.dt",
          isInit: () => !0,
          onLoad: (t) => {
            if (void 0 !== t) {
              let i = t.charAt(0),
                n = t.substring(1).split(".");
              "f" !== i && "t" !== i
                ? console.warn(
                    "Unknown ColVis condition visibility value, expected t or f, found:",
                    i
                  )
                : (a._dtApi
                    .columns()
                    .indexes()
                    .each((t, e) => {
                      "t" === i
                        ? -1 === $.inArray(t.toString(), n)
                          ? a._dtApi.column(t).visible(!1)
                          : a._dtApi.column(t).visible(!0)
                        : -1 === $.inArray(t.toString(), n)
                        ? a._dtApi.column(t).visible(!0)
                        : a._dtApi.column(t).visible(!1);
                    }),
                  (a._shouldDraw = !0));
            }
          },
          isset: () =>
            a._dtApi
              .columns()
              .visible()
              .filter((t) => !t)
              .any(),
          newHashVal: () => {
            let i = [],
              n = [];
            return (
              a._dtApi
                .columns()
                .visible()
                .each((t, e) => {
                  (!0 === t ? i : n).push(e);
                }),
              i.length >= n.length ? "f" + n.join(".") : "t" + i.join(".")
            );
          },
        },
        scroller: {
          key: "s",
          event: "draw.dt",
          isInit: () => void 0 !== a._dtSettings.oScroller,
          onLoad: (t) => {
            0 !== parseInt(t) && a._dtApi.row(parseInt(t)).scrollTo();
          },
          isset: () =>
            0 !== Math.trunc(parseInt(a._dtSettings.oScroller.s.baseRowTop)),
          newHashVal: () => {
            var t = Math.trunc(parseInt(a._dtSettings.oScroller.s.baseRowTop));
            return 0 !== t && t;
          },
        },
        colorder: {
          key: "c",
          event: "column-reorder.dt",
          isInit: () => void 0 !== a._dtSettings._colReorder,
          onLoad: (t) => {
            t = t.split(".");
            let i = [];
            if (
              ($.each(t, (t, e) => {
                if (-1 !== e.indexOf("-"))
                  if (
                    ((t = e.split("-")),
                    (e = parseInt(t[0])),
                    (t = parseInt(t[1])) < e)
                  )
                    for (; t < e + 1; e--) i.push(e);
                  else for (; e - 1 < t; e++) i.push(e);
                else i.push(e);
              }),
              (t = i.map((t) => parseInt(t))),
              void 0 === a._dtApi.colReorder)
            )
              return !1;
            JSON.stringify(t) !== JSON.stringify(a._dtApi.colReorder.order()) &&
              (a._dtApi.colReorder.order(t, !0), (a._shouldDraw = !0));
          },
          isset: () =>
            void 0 !== a._dtApi.colReorder &&
            JSON.stringify(a._dtApi.colReorder.order()) !==
              JSON.stringify(a._dtApi.columns().indexes().toArray()),
          newHashVal: () => {
            let t = a._dtApi.colReorder.order(),
              i,
              n = [],
              o = [],
              s = () => {
                var t =
                  2 === o.length
                    ? o[0] + "." + o[1]
                    : o[0] + "-" + o[o.length - 1];
                return (o = []), t;
              };
            return (
              $.each(t, (t, e) => {
                (e = parseInt(e)),
                  (void 0 === i
                    ? n
                    : 0 < o.length
                    ? (o[o.length - 1] > o[o.length - 2] &&
                        e === o[o.length - 1] + 1) ||
                      (o[o.length - 1] < o[o.length - 2] &&
                        e === o[o.length - 1] - 1)
                      ? o
                      : (n.push(s()), n)
                    : e === i + 1 || e === i - 1
                    ? (n.splice(n.length - 1, 1), o.push(i), o)
                    : n
                  ).push(e),
                  (i = e);
              }),
              0 < o.length && n.push(s()),
              n.join(".")
            );
          },
        },
        order: {
          key: "o",
          event: "order.dt",
          isInit: () => {
            var i = !1;
            return (
              $.each(this._dtSettings.aoColumns, (t, e) => {
                if (!0 === e.bSortable) return !(i = !0);
              }),
              i
            );
          },
          onLoad: (t) => {
            void 0 !== t &&
              (a._dtApi.order([
                parseInt(t.substring(1)),
                { a: "asc", d: "desc" }[t.charAt(0)],
              ]),
              (a._shouldDraw = !0));
          },
          isset: () =>
            a._dtApi.order()[0] &&
            JSON.stringify(a._dtApi.order()) !==
              JSON.stringify($.fn.dataTable.defaults.aaSorting),
          newHashVal: () =>
            a._dtApi.order()[0][1].charAt(0) + a._dtApi.order()[0][0],
        },
      };
    return "string" == typeof t
      ? void 0 !== n[t] && n[t]
      : $.isArray(t) && 0 < t.length
      ? ((i = {}),
        $.each(t, (t, e) => {
          if (void 0 === n[e])
            throw Error("Unable to retrieve condition by name: " + e);
          i[e] = n[e];
        }),
        i)
      : n;
  }
}
((l, p, c) => {
  c.extend(!0, c.fn.dataTable.defaults, {
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
    c(p).on("init.dt", (t, e) => {
      "dt" === t.namespace &&
        void 0 !== e.oInit.keepConditions &&
        !1 !== e.oInit.keepConditions &&
        new KeepConditions(e);
    }),
    c.fn.dataTable.Api.register("keepConditions.attachEvents()", function (t) {
      return this.iterator("table", function (t) {
        return t.oKeepConditions.attachEvents();
      });
    }),
    c.fn.dataTable.Api.register("keepConditions.detachEvents()", function (t) {
      return this.iterator("table", function (t) {
        return t.oKeepConditions.detachEvents();
      });
    }),
    c.fn.dataTable.Api.register("keepConditions.structureHash()", function (t) {
      return this.context[0].oKeepConditions.structureHash(t);
    }),
    c.fn.dataTable.Api.register(
      "keepConditions.enableCondition()",
      function (e, i) {
        return this.iterator("table", function (t) {
          return t.oKeepConditions.enableCondition(e, i);
        });
      }
    ),
    c.fn.dataTable.Api.register(
      "keepConditions.disableCondition()",
      function (e, i) {
        return this.iterator("table", function (t) {
          return t.oKeepConditions.disableCondition(e, i);
        });
      }
    ),
    (c.fn.dataTable.ext.buttons.copyConditions = {
      text: "Copy Conditions",
      action: (t, e, i, n) => {
        var o = e.settings()[0].oLanguage.keepConditions,
          s =
            ((t = e.settings()[0].oKeepConditions.structureHash(!0)),
            (i =
              p.location.protocol +
              "//" +
              p.location.host +
              (p.location.port.length ? ":" + p.location.port : "") +
              p.location.pathname +
              "#" +
              t),
            o.btnNoHashTitle || "No Conditions"),
          a = o.btnNoHashBody || "Thre are no conditions to be copied",
          d = o.btnCopyTitle || "URL Copied",
          r =
            o.btnCopyBody ||
            "The URL with the DataTables conditions has been copied to your clipboard",
          h = o.btnSelectTitle || "Copy URL",
          o = o.btnSelectBody || "Copy be below input to easily share the URL";
        if (t) {
          c("<input />")
            .val(i)
            .attr("id", "copyConditions-text")
            .css({
              position: "absolute",
              left: "-9999px",
              top: `${l.pageYOffset || p.documentElement.scrollTop}px`,
            })
            .appendTo("body"),
            c("#copyConditions-text").select();
          try {
            p.execCommand("copy"), e.buttons.info(d, r, n.copyTimeout || 4e3);
          } catch (t) {
            e.buttons.info(
              h,
              o +
                `<br><input id="keepConditions-input" value="${i}" style="width:90%;">`,
              n.selectTimeout || 1e4
            ),
              c("input#keepConditions-input").select();
          } finally {
            c("#copyConditions-text").remove();
          }
        } else e.buttons.info(s, a, 3e3);
      },
    });
})(window, document, jQuery);

// hammer.js (dist version 2016-04-23 which is much smaller, not main repo version 2016-09-30)
((s, X, u) => {
  function o(t, e, i) {
    return setTimeout(n(t, i), e);
  }
  function i(t, e, i) {
    return Array.isArray(t) && (r(t, i[e], i), 1);
  }
  function r(t, e, i) {
    if (t)
      if (t.forEach) t.forEach(e, i);
      else if (t.length !== u)
        for (n = 0; n < t.length; ) e.call(i, t[n], n, t), n++;
      else for (var n in t) t.hasOwnProperty(n) && e.call(i, t[n], n, t);
  }
  function Y(i, t, e) {
    var n = "DEPRECATED METHOD: " + t + "\n" + e + " AT \n";
    return function () {
      var t =
          (t = Error("get-stack-trace")) && t.stack
            ? t.stack
                .replace(/^[^\(]+?[\n$]/gm, "")
                .replace(/^\s+at\s+/gm, "")
                .replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@")
            : "Unknown Stack Trace",
        e = s.console && (s.console.warn || s.console.log);
      return e && e.call(s.console, n, t), i.apply(this, arguments);
    };
  }
  function t(t, e, i) {
    e = e.prototype;
    var n = (t.prototype = Object.create(e));
    (n.constructor = t), (n._super = e), i && M(n, i);
  }
  function n(t, e) {
    return function () {
      return t.apply(e, arguments);
    };
  }
  function a(t, e) {
    return "function" == typeof t ? t.apply((e && e[0]) || u, e) : t;
  }
  function e(e, t, i) {
    r(c(t), function (t) {
      e.addEventListener(t, i, !1);
    });
  }
  function h(e, t, i) {
    r(c(t), function (t) {
      e.removeEventListener(t, i, !1);
    });
  }
  function F(t, e) {
    for (; t; ) {
      if (t == e) return !0;
      t = t.parentNode;
    }
    return !1;
  }
  function c(t) {
    return t.trim().split(/\s+/g);
  }
  function l(t, e, i) {
    if (t.indexOf && !i) return t.indexOf(e);
    for (var n = 0; n < t.length; ) {
      if ((i && t[n][i] == e) || (!i && t[n] === e)) return n;
      n++;
    }
    return -1;
  }
  function p(t) {
    return Array.prototype.slice.call(t, 0);
  }
  function W(t, i, e) {
    for (var n = [], s = [], o = 0; o < t.length; ) {
      var r = i ? t[o][i] : t[o];
      l(s, r) < 0 && n.push(t[o]), (s[o] = r), o++;
    }
    return (n = e
      ? i
        ? n.sort(function (t, e) {
            return t[i] > e[i];
          })
        : n.sort()
      : n);
  }
  function f(t, e) {
    for (var i, n = e[0].toUpperCase() + e.slice(1), s = 0; s < tt.length; ) {
      if ((i = (i = tt[s]) ? i + n : e) in t) return i;
      s++;
    }
    return u;
  }
  function q(t) {
    return (t = t.ownerDocument || t).defaultView || t.parentWindow || s;
  }
  function d(e, t) {
    var i = this;
    (this.manager = e),
      (this.callback = t),
      (this.element = e.element),
      (this.target = e.options.inputTarget),
      (this.domHandler = function (t) {
        a(e.options.enable, [e]) && i.handler(t);
      }),
      this.init();
  }
  function k(t, e, i) {
    var n = i.pointers.length,
      s = i.changedPointers.length,
      o = 1 & e && 0 == n - s,
      r =
        ((i.isFirst = !!o),
        (i.isFinal = !!(12 & e && 0 == n - s)),
        o && (t.session = {}),
        (i.eventType = e),
        (e = t.session),
        (s = (n = i.pointers).length),
        e.firstInput || (e.firstInput = H(i)),
        1 < s && !e.firstMultiple
          ? (e.firstMultiple = H(i))
          : 1 === s && (e.firstMultiple = !1),
        (o = e.firstInput),
        ((s = e.firstMultiple) || o).center),
      a = (i.center = L(n)),
      h =
        ((i.timeStamp = it()),
        (i.deltaTime = i.timeStamp - o.timeStamp),
        (i.angle = m(r, a)),
        (i.distance = v(r, a)),
        (o = i.center),
        (r = e.offsetDelta || {}),
        (a = e.prevDelta || {}),
        e.prevInput || {});
    (1 !== i.eventType && 4 !== h.eventType) ||
      ((a = e.prevDelta = { x: h.deltaX || 0, y: h.deltaY || 0 }),
      (r = e.offsetDelta = { x: o.x, y: o.y })),
      (i.deltaX = a.x + (o.x - r.x)),
      (i.deltaY = a.y + (o.y - r.y)),
      (i.offsetDirection = U(i.deltaX, i.deltaY)),
      (o = i.deltaX / (r = i.deltaTime) || 0),
      (r = i.deltaY / r || 0),
      (i.overallVelocityX = o),
      (i.overallVelocityY = r),
      (i.overallVelocity = R(o) > R(r) ? o : r),
      (o = s ? ((o = s.pointers), v(n[0], n[1], z) / v(o[0], o[1], z)) : 1),
      (i.scale = o),
      (n = s ? ((s = s.pointers), m(n[1], n[0], z) + m(s[1], s[0], z)) : 0),
      (i.rotation = n),
      (i.maxPointers =
        !e.prevInput || i.pointers.length > e.prevInput.maxPointers
          ? i.pointers.length
          : e.prevInput.maxPointers),
      (r = e.lastInterval || i),
      (n = i.timeStamp - r.timeStamp),
      8 != i.eventType && (25 < n || r.velocity === u)
        ? ((o = i.deltaX - r.deltaX),
          (s = h = (r = i.deltaY - r.deltaY) / n || 0),
          (a = R((n = a = o / n || 0)) > R(h) ? a : h),
          (o = U(o, r)),
          (e.lastInterval = i))
        : ((a = r.velocity),
          (n = r.velocityX),
          (s = r.velocityY),
          (o = r.direction)),
      (i.velocity = a),
      (i.velocityX = n),
      (i.velocityY = s),
      (i.direction = o),
      (e = t.element),
      F(i.srcEvent.target, e) && (e = i.srcEvent.target),
      (i.target = e),
      t.emit("hammer.input", i),
      t.recognize(i),
      (t.session.prevInput = i);
  }
  function H(t) {
    for (var e = [], i = 0; i < t.pointers.length; )
      (e[i] = {
        clientX: w(t.pointers[i].clientX),
        clientY: w(t.pointers[i].clientY),
      }),
        i++;
    return {
      timeStamp: it(),
      pointers: e,
      center: L(e),
      deltaX: t.deltaX,
      deltaY: t.deltaY,
    };
  }
  function L(t) {
    var e = t.length;
    if (1 === e) return { x: w(t[0].clientX), y: w(t[0].clientY) };
    for (var i = 0, n = 0, s = 0; s < e; )
      (i += t[s].clientX), (n += t[s].clientY), s++;
    return { x: w(i / e), y: w(n / e) };
  }
  function U(t, e) {
    return t === e ? 1 : R(t) >= R(e) ? (t < 0 ? 2 : 4) : e < 0 ? 8 : 16;
  }
  function v(t, e, i) {
    var n = e[(i ||= ut)[0]] - t[i[0]];
    return (t = e[i[1]] - t[i[1]]), Math.sqrt(n * n + t * t);
  }
  function m(t, e, i) {
    return (
      (i ||= ut),
      (180 * Math.atan2(e[i[1]] - t[i[1]], e[i[0]] - t[i[0]])) / Math.PI
    );
  }
  function g() {
    (this.evEl = lt),
      (this.evWin = pt),
      (this.pressed = !1),
      d.apply(this, arguments);
  }
  function T() {
    (this.evEl = vt),
      (this.evWin = mt),
      d.apply(this, arguments),
      (this.store = this.manager.session.pointerEvents = []);
  }
  function V() {
    (this.evTarget = "touchstart"),
      (this.evWin = "touchstart touchmove touchend touchcancel"),
      (this.started = !1),
      d.apply(this, arguments);
  }
  function y() {
    (this.evTarget = yt), (this.targetIds = {}), d.apply(this, arguments);
  }
  function E() {
    d.apply(this, arguments);
    var t = n(this.handler, this);
    (this.touch = new y(this.manager, t)),
      (this.mouse = new g(this.manager, t)),
      (this.primaryTouch = null),
      (this.lastTouches = []);
  }
  function j(t) {
    var e, i;
    (t = t.changedPointers[0]).identifier === this.primaryTouch &&
      ((e = { x: t.clientX, y: t.clientY }),
      this.lastTouches.push(e),
      (i = this.lastTouches),
      setTimeout(function () {
        var t = i.indexOf(e);
        -1 < t && i.splice(t, 1);
      }, 2500));
  }
  function I(t, e) {
    (this.manager = t), this.set(e);
  }
  function A(t) {
    (this.options = M({}, this.defaults, t || {})),
      (this.id = ot++),
      (this.manager = null),
      (t = this.options.enable),
      (this.options.enable = t === u || t),
      (this.state = 1),
      (this.simultaneous = {}),
      (this.requireFail = []);
  }
  function G(t) {
    return 16 & t
      ? "cancel"
      : 8 & t
      ? "end"
      : 4 & t
      ? "move"
      : 2 & t
      ? "start"
      : "";
  }
  function Z(t) {
    return 16 == t
      ? "down"
      : 8 == t
      ? "up"
      : 2 == t
      ? "left"
      : 4 == t
      ? "right"
      : "";
  }
  function _(t, e) {
    return (e = e.manager) ? e.get(t) : t;
  }
  function b() {
    A.apply(this, arguments);
  }
  function C() {
    b.apply(this, arguments), (this.pY = this.pX = null);
  }
  function S() {
    b.apply(this, arguments);
  }
  function P() {
    A.apply(this, arguments), (this._input = this._timer = null);
  }
  function x() {
    b.apply(this, arguments);
  }
  function B() {
    b.apply(this, arguments);
  }
  function D() {
    A.apply(this, arguments),
      (this.pCenter = this.pTime = !1),
      (this._input = this._timer = null),
      (this.count = 0);
  }
  function O(t, e) {
    var i = (e = e || {}).recognizers;
    return (e.recognizers = i === u ? O.defaults.preset : i), new $(t, e);
  }
  function $(t, e) {
    (this.options = M({}, O.defaults, e || {})),
      (this.options.inputTarget = this.options.inputTarget || t),
      (this.handlers = {}),
      (this.session = {}),
      (this.recognizers = []),
      (this.oldCssProps = {}),
      (this.element = t),
      (this.input = new ((e = this).options.inputClass ||
        (at ? T : ht ? y : rt ? E : g))(e, k)),
      (this.touchAction = new I(this, this.options.touchAction)),
      J(this, !0),
      r(
        this.options.recognizers,
        function (t) {
          var e = this.add(new t[0](t[1]));
          t[2] && e.recognizeWith(t[2]), t[3] && e.requireFailure(t[3]);
        },
        this
      );
  }
  function J(i, n) {
    var s,
      o = i.element;
    o.style &&
      (r(i.options.cssProps, function (t, e) {
        (s = f(o.style, e)),
          n
            ? ((i.oldCssProps[s] = o.style[s]), (o.style[s] = t))
            : (o.style[s] = i.oldCssProps[s] || "");
      }),
      n || (i.oldCssProps = {}));
  }
  var K,
    Q,
    tt = " webkit Moz MS ms o".split(" "),
    et = X.createElement("div"),
    w = Math.round,
    R = Math.abs,
    it = Date.now,
    M =
      "function" != typeof Object.assign
        ? function (t) {
            if (t === u || null === t)
              throw new TypeError("Cannot convert undefined or null to object");
            for (var e = Object(t), i = 1; i < arguments.length; i++) {
              var n = arguments[i];
              if (n !== u && null !== n)
                for (var s in n) n.hasOwnProperty(s) && (e[s] = n[s]);
            }
            return e;
          }
        : Object.assign,
    nt = Y(
      function (t, e, i) {
        for (var n = Object.keys(e), s = 0; s < n.length; )
          (i && t[n[s]] !== u) || (t[n[s]] = e[n[s]]), s++;
        return t;
      },
      "extend",
      "Use `assign`."
    ),
    st = Y(
      function (t, e) {
        return nt(t, e, !0);
      },
      "merge",
      "Use `assign`."
    ),
    ot = 1,
    rt = "ontouchstart" in s,
    at = f(s, "PointerEvent") !== u,
    ht =
      rt && /mobile|tablet|ip(ad|hone|od)|android/i.test(navigator.userAgent),
    ut = ["x", "y"],
    z = ["clientX", "clientY"],
    ct =
      ((d.prototype = {
        handler: function () {},
        init: function () {
          this.evEl && e(this.element, this.evEl, this.domHandler),
            this.evTarget && e(this.target, this.evTarget, this.domHandler),
            this.evWin && e(q(this.element), this.evWin, this.domHandler);
        },
        destroy: function () {
          this.evEl && h(this.element, this.evEl, this.domHandler),
            this.evTarget && h(this.target, this.evTarget, this.domHandler),
            this.evWin && h(q(this.element), this.evWin, this.domHandler);
        },
      }),
      { mousedown: 1, mousemove: 2, mouseup: 4 }),
    lt = "mousedown",
    pt = "mousemove mouseup",
    ft =
      (t(g, d, {
        handler: function (t) {
          var e = ct[t.type];
          1 & e && 0 === t.button && (this.pressed = !0),
            2 & e && 1 !== t.which && (e = 4),
            this.pressed &&
              (4 & e && (this.pressed = !1),
              this.callback(this.manager, e, {
                pointers: [t],
                changedPointers: [t],
                pointerType: "mouse",
                srcEvent: t,
              }));
        },
      }),
      {
        pointerdown: 1,
        pointermove: 2,
        pointerup: 4,
        pointercancel: 8,
        pointerout: 8,
      }),
    dt = { 2: "touch", 3: "pen", 4: "mouse", 5: "kinect" },
    vt = "pointerdown",
    mt = "pointermove pointerup pointercancel",
    gt =
      (s.MSPointerEvent &&
        !s.PointerEvent &&
        ((vt = "MSPointerDown"),
        (mt = "MSPointerMove MSPointerUp MSPointerCancel")),
      t(T, d, {
        handler: function (t) {
          var e = this.store,
            i = !1,
            n = t.type.toLowerCase().replace("ms", ""),
            n = ft[n],
            s = dt[t.pointerType] || t.pointerType,
            o = "touch" == s,
            r = l(e, t.pointerId, "pointerId");
          1 & n && (0 === t.button || o)
            ? r < 0 && (e.push(t), (r = e.length - 1))
            : 12 & n && (i = !0),
            r < 0 ||
              ((e[r] = t),
              this.callback(this.manager, n, {
                pointers: e,
                changedPointers: [t],
                pointerType: s,
                srcEvent: t,
              }),
              i && e.splice(r, 1));
        },
      }),
      { touchstart: 1, touchmove: 2, touchend: 4, touchcancel: 8 }),
    Tt =
      (t(V, d, {
        handler: function (t) {
          var e,
            i,
            n = gt[t.type];
          1 === n && (this.started = !0),
            this.started &&
              ((i = p(t.touches)),
              (e = p(t.changedTouches)),
              (i = [(i = 12 & n ? W(i.concat(e), "identifier", !0) : i), e]),
              12 & n && 0 == i[0].length - i[1].length && (this.started = !1),
              this.callback(this.manager, n, {
                pointers: i[0],
                changedPointers: i[1],
                pointerType: "touch",
                srcEvent: t,
              }));
        },
      }),
      { touchstart: 1, touchmove: 2, touchend: 4, touchcancel: 8 }),
    yt = "touchstart touchmove touchend touchcancel",
    Et =
      (t(y, d, {
        handler: function (t) {
          var e = Tt[t.type],
            i = function (t, e) {
              var i = p(t.touches),
                n = this.targetIds;
              if (3 & e && 1 === i.length)
                return (n[i[0].identifier] = !0), [i, i];
              t = p(t.changedTouches);
              var s = [],
                o = this.target,
                r = i.filter(function (t) {
                  return F(t.target, o);
                });
              if (1 === e)
                for (i = 0; i < r.length; ) (n[r[i].identifier] = !0), i++;
              for (i = 0; i < t.length; )
                n[t[i].identifier] && s.push(t[i]),
                  12 & e && delete n[t[i].identifier],
                  i++;
              return s.length ? [W(r.concat(s), "identifier", !0), s] : void 0;
            }.call(this, t, e);
          i &&
            this.callback(this.manager, e, {
              pointers: i[0],
              changedPointers: i[1],
              pointerType: "touch",
              srcEvent: t,
            });
        },
      }),
      t(E, d, {
        handler: function (t, e, i) {
          if (
            !(
              (n = "mouse" == i.pointerType) &&
              i.sourceCapabilities &&
              i.sourceCapabilities.firesTouchEvents
            )
          ) {
            if ("touch" == i.pointerType)
              1 & e
                ? ((this.primaryTouch = i.changedPointers[0].identifier),
                  j.call(this, i))
                : 12 & e && j.call(this, i);
            else {
              if (n)
                t: {
                  for (
                    var n = i.srcEvent.clientX, s = i.srcEvent.clientY, o = 0;
                    o < this.lastTouches.length;
                    o++
                  ) {
                    var r = this.lastTouches[o],
                      a = Math.abs(s - r.y);
                    if (Math.abs(n - r.x) <= 25 && a <= 25) {
                      n = !0;
                      break t;
                    }
                  }
                  n = !1;
                }
              if (n) return;
            }
            this.callback(t, e, i);
          }
        },
        destroy: function () {
          this.touch.destroy(), this.mouse.destroy();
        },
      }),
      f(et.style, "touchAction")),
    It = Et !== u,
    N =
      It &&
      ((K = {}),
      (Q = s.CSS && s.CSS.supports),
      "auto;manipulation;pan-y;pan-x;pan-x pan-y;none"
        .split(";")
        .forEach(function (t) {
          K[t] = !Q || s.CSS.supports("touch-action", t);
        }),
      K);
  (I.prototype = {
    set: function (t) {
      "compute" == t && (t = this.compute()),
        It &&
          this.manager.element.style &&
          N[t] &&
          (this.manager.element.style[Et] = t),
        (this.actions = t.toLowerCase().trim());
    },
    update: function () {
      this.set(this.manager.options.touchAction);
    },
    compute: function () {
      var t,
        e,
        i,
        n = [];
      return (
        r(this.manager.recognizers, function (t) {
          a(t.options.enable, [t]) && (n = n.concat(t.getTouchAction()));
        }),
        -1 < (t = n.join(" ")).indexOf("none") ||
        ((e = -1 < t.indexOf("pan-x")), (i = -1 < t.indexOf("pan-y")), e && i)
          ? "none"
          : e || i
          ? e
            ? "pan-x"
            : "pan-y"
          : -1 < t.indexOf("manipulation")
          ? "manipulation"
          : "auto"
      );
    },
    preventDefaults: function (t) {
      var e = t.srcEvent,
        i = t.offsetDirection;
      if (this.manager.session.prevented) e.preventDefault();
      else {
        var n = -1 < (o = this.actions).indexOf("none") && !N.none,
          s = -1 < o.indexOf("pan-y") && !N["pan-y"],
          o = -1 < o.indexOf("pan-x") && !N["pan-x"];
        if (n) {
          var r = t.distance < 2;
          if (1 === t.pointers.length && r && t.deltaTime < 250) return;
        }
        if ((!o || !s) && (n || (s && 6 & i) || (o && 24 & i)))
          return this.preventSrc(e);
      }
    },
    preventSrc: function (t) {
      (this.manager.session.prevented = !0), t.preventDefault();
    },
  }),
    (A.prototype = {
      defaults: {},
      set: function (t) {
        return (
          M(this.options, t),
          this.manager && this.manager.touchAction.update(),
          this
        );
      },
      recognizeWith: function (t) {
        var e;
        return (
          i(t, "recognizeWith", this) ||
            (e = this.simultaneous)[(t = _(t, this)).id] ||
            (e[t.id] = t).recognizeWith(this),
          this
        );
      },
      dropRecognizeWith: function (t) {
        return (
          i(t, "dropRecognizeWith", this) ||
            ((t = _(t, this)), delete this.simultaneous[t.id]),
          this
        );
      },
      requireFailure: function (t) {
        var e;
        return (
          i(t, "requireFailure", this) ||
            (-1 === l((e = this.requireFail), (t = _(t, this))) &&
              (e.push(t), t.requireFailure(this))),
          this
        );
      },
      dropRequireFailure: function (t) {
        return (
          i(t, "dropRequireFailure", this) ||
            ((t = _(t, this)),
            -1 < (t = l(this.requireFail, t)) && this.requireFail.splice(t, 1)),
          this
        );
      },
      hasRequireFailures: function () {
        return 0 < this.requireFail.length;
      },
      canRecognizeWith: function (t) {
        return !!this.simultaneous[t.id];
      },
      emit: function (e) {
        function t(t) {
          i.manager.emit(t, e);
        }
        var i = this,
          n = this.state;
        n < 8 && t(i.options.event + G(n)),
          t(i.options.event),
          e.additionalEvent && t(e.additionalEvent),
          8 <= n && t(i.options.event + G(n));
      },
      tryEmit: function (t) {
        if (this.canEmit()) return this.emit(t);
        this.state = 32;
      },
      canEmit: function () {
        for (var t = 0; t < this.requireFail.length; ) {
          if (!(33 & this.requireFail[t].state)) return !1;
          t++;
        }
        return !0;
      },
      recognize: function (t) {
        (t = M({}, t)),
          a(this.options.enable, [this, t])
            ? (56 & this.state && (this.state = 1),
              (this.state = this.process(t)),
              30 & this.state && this.tryEmit(t))
            : (this.reset(), (this.state = 32));
      },
      process: function (t) {},
      getTouchAction: function () {},
      reset: function () {},
    }),
    t(b, A, {
      defaults: { pointers: 1 },
      attrTest: function (t) {
        var e = this.options.pointers;
        return 0 === e || t.pointers.length === e;
      },
      process: function (t) {
        var e = this.state,
          i = t.eventType,
          n = 6 & e;
        return (
          (t = this.attrTest(t)),
          n && (8 & i || !t)
            ? 16 | e
            : n || t
            ? 4 & i
              ? 8 | e
              : 2 & e
              ? 4 | e
              : 2
            : 32
        );
      },
    }),
    t(C, b, {
      defaults: { event: "pan", threshold: 10, pointers: 1, direction: 30 },
      getTouchAction: function () {
        var t = this.options.direction,
          e = [];
        return 6 & t && e.push("pan-y"), 24 & t && e.push("pan-x"), e;
      },
      directionTest: function (t) {
        var e = this.options,
          i = !0,
          n = t.distance,
          s = t.direction,
          o = t.deltaX,
          r = t.deltaY;
        return (
          s & e.direction ||
            (n =
              6 & e.direction
                ? ((s = 0 === o ? 1 : o < 0 ? 2 : 4),
                  (i = o != this.pX),
                  Math.abs(t.deltaX))
                : ((s = 0 === r ? 1 : r < 0 ? 8 : 16),
                  (i = r != this.pY),
                  Math.abs(t.deltaY))),
          (t.direction = s),
          i && n > e.threshold && s & e.direction
        );
      },
      attrTest: function (t) {
        return (
          b.prototype.attrTest.call(this, t) &&
          (2 & this.state || (!(2 & this.state) && this.directionTest(t)))
        );
      },
      emit: function (t) {
        (this.pX = t.deltaX), (this.pY = t.deltaY);
        var e = Z(t.direction);
        e && (t.additionalEvent = this.options.event + e),
          this._super.emit.call(this, t);
      },
    }),
    t(S, b, {
      defaults: { event: "pinch", threshold: 0, pointers: 2 },
      getTouchAction: function () {
        return ["none"];
      },
      attrTest: function (t) {
        return (
          this._super.attrTest.call(this, t) &&
          (Math.abs(t.scale - 1) > this.options.threshold || 2 & this.state)
        );
      },
      emit: function (t) {
        1 !== t.scale &&
          (t.additionalEvent =
            this.options.event + (t.scale < 1 ? "in" : "out")),
          this._super.emit.call(this, t);
      },
    }),
    t(P, A, {
      defaults: { event: "press", pointers: 1, time: 251, threshold: 9 },
      getTouchAction: function () {
        return ["auto"];
      },
      process: function (t) {
        var e = this.options,
          i = t.pointers.length === e.pointers,
          n = t.distance < e.threshold,
          s = e.time < t.deltaTime;
        if (((this._input = t), !n || !i || (12 & t.eventType && !s)))
          this.reset();
        else if (1 & t.eventType)
          this.reset(),
            (this._timer = o(
              function () {
                (this.state = 8), this.tryEmit();
              },
              e.time,
              this
            ));
        else if (4 & t.eventType) return 8;
        return 32;
      },
      reset: function () {
        clearTimeout(this._timer);
      },
      emit: function (t) {
        8 === this.state &&
          (t && 4 & t.eventType
            ? this.manager.emit(this.options.event + "up", t)
            : ((this._input.timeStamp = it()),
              this.manager.emit(this.options.event, this._input)));
      },
    }),
    t(x, b, {
      defaults: { event: "rotate", threshold: 0, pointers: 2 },
      getTouchAction: function () {
        return ["none"];
      },
      attrTest: function (t) {
        return (
          this._super.attrTest.call(this, t) &&
          (Math.abs(t.rotation) > this.options.threshold || 2 & this.state)
        );
      },
    }),
    t(B, b, {
      defaults: {
        event: "swipe",
        threshold: 10,
        velocity: 0.3,
        direction: 30,
        pointers: 1,
      },
      getTouchAction: function () {
        return C.prototype.getTouchAction.call(this);
      },
      attrTest: function (t) {
        var e,
          i = this.options.direction;
        return (
          30 & i
            ? (e = t.overallVelocity)
            : 6 & i
            ? (e = t.overallVelocityX)
            : 24 & i && (e = t.overallVelocityY),
          this._super.attrTest.call(this, t) &&
            i & t.offsetDirection &&
            t.distance > this.options.threshold &&
            t.maxPointers == this.options.pointers &&
            R(e) > this.options.velocity &&
            4 & t.eventType
        );
      },
      emit: function (t) {
        var e = Z(t.offsetDirection);
        e && this.manager.emit(this.options.event + e, t),
          this.manager.emit(this.options.event, t);
      },
    }),
    t(D, A, {
      defaults: {
        event: "tap",
        pointers: 1,
        taps: 1,
        interval: 300,
        time: 250,
        threshold: 9,
        posThreshold: 10,
      },
      getTouchAction: function () {
        return ["manipulation"];
      },
      process: function (t) {
        var e = this.options,
          i = t.pointers.length === e.pointers,
          n = t.distance < e.threshold,
          s = t.deltaTime < e.time;
        if ((this.reset(), 1 & t.eventType && 0 === this.count))
          return this.failTimeout();
        if (n && s && i) {
          if (4 != t.eventType) return this.failTimeout();
          if (
            ((i = !this.pTime || t.timeStamp - this.pTime < e.interval),
            (n = !this.pCenter || v(this.pCenter, t.center) < e.posThreshold),
            (this.pTime = t.timeStamp),
            (this.pCenter = t.center),
            (this.count = n && i ? this.count + 1 : 1),
            (this._input = t),
            0 == this.count % e.taps)
          )
            return this.hasRequireFailures()
              ? ((this._timer = o(
                  function () {
                    (this.state = 8), this.tryEmit();
                  },
                  e.interval,
                  this
                )),
                2)
              : 8;
        }
        return 32;
      },
      failTimeout: function () {
        return (
          (this._timer = o(
            function () {
              this.state = 32;
            },
            this.options.interval,
            this
          )),
          32
        );
      },
      reset: function () {
        clearTimeout(this._timer);
      },
      emit: function () {
        8 == this.state &&
          ((this._input.tapCount = this.count),
          this.manager.emit(this.options.event, this._input));
      },
    }),
    (O.VERSION = "2.0.8"),
    (O.defaults = {
      domEvents: !1,
      touchAction: "compute",
      enable: !0,
      inputTarget: null,
      inputClass: null,
      preset: [
        [x, { enable: !1 }],
        [S, { enable: !1 }, ["rotate"]],
        [B, { direction: 6 }],
        [C, { direction: 6 }, ["swipe"]],
        [D],
        [D, { event: "doubletap", taps: 2 }, ["tap"]],
        [P],
      ],
      cssProps: {
        userSelect: "none",
        touchSelect: "none",
        touchCallout: "none",
        contentZooming: "none",
        userDrag: "none",
        tapHighlightColor: "rgba(0,0,0,0)",
      },
    }),
    ($.prototype = {
      set: function (t) {
        return (
          M(this.options, t),
          t.touchAction && this.touchAction.update(),
          t.inputTarget &&
            (this.input.destroy(),
            (this.input.target = t.inputTarget),
            this.input.init()),
          this
        );
      },
      stop: function (t) {
        this.session.stopped = t ? 2 : 1;
      },
      recognize: function (t) {
        var e = this.session;
        if (!e.stopped) {
          this.touchAction.preventDefaults(t);
          var i = this.recognizers,
            n = e.curRecognizer;
          (!n || 8 & n.state) && (n = e.curRecognizer = null);
          for (var s = 0; s < i.length; ) {
            var o = i[s];
            2 === e.stopped || (n && o != n && !o.canRecognizeWith(n))
              ? o.reset()
              : o.recognize(t),
              !n && 14 & o.state && (n = e.curRecognizer = o),
              s++;
          }
        }
      },
      get: function (t) {
        if (t instanceof A) return t;
        for (var e = this.recognizers, i = 0; i < e.length; i++)
          if (e[i].options.event == t) return e[i];
        return null;
      },
      add: function (t) {
        var e;
        return i(t, "add", this)
          ? this
          : ((e = this.get(t.options.event)) && this.remove(e),
            this.recognizers.push(t),
            (t.manager = this).touchAction.update(),
            t);
      },
      remove: function (t) {
        var e;
        return (
          i(t, "remove", this) ||
            ((t = this.get(t)) &&
              -1 !== (t = l((e = this.recognizers), t)) &&
              (e.splice(t, 1), this.touchAction.update())),
          this
        );
      },
      on: function (t, e) {
        var i;
        if (t !== u && e !== u)
          return (
            (i = this.handlers),
            r(c(t), function (t) {
              (i[t] = i[t] || []), i[t].push(e);
            }),
            this
          );
      },
      off: function (t, e) {
        var i;
        if (t !== u)
          return (
            (i = this.handlers),
            r(c(t), function (t) {
              e ? i[t] && i[t].splice(l(i[t], e), 1) : delete i[t];
            }),
            this
          );
      },
      emit: function (t, e) {
        this.options.domEvents &&
          ((i = t),
          (n = e),
          (s = X.createEvent("Event")).initEvent(i, !0, !0),
          (s.gesture = n).target.dispatchEvent(s));
        var i,
          n,
          s,
          o = this.handlers[t] && this.handlers[t].slice();
        if (o && o.length)
          for (
            e.type = t,
              e.preventDefault = function () {
                e.srcEvent.preventDefault();
              },
              t = 0;
            t < o.length;

          )
            o[t](e), t++;
      },
      destroy: function () {
        this.element && J(this, !1),
          (this.handlers = {}),
          (this.session = {}),
          this.input.destroy(),
          (this.element = null);
      },
    }),
    M(O, {
      INPUT_START: 1,
      INPUT_MOVE: 2,
      INPUT_END: 4,
      INPUT_CANCEL: 8,
      STATE_POSSIBLE: 1,
      STATE_BEGAN: 2,
      STATE_CHANGED: 4,
      STATE_ENDED: 8,
      STATE_RECOGNIZED: 8,
      STATE_CANCELLED: 16,
      STATE_FAILED: 32,
      DIRECTION_NONE: 1,
      DIRECTION_LEFT: 2,
      DIRECTION_RIGHT: 4,
      DIRECTION_UP: 8,
      DIRECTION_DOWN: 16,
      DIRECTION_HORIZONTAL: 6,
      DIRECTION_VERTICAL: 24,
      DIRECTION_ALL: 30,
      Manager: $,
      Input: d,
      TouchAction: I,
      TouchInput: y,
      MouseInput: g,
      PointerEventInput: T,
      TouchMouseInput: E,
      SingleTouchInput: V,
      Recognizer: A,
      AttrRecognizer: b,
      Tap: D,
      Pan: C,
      Swipe: B,
      Pinch: S,
      Rotate: x,
      Press: P,
      on: e,
      off: h,
      each: r,
      merge: st,
      extend: nt,
      assign: M,
      inherit: t,
      bindFn: n,
      prefixed: f,
    }),
    ((void 0 !== s ? s : "undefined" != typeof self ? self : {}).Hammer = O),
    "function" == typeof define && define.amd
      ? define(function () {
          return O;
        })
      : "undefined" != typeof module && module.exports
      ? (module.exports = O)
      : (s.Hammer = O);
})(window, document);

// jquery.highlight.js
jQuery.extend({
  highlight: function (e, t, n, i) {
    if (3 === e.nodeType) {
      var h,
        r,
        a = e.data.match(t);
      if (a)
        return (
          ((h = document.createElement(n || "span")).className =
            i || "highlight"),
          (r = e.splitText(a.index)).splitText(a[0].length),
          (a = r.cloneNode(!0)),
          h.appendChild(a),
          r.parentNode.replaceChild(h, r),
          1
        );
    } else if (
      1 === e.nodeType &&
      e.childNodes &&
      !/(script|style)/i.test(e.tagName) &&
      (e.tagName !== n.toUpperCase() || e.className !== i)
    )
      for (var s = 0; s < e.childNodes.length; s++)
        s += jQuery.highlight(e.childNodes[s], t, n, i);
    return 0;
  },
}),
  (jQuery.fn.unhighlight = function (e) {
    var t = { className: "highlight", element: "span" };
    return (
      jQuery.extend(t, e),
      this.find(t.element + "." + t.className)
        .each(function () {
          var e = this.parentNode;
          e.replaceChild(this.firstChild, this), e.normalize();
        })
        .end()
    );
  }),
  (jQuery.fn.highlight = function (e, t) {
    var n,
      i = {
        className: "highlight",
        element: "span",
        caseSensitive: !1,
        wordsOnly: !1,
      };
    return (
      jQuery.extend(i, t),
      e.constructor === String && (e = [e]),
      (e = jQuery.grep(e, function (e, t) {
        return "" != e;
      })),
      0 ==
      (e = jQuery.map(e, function (e, t) {
        return e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      })).length
        ? this
        : ((t = i.caseSensitive ? "" : "i"),
          (e = "(" + e.join("|") + ")"),
          i.wordsOnly && (e = "\\b" + e + "\\b"),
          (n = new RegExp(e, t)),
          this.each(function () {
            jQuery.highlight(this, n, i.element, i.className);
          }))
    );
  });

// dataTables.searchHighlight.min.js
((n) => {
  var i, o;
  "function" == typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (t) {
        return n(t, window, document);
      })
    : "object" == typeof exports
    ? ((i = require("jquery")),
      (o = function (t, e) {
        e.fn.dataTable || require("datatables.net")(t, e);
      }),
      "undefined" == typeof window
        ? (module.exports = function (t, e) {
            return (
              (t = t || window), (e = e || i(t)), o(t, e), n(e, 0, t.document)
            );
          })
        : (o(window, i), (module.exports = n(i, window, window.document))))
    : n(jQuery, window, document);
})(function (d, t, e) {
  var a = d.fn.dataTable;
  function h(t, e) {
    t.unhighlight(),
      e.rows({ filter: "applied" }).data().length &&
        (e.columns().every(function () {
          var t = this;
          t
            .nodes()
            .flatten()
            .to$()
            .unhighlight({ className: "column_highlight" }),
            t
              .nodes()
              .flatten()
              .to$()
              .highlight(t.search().trim().split(/\s+/), {
                className: "column_highlight",
              });
        }),
        t.highlight(e.search().trim().split(/\s+/)));
  }
  return (
    d(e).on("init.dt.dth", function (t, e, n) {
      var i, o;
      "dt" === t.namespace &&
        ((i = new a.Api(e)),
        (o = d(i.table().body())),
        d(i.table().node()).hasClass("searchHighlight") ||
          e.oInit.searchHighlight ||
          a.defaults.searchHighlight) &&
        (i
          .on(
            "draw.dt.dth column-visibility.dt.dth column-reorder.dt.dth",
            function () {
              h(o, i);
            }
          )
          .on("destroy", function () {
            i.off("draw.dt.dth column-visibility.dt.dth column-reorder.dt.dth");
          }),
        i.search()) &&
        h(o, i);
    }),
    a
  );
});

// navbar.js
var hmvVersionNo = 4.01;
function getCanonicalUrl() {
  var n = window.location.pathname;
  if ("" === n || "/" === n) return window.location.origin;
  var a = n.split("/").pop();
  return -1 !== a.indexOf(".")
    ? ((a = a.replace(".html", "")),
      (n = n.substring(0, n.lastIndexOf("/"))),
      window.location.origin + n + "/" + a + ".html")
    : window.location.origin + n;
}
var canonicalLink = document.createElement("link");
(canonicalLink.rel = "canonical"),
  (canonicalLink.href = getCanonicalUrl()),
  document.head.appendChild(canonicalLink);
var currentFileName = getCanonicalUrl().split("/").pop().replace(".html", "");
function createNavbar() {
  const n = document.title;
  document.getElementById(
    "navbar-container"
  ).innerHTML = `\n  <nav class="navbar">\n  <div class="navbar-left">\n    <img\n      alt="Site Icon"\n      class="site-icon"\n      onclick="goToHomePage()"\n      src="../img/logo/logo.svg"\n      title="back to homepage"\n    />\n  </div>\n  <div class="navbar-center">\n    <span class="page-title">${n}</span>\n  </div>\n  <div class="navbar-right" title="menu">\n    <span class="menu-icon">☰</span>\n  </div>\n</nav>\n<div class="side-menu" id="sideMenu">\n  <div class="side-menu-close" onclick="toggleSideMenu()">×</div>\n  <ul>\n    <li>\n      <a href="../books/index.html">● މައި ސަފުހާ</a>\n    </li>\n    <li onclick="sideMenutoggleDropdown(this)" class="dropdown">\n      <div class="dropdown-label">\n        <span class="dropdown-arrow">◄</span>ބައިތައް\n      </div>\n      <ul class="dropdown-content">\n        <li onclick="sideMenutoggleDropdown(this,event)" class="sub-dropdown">\n          <div class="dropdown-label">\n            <span class="dropdown-arrow">◄</span>ގުރްއާން\n          </div>\n          <ul class="sub-dropdown-content">\n            <li>\n              <a\n                href="../books/quranHadithmv.html"\n                onclick="changeBook('quranHadithmv'); return false;"\n                >ޙަދީޘްއެމްވީގެ ތަރުޖަމާ</a\n              >\n            </li>\n            <li>\n              <a\n                href="../books/quranRasmee.html"\n                onclick="changeBook('quranRasmee'); return false;"\n                >ރަސްމީ ތަރުޖަމާ</a\n              >\n            </li>\n            <li>\n              <a\n                href="../books/quranBakurube.html"\n                onclick="changeBook('quranBakurube'); return false;"\n                >ބަކުރުބެގެ ތަރުޖަމާ</a\n              >\n            </li>\n            <li>\n              <a\n                href="../books/quranJaufar.html"\n                onclick="changeBook('quranJaufar'); return false;"\n                >ޖަޢުފަރުގެ ގުރްއާން ތަފްސީރު*</a\n              >\n            </li>\n            <li>\n              <a\n                href="../books/quranSoabuni.html"\n                onclick="changeBook('quranSoabuni'); return false;"\n              ></a>\n            </li>\n            <li>\n              <a href="../books/quranUshru.html"\n                >ފަހު ދިހަބައި ކުޅަ އެއްބައިގެ ތަފްސީރު</a\n              >\n            </li>\n          </ul>\n        </li>\n        <li onclick="sideMenutoggleDropdown(this,event)" class="sub-dropdown">\n          <div class="dropdown-label">\n            <span class="dropdown-arrow">◄</span>ޙަދީޘް\n          </div>\n          <ul class="sub-dropdown-content">\n            <li>\n              <a href="../books/allAthar.html"\n                >އެއްކުރަމުންދާ ޙަދީޘާއި އަޘަރު*</a\n              >\n            </li>\n            <li>\n              <a href="../books/muwattaMalik.html">މުވައްޠައު މާލިކު*</a>\n            </li>\n            <li>\n              <a href="../books/umdathulAhkam.html">ޢުމްދަތުލް އަޙްކާމް</a>\n            </li>\n            <li>\n              <a href="../books/hisnulMuslim.html">މުސްލިމުންގެ ކިއްލާ</a>\n            </li>\n            <li>\n              <a href="../books/arbaoonAajurry.html"\n                >އާޖުއްރީގެ ސާޅީސް ޙަދީޘް*</a\n              >\n            </li>\n            <li>\n              <a href="../books/akhbaruShuyukh.html"\n                >ޝައިޚުންގެ ޚަބަރުތަކާއި އެބޭކަލުންގެ އަޚްލާގު</a\n              >\n            </li>\n            <li>\n              <a href="../books/akhlaqHamalathilQuran.html"\n                >އާޖުއްރީގެ ގުރްއާން އުފުލާ މީހުންގެ އަޚްލާގު</a\n              >\n            </li>\n            <li>\n              <a href="../books/bulughulMaram.html">ބުލޫޣުލް މަރާމް*</a>\n            </li>\n            <li>\n              <a href="../books/arbaoonNawawi.html">ނަވަވީގެ ސާޅީސް ޙަދީޘް</a>\n            </li>\n            <li>\n              <a href="../books/riyaduSaliheen.html">ރިޔާޟުއްޞާލިޙީން*</a>\n            </li>\n            <li>\n              <a\n                href="https://archive.org/details/uloomul-hadith-dv-ahmed-faruq-mohamed"\n                target="_blank"\n                >ޙަދީޘް މުސްޠަލަޙު ފަސޭހަކުރުން PDF</a\n              >\n            </li>\n          </ul>\n        </li>\n        <li onclick="sideMenutoggleDropdown(this,event)" class="sub-dropdown">\n          <div class="dropdown-label">\n            <span class="dropdown-arrow">◄</span>އަގީދާ\n          </div>\n          <ul class="sub-dropdown-content">\n            <li>\n              <a href="../books/allAqida.html"\n                >އެއްކުރަމުންދާ އަގީދާގެ ފޮތްތައް</a\n              >\n            </li>\n            <li>\n              <a href="../books/usooluSunnahAhmed.html"\n                >އަޙްމަދުގެ ސުންނަތުގެ އުސޫލުތައް*</a\n              >\n            </li>\n            <li>\n              <a href="../books/sharhuSunnahBarbahari.html"\n                >ބަރްބަހާރީގެ ސުންނަތުގެ ޝަރަހަ*</a\n              >\n            </li>\n            <li>\n              <a href="../books/aqidatuRaziyain.html">ދެ ރާޒީންގެ އަގީދާ*</a>\n            </li>\n            <li>\n              <a href="../books/kitabulEmanAbiUbaid.html"\n                >އަބޫ ޢުބައިދުގެ އީމާންކަމުގެ ފޮތް</a\n              >\n            </li>\n            <li>\n              <a href="../books/intisarLiAshabilHadith.html"\n                >ޙަދީޘްގެ އަސްހާބުންނަށް ނަސްރުދިނުން</a\n              >\n            </li>\n            <li>\n              <a href="../books/nawaqidulIslam.html"\n                >އިސްލާމްކަން ގެއްލޭ ކަންތައް</a\n              >\n            </li>\n            <li>\n              <a href="../books/qawaidulArbau.html">ހަތަރު ގަވާއިދު</a>\n            </li>\n            <li>\n              <a href="../books/usooluSiththa.html">ހަ އުސޫލު*</a>\n            </li>\n            <li>\n              <a href="../books/usooluThalaatha.html">ތިން އުސޫލު</a>\n            </li>\n            <li>\n              <a href="../books/quranUshru.html#quranTable=:p69.html"\n                >މުސްލިމަކަށް މުހިއްމުވާ ހުކުމްތައް</a\n              >\n            </li>\n            <li>\n              <a href="../books/sharhuSunnahBarbahari-DFK.html"\n                >ބަރްބަހާރީގެ ސުންނަތުގެ ޝަރަހަ - DFK</a\n              >\n            </li>\n          </ul>\n        </li>\n        <li onclick="sideMenutoggleDropdown(this,event)" class="sub-dropdown">\n          <div class="dropdown-label">\n            <span class="dropdown-arrow">◄</span>ބަސް\n          </div>\n          <ul class="sub-dropdown-content">\n            <li>\n              <a href="../mauhad/arabic.html">މަދީނާ އަރަބި ފޮތްތައް</a>\n            </li>\n            <li>\n              <a\n                href="../books/radheefAll.html"\n                onclick="changeBook('radheefAll'); return false;"\n                >އެއްކުރަމުންދާ ރަދީފުތައް</a\n              >\n            </li>\n            <li>\n              <a\n                href="../books/radheefRasmee.html"\n                onclick="changeBook('radheefRasmee'); return false;"\n                >ރަސްމީ ރަދީފު</a\n              >\n            </li>\n            <li>\n              <a\n                href="../books/radheefEegaal.html"\n                onclick="changeBook('radheefEegaal'); return false;"\n                >އަލްއީގާޡް</a\n              >\n            </li>\n            <li>\n              <a\n                href="../books/radheefManiku.html"\n                onclick="changeBook('radheefManiku'); return false;"\n                >މަނިކުގެ ރަދީފު</a\n              >\n            </li>\n            <li>\n              <a\n                href="../books/radheefNanfoiy.html"\n                onclick="changeBook('radheefNanfoiy'); return false;"\n                >ނަންފޮތް</a\n              >\n            </li>\n            <li>\n              <a href="../page/lafzuVakikohLiyumugeQawaid.html"\n                >ލަފުޒު ވަކިކޮށް ލިޔުމުގެ ގަވާއިދު (ދިވެހި)</a\n              >\n            </li>\n          </ul>\n        </li>\n        <li>\n          <a href="../page/textEditor.html">ޓެކްސްޓު އެޑިޓަރ</a>\n        </li>\n      </ul>\n    </li>\n    <li>\n      <a href="../page/contact.html">ކުށެއް/ހިޔާލެއް ހުށަހެޅުމަށް</a>\n    </li>\n    <li>\n      <a href="../page/supportHadithmv.html">ތަރުޖަމާގައި އެހީވެދިނުމަށް</a>\n    </li>\n    <li>\n      <a href="../page/FAQ.html">ތަކުރާރުކޮށް ކުރެވޭ ސުވާލުތައް</a>\n    </li>\n    <li>\n      <a href="../page/contributorsList.html">އެހީތެރިން</a>\n    </li>\n    <li onclick="openDiv()" class="versionNo">⚙️ އިސްދާރު: v${hmvVersionNo}</li>\n    <li>\n      <a href="https://t.me/ashraafmv"\n        >ފަރުމާ ކުރީ: އަބޫ ޔަޙްޔާ، މުޙައްމަދު އަޝްރާފު އިބްރާހީމް</a\n      >\n    </li>\n    <li style="font-size: 90%">މަދީނާގެ ޙަދީޘް ކުއްލިއްޔާގެ ދަރިވަރެއް</li>\n    <li\n      onclick='window.scrollTo({top:0,behavior:"smooth"})'\n      href="#"\n      style="cursor: pointer; user-select: none"\n    >\n      ▲ މައްޗަށް ސްކްރޯލްކުރޭ\n    </li>\n    <li onclick="sideMenutoggleDropdown(this)" class="dropdown">\n      <div class="dropdown-label">\n        <span class="dropdown-arrow">◄</span>↺ ސަފުހާ\n      </div>\n\n      <ul class="dropdown-content">\n        <li>\n          <a href="#" onclick="window.location.reload()">މަޑު ރީލޯޑު</a>\n        </li>\n        <li>\n          <a\n            href="#"\n            onclick='window.location.href=window.location.href.split(".html")[0]+".html"'\n            >ހަރު ރީލޯޑު</a\n          >\n        </li>\n      </ul>\n    </li>\n  </ul>\n</div>\n`;
}
function goToHomePage() {
  window.location.href = "../books/index.html";
}
function toggleSideMenu() {
  document.getElementById("sideMenu").classList.toggle("open");
}
function sideMenutoggleDropdown(n, a) {
  a && a.stopPropagation(),
    (a = n.querySelector(
      ".dropdown-content, .sub-dropdown-content, .sub-sub-dropdown-content"
    ));
  var o = n.querySelector(".dropdown-arrow");
  a &&
    (a.classList.toggle("show"),
    (o.style.transform = a.classList.contains("show") ? "rotate(-90deg)" : "")),
    (a = n.parentElement.children);
  for (let l of a)
    l !== n &&
      ((a = l.querySelector(
        ".dropdown-content, .sub-dropdown-content, .sub-sub-dropdown-content"
      )),
      (o = l.querySelector(".dropdown-arrow")),
      a && (a.classList.remove("show"), (o.style.transform = "")));
}
document.addEventListener("DOMContentLoaded", createNavbar),
  document.addEventListener("click", function (n) {
    var a = document.querySelector(".navbar");
    const o = document.getElementById("sideMenu");
    a = a.contains(n.target);
    const l = o.contains(n.target),
      e = n.target.classList.contains("site-icon");
    (n.target.classList.contains("menu-icon") ||
      (a && !e) ||
      (!l && o.classList.contains("open"))) &&
      toggleSideMenu();
  }),
  document.addEventListener("DOMContentLoaded", function () {
    let n = 0;
    const a = document.querySelector(".navbar");
    let o = 0;
    window.matchMedia("(max-width: 599px)").matches &&
      window.addEventListener(
        "scroll",
        (function (n, a) {
          let o;
          return function () {
            const l = arguments;
            o || (n.apply(this, l), (o = !0), setTimeout(() => (o = !1), a));
          };
        })(function () {
          if (a) {
            var l = window.pageYOffset || document.documentElement.scrollTop;
            50 >= l
              ? (a.classList.remove("navbar-hidden"), (o = 0))
              : l > n
              ? (a.classList.add("navbar-hidden"), (o = 0))
              : ((o += n - l),
                200 < o && (a.classList.remove("navbar-hidden"), (o = 0))),
              (n = 0 >= l ? 0 : l);
          }
        }, 100)
      );
  });

// DT-inline.js
let isMobile = 800 >= window.innerWidth;
function removeThashkeel(e) {
  return e.replace(/[َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ|~|⁽|⁾|¹²³⁴⁵⁶⁷⁸⁹⁰]/g, "");
}
let tashkeelRemoved = !1,
  originalData = [];
function toggleTashkeel() {
  tashkeelRemoved = !tashkeelRemoved;
  const e = table.page();
  if (tashkeelRemoved) {
    const e = originalData.map((e) =>
      e.map((e) => ("string" == typeof e ? removeThashkeel(e) : e))
    );
    table.clear().rows.add(e).draw(!1),
      (document.getElementById("toggleFiliButton").textContent =
        " ފިލިތައް ދައްކާ ");
  } else
    table.clear().rows.add(originalData).draw(!1),
      (document.getElementById("toggleFiliButton").textContent =
        " ފިލިތައް ފޮރުވާ ");
  table.page(e).draw("page");
}
function removeSmallishFootnotes(e) {
  return e.replace(/[⁽|⁾|¹²³⁴⁵⁶⁷⁸⁹⁰]/g, "");
}
function copyURLToClipButton() {
  let e = document.createElement("textarea");
  document.body.appendChild(e),
    (e.value = window.location.href),
    (e.value = e.value
      .replace(/^.*\/books\//, "https://hadithmv.github.io/books/")
      .replace(/^.*\/uc\//, "https://hadithmv.github.io/books/")),
    e.select(),
    document.execCommand("copy"),
    document.body.removeChild(e);
  let t = document.getElementById("copyPageLink"),
    a = t.innerHTML;
  window.getComputedStyle(t),
    (t.style.width = t.offsetWidth + "px"),
    (t.style.textAlign = "center"),
    (t.innerHTML = "📋 ކޮޕީ ވެއްޖެ"),
    setTimeout(function () {
      (t.innerHTML = a), (t.style.width = "");
    }, 1e3);
}
function scrollUpTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function changeBook(e) {
  let t,
    a,
    n = window.location.toString();
  if (e.startsWith("quran"))
    (a = "quran"),
      (t =
        /quranHadithmv|quranBakurube|quranJaufar|quranSoabuni|quranRasmee|quranUshru/g);
  else {
    if (!e.startsWith("radheef"))
      return void console.error("Invalid book type");
    (a = "radheef"),
      (t =
        /radheefAll|radheefRasmee|radheefEegaal|radheefManiku|radheefNanfoiy/g);
  }
  n.includes(a) || n.includes("quranUshru")
    ? n.includes("quranUshru") && "quranUshru" !== e
      ? ((e = n.replace("quranUshru", e).split("#")[0]),
        (window.location = e.endsWith(".html") ? e : e + ".html"))
      : (window.location = n.replace(t, e).replace(/:v.*$/, ""))
    : (window.location =
        window.location.origin +
        window.location.pathname.replace(/[^\/]*$/, e + ".html"));
}
let table,
  columnDefsconfig = [
    {
      targets: "_all",
      searchPanes: { show: !1 },
      render: function (e, t, a) {
        return e.replace(/(\r\n|\n|\r)+/g, '\t<br class="dtBr">');
      },
    },
  ],
  DTconfig = {
    keys: !isMobile,
    keepConditions: !0,
    layout: {
      top: [
        "search",
        "inputPaging",
        "search",
        {
          buttons: [
            {
              extend: "copy",
              key: { key: "c", altKey: !0 },
              titleAttr: "copy",
              text: "⧉ ކޮޕީ",
              footer: !1,
              header: !1,
              fieldSeparator: "\n\n",
              exportOptions: {
                columns: ":visible",
                modifier: { page: "current" },
              },
              customize: function (e) {
                e = (e = (e = (e = e.replace(/\r\n|\n|\r/g, "\n")).replace(
                  /\t/g,
                  "\n\n"
                )).replace(/\n{3,}/g, "\n\n")).split("\n");
                var t = currentSurah,
                  a = arabicSurahNames[t],
                  n = [
                    "ترجمة حديث أم وي – ޙަދީޘްއެމްވީ ގުރްއާން ތަރުޖަމާ",
                    "الترجمة الرسمية – ރަސްމީ ގުރްއާން ތަރުޖަމާ",
                    "التفسير الواضح الميسر – ޞާބޫނީގެ ތަފްސީރު",
                  ];
                let o = (e = (e = e.map(function (e) {
                  return n.includes(e.trim()) ? `${t} ${a}` : e;
                })).join("\n")).split("\n\nـــــــــــــــــــــــــــ\n\n");
                return (
                  1 < o.length &&
                    ((o[1] = o[1].replace(/\n\n/g, "\n")),
                    (o[1] = o[1].replace(/\n$/, "\n\n")),
                    (e = o[0] + "\n\nـــــــــــــــــــــــــــ\n" + o[1])),
                  e
                );
              },
            },
            {
              extend: "collection",
              key: { key: "m", altKey: !0 },
              text: "⌥ އިތުރު",
              background: !1,
              buttons: [
                {
                  extend: "colvis",
                  key: { key: "s", altKey: !0 },
                  text: "☰ ދައްކާ/ފޮރުވާ",
                  background: !1,
                  postfixButtons: [
                    {
                      extend: "colvisGroup",
                      text: "ހުރިހާ ދައްކާ &nbsp; +",
                      show: ":hidden",
                      titleAttr: "show all",
                    },
                    {
                      extend: "colvisRestore",
                      text: "ރީސެޓްކުރޭ &nbsp; ↺",
                      titleAttr: "reset toggle",
                    },
                  ],
                },
                {
                  extend: "searchBuilder",
                  key: { key: "b", altKey: !0 },
                  titleAttr: "custom search",
                },
                {
                  extend: "searchPanes",
                  key: { key: "v", altKey: !0 },
                  config: {
                    cascadePanes: !0,
                    viewTotal: !0,
                    collapse: !1,
                    dtOpts: { select: { style: "multi+shift" } },
                  },
                },
                {
                  extend: "pageLength",
                  key: { key: "p", altKey: !0 },
                  background: !1,
                },
              ],
            },
          ],
        },
      ],
      bottom: ["inputPaging", "info"],
    },
  };
(DataTable.defaults.layout = {
  topStart: null,
  topEnd: null,
  bottomStart: null,
  bottomEnd: null,
}),
  Object.assign(DataTable.defaults, {
    language: {
      emptyTable: "— ނުފެނުނު —",
      info: "_TOTAL_ ގެ ތެރެއިން _START_ އިން _END_ އަށް",
      infoFiltered: "(ޖުމްލަ ބެލުނީ _MAX_)",
      infoEmpty: "— ނުފެނުނު —",
      loadingRecords: "ތައްޔާރުވަނީ...",
      search: "",
      searchPlaceholder: 'ސީދާ ލަފްޒު "މިހެން ހޯދާ"، !މިލަފްޒު ނުލާ ހޯދާ',
      zeroRecords: "— ނުފެނުނު —",
      paginate: { first: "<< ", last: " >>", next: " >", previous: "< " },
      entries: { _: "", 1: "" },
      buttons: {
        pageLength: { _: "%d ބަރި ދައްކާ", "-1": "ހުރިހާ" },
        copyTitle: "&nbsp; ކޮޕީ 📋",
        copySuccess: { 1: "1 ކޮޕީވެއްޖެ", _: "%d ކޮޕީވެއްޖެ" },
      },
      searchBuilder: {
        button: "🔍 ކަސްޓަމް ސާޗް",
        add: "+ އިތުރުކުރޭ",
        condition: "ޝަރުތު",
        clearAll: "ރީސެޓް",
        data: "ބަރި",
        logicAnd: "އަދި &",
        logicOr: "ނޫނީ |",
        title: { 0: "ސާޗް ޝަރުތުތައް", _: "ސާޗް ޝަރުތުތައް (%d)" },
        value: "ލިޔުން",
        valueJoiner: "އަދި",
      },
      searchPanes: {
        collapse: { 0: "⧩ ބަރި ފިލްޓާ", _: "⧩ ބަރި ފިލްޓާ (%d)" },
        title: {
          _: "%d ފިލްޓާ ކުރެވިފާ",
          0: "0 ފިލްޓާ ކުރެވިފާ",
          1: "1 ފިލްޓާ ކުރެވިފާ",
        },
        count: "{total}",
        countFiltered: "{shown} ({total})",
        emptyMessage: "— ވަކި އެއްޗެއް ނުޖަހާ —",
        clearMessage: "ފިލްޓާތައް ދުއްވާލާ",
      },
    },
    stateSave: !0,
    stateDuration: 86400,
    ordering: !1,
    orderClasses: !1,
    searchDelay: 350,
    autoWidth: !1,
    mark: {
      ignorePunctuation: ["ًٌٍَُِّْٕٖٜٟٗ٘ٙٚٛٝٞ"],
      synonyms: {
        أ: "ا",
        آ: "ا",
        إ: "ا",
        ٱ: "ا",
        ؤ: "و",
        ة: "ه",
        ئ: "ى",
        ޘ: "ސ",
        ޙ: "ހ",
        ޛ: "ޒ",
        ޜ: "ޒ",
        ޞ: "ސ",
        ޠ: "ތ",
        ޡ: "ޒ",
        ޢ: "އ",
        ޤ: "ގ",
        ޥ: "ވ",
      },
    },
    lengthMenu: [1, 2, 3, 4, 5, 10, 20, 30, 40, 50],
    displayLength: 1,
  }),
  (table = new DataTable("#tableID", { ...DTconfig })),
  $(function () {
    "undefined" != typeof DataTable &&
      DataTable.util.diacritics(function (e, t) {
        if ("string" != typeof e) return e;
        var a = e
          .normalize("NFD")
          .replace(/[أآإٱ]/g, "ا")
          .replace("ؤ", "و")
          .replace(/ة/g, "ه")
          .replace(/[\u064B-\u065F]/g, "")
          .replace("ئ", "ى")
          .replace(/ޘ/g, "ސ")
          .replace(/ޙ/g, "ހ")
          .replace(/ޛ/g, "ޒ")
          .replace(/ޜ/g, "ޒ")
          .replace(/ޞ/g, "ސ")
          .replace(/ޠ/g, "ތ")
          .replace(/ޡ/g, "ޒ")
          .replace(/ޢ/g, "އ")
          .replace(/ޤ/g, "ގ")
          .replace(/ޥ/g, "ވ");
        return a.length !== e.length
          ? (!0 === t ? e + " " : "") + a.replace(/[\u0300-\u036f]/g, "")
          : a;
      });
  }),
  document.addEventListener("DOMContentLoaded", function () {
    isMobile
      ? (table.on("page", function () {
          document
            .querySelector("tbody tr")
            .scrollIntoView({ behavior: "smooth" });
        }),
        delete Hammer.defaults.cssProps.userSelect,
        Hammer(document.querySelector(".dataTable")).on(
          "swipeleft",
          function () {
            table.page("previous").draw("page");
          }
        ),
        Hammer(document.querySelector(".dataTable")).on(
          "swiperight",
          function () {
            table.page("next").draw("page");
          }
        ))
      : ($("div.dt-search .dt-input").focus(),
        table.on("page", function () {
          window.scrollTo({ top: 0, behavior: "smooth" });
        })),
      $(".dt-paging-input input")
        .prop("type", "search")
        .attr("placeholder", "ސަފުހާ"),
      $("tbody").on("dblclick", "tr", function () {
        "" !== table.search() && table.search("").draw();
        var e = table.row(this).index();
        if (void 0 !== e) {
          var t = table.page.info();
          table.page(Math.floor(e / t.length)).draw(!1),
            (e = table.row(e).node()) &&
              e.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
  });

// belowPage-bab-dropdown.js
document.addEventListener("DOMContentLoaded", function () {
  const t = document.querySelector(".belowPage-bab-dropdown");
  if (t) {
    t.addEventListener("click", function (e) {
      if ((e.preventDefault(), "A" === (e = e.target).tagName)) {
        const o = e.parentElement;
        e.classList.contains("open-all")
          ? (function (t) {
              t.querySelectorAll("li").forEach((t) => {
                t.querySelector("ul") && t.classList.add("active");
              });
            })(t)
          : e.classList.contains("collapse-all")
          ? (function (t) {
              t.querySelectorAll("li > ul > li.active").forEach((t) => {
                t.classList.remove("active");
              });
            })(t)
          : o.querySelector("ul")
          ? o.classList.toggle("active")
          : e.hasAttribute("data-value") &&
            ((e = e.getAttribute("data-value")),
            (window.location.hash = "#tableID=l1:p" + e),
            window.scrollTo({ top: 0, behavior: "smooth" }),
            setTimeout(() => {
              location.reload();
            }, 150));
      }
    });
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// quran-navigation-list.js
const baseJsonUrl = "../js/json/",
  arabicDigits = {
    0: "٠",
    1: "١",
    2: "٢",
    3: "٣",
    4: "٤",
    5: "٥",
    6: "٦",
    7: "٧",
    8: "٨",
    9: "٩",
  },
  ayahCounts = {
    1: 7,
    2: 286,
    3: 200,
    4: 176,
    5: 120,
    6: 165,
    7: 206,
    8: 75,
    9: 129,
    10: 109,
    11: 123,
    12: 111,
    13: 43,
    14: 52,
    15: 99,
    16: 128,
    17: 111,
    18: 110,
    19: 98,
    20: 135,
    21: 112,
    22: 78,
    23: 118,
    24: 64,
    25: 77,
    26: 227,
    27: 93,
    28: 88,
    29: 69,
    30: 60,
    31: 34,
    32: 30,
    33: 73,
    34: 54,
    35: 45,
    36: 83,
    37: 182,
    38: 88,
    39: 75,
    40: 85,
    41: 54,
    42: 53,
    43: 89,
    44: 59,
    45: 37,
    46: 35,
    47: 38,
    48: 29,
    49: 18,
    50: 45,
    51: 60,
    52: 49,
    53: 62,
    54: 55,
    55: 78,
    56: 96,
    57: 29,
    58: 22,
    59: 24,
    60: 13,
    61: 14,
    62: 11,
    63: 11,
    64: 18,
    65: 12,
    66: 12,
    67: 30,
    68: 52,
    69: 52,
    70: 44,
    71: 28,
    72: 28,
    73: 20,
    74: 56,
    75: 40,
    76: 31,
    77: 50,
    78: 40,
    79: 46,
    80: 42,
    81: 29,
    82: 19,
    83: 36,
    84: 25,
    85: 22,
    86: 17,
    87: 19,
    88: 26,
    89: 30,
    90: 20,
    91: 15,
    92: 21,
    93: 11,
    94: 8,
    95: 8,
    96: 19,
    97: 5,
    98: 8,
    99: 8,
    100: 11,
    101: 11,
    102: 8,
    103: 3,
    104: 9,
    105: 5,
    106: 4,
    107: 7,
    108: 3,
    109: 6,
    110: 3,
    111: 5,
    112: 4,
    113: 5,
    114: 6,
  },
  arabicSurahNames = {
    1: "الفَاتِحَة",
    2: "البَقَرَة",
    3: "آل عِمرَان",
    4: "النِّسَاء",
    5: "المَائِدَة",
    6: "الأَنعَام",
    7: "الأَعرَاف",
    8: "الأَنفَال",
    9: "التَّوبَة",
    10: "يُونُس",
    11: "هُود",
    12: "يُوسُف",
    13: "الرَّعد",
    14: "إِبرَاهِيم",
    15: "الحِجر",
    16: "النَّحل",
    17: "الإِسرَاء",
    18: "الكَهف",
    19: "مَريَم",
    20: "طه",
    21: "الأَنبِيَاء",
    22: "الحَجّ",
    23: "المُؤمِنُون",
    24: "النُّور",
    25: "الفُرقَان",
    26: "الشُّعَرَاء",
    27: "النَّمل",
    28: "القَصَص",
    29: "العَنكَبُوت",
    30: "الرُّوم",
    31: "لُقمَان",
    32: "السَّجدَة",
    33: "الأَحزَاب",
    34: "سَبَإ",
    35: "فَاطِر",
    36: "يسٓ",
    37: "الصَّافَّات",
    38: "صٓ",
    39: "الزُّمَر",
    40: "غَافِر",
    41: "فُصِّلَت",
    42: "الشُّورَى",
    43: "الزُّخرُف",
    44: "الدُّخَان",
    45: "الجَاثِيَة",
    46: "الأَحقَاف",
    47: "مُحَمَّد",
    48: "الفَتح",
    49: "الحُجُرَات",
    50: "قٓ",
    51: "الذَّارِيَات",
    52: "الطُّور",
    53: "النَّجم",
    54: "القَمَر",
    55: "الرَّحمٰن",
    56: "الوَاقِعَة",
    57: "الحَدِيد",
    58: "المُجَادِلَة",
    59: "الحَشر",
    60: "المُمتَحَنَة",
    61: "الصَّف",
    62: "الجُمعَة",
    63: "المُنَافِقُون",
    64: "التَّغَابُن",
    65: "الطَّلَاق",
    66: "التَّحرِيم",
    67: "المُلك",
    68: "القَلَم",
    69: "الحَاقَّة",
    70: "المَعَارِج",
    71: "نُوح",
    72: "الجِنّ",
    73: "المُزَّمِّل",
    74: "المُدَّثِّر",
    75: "القِيَامَة",
    76: "الإِنسَان",
    77: "المُرسَلَات",
    78: "النَّبَإ",
    79: "النَّازِعَات",
    80: "عَبَس",
    81: "التَّكوِير",
    82: "الانفِطَار",
    83: "المُطَفِّفِين",
    84: "الانشِقَاق",
    85: "البُرُوج",
    86: "الطَّارِق",
    87: "الأَعلَى",
    88: "الغَاشِيَة",
    89: "الفَجر",
    90: "البَلَد",
    91: "الشَّمس",
    92: "اللَّيل",
    93: "الضُّحَى",
    94: "الشَّرح",
    95: "التِّين",
    96: "العَلَق",
    97: "القَدر",
    98: "البَيِّنَة",
    99: "الزَّلزَلَة",
    100: "العَادِيَات",
    101: "القَارِعَة",
    102: "التَّكَاثُر",
    103: "العَصر",
    104: "الهُمَزَة",
    105: "الفِيل",
    106: "قُرَيش",
    107: "المَاعُون",
    108: "الكَوثَر",
    109: "الكَافِرُون",
    110: "النَّصر",
    111: "المَسَد",
    112: "الإِخلَاص",
    113: "الفَلَق",
    114: "النَّاس",
  },
  dhivehiSurahNames = {
    1: "ފާތިޙާ",
    2: "ބަގަރާ",
    3: "އާލްޢިމްރާން",
    4: "ނިސާ",
    5: "މާއިދާ",
    6: "އަންޢާމް",
    7: "އަޢްރާފް",
    8: "އަންފާލް",
    9: "ތައުބާ",
    10: "ޔޫނުސް",
    11: "ހޫދު",
    12: "ޔޫސުފް",
    13: "ރަޢްދު",
    14: "އިބްރާހީމް",
    15: "ޙިޖްރު",
    16: "ނަޙްލު",
    17: "އިސްރާ",
    18: "ކަހްފު",
    19: "މަރްޔަމް",
    20: "ޠާހާ",
    21: "އަންބިޔާ",
    22: "ޙައްޖު",
    23: "މުއުމިނޫން",
    24: "ނޫރު",
    25: "ފުރްގާން",
    26: "ޝުޢަރާ",
    27: "ނަމްލު",
    28: "ގަޞަޞް",
    29: "ޢަންކަބޫތު",
    30: "ރޫމް",
    31: "ލުގްމާން",
    32: "ސަޖްދާ",
    33: "އަޙްޒާބް",
    34: "ސަބަޢު",
    35: "ފާޠިރު",
    36: "ޔާސީން",
    37: "ޞާއްފާތު",
    38: "ޞާދު",
    39: "ޒުމަރު",
    40: "ޣާފިރު",
    41: "ފުއްޞިލަތް",
    42: "ޝޫރާ",
    43: "ޒުޚްރުފް",
    44: "ދުޚާން",
    45: "ޖާޘިޔާ",
    46: "އަޙްގާފް",
    47: "މުޙައްމަދު",
    48: "ފަތްޙު",
    49: "ޙުޖުރާތު",
    50: "ގާފް",
    51: "ޛާރިޔާތު",
    52: "ޠޫރު",
    53: "ނަޖްމު",
    54: "ގަމަރު",
    55: "ރަޙްމާން",
    56: "ވާގިޢާ",
    57: "ޙަދީދު",
    58: "މުޖާދަލާ",
    59: "ޙަޝްރު",
    60: "މުމްތަޙިނާ",
    61: "ޞައްފު",
    62: "ޖުމުޢާ",
    63: "މުނާފިގޫން",
    64: "ތަޣާބުން",
    65: "ޠަލާގު",
    66: "ތަޙްރީމް",
    67: "މުލްކު",
    68: "ގަލަމް",
    69: "ޙާއްގާ",
    70: "މަޢާރިޖު",
    71: "ނޫޙު",
    72: "ޖިންނު",
    73: "މުއްޒައްމިލު",
    74: "މުއްދައްޘިރު",
    75: "ގިޔާމާ",
    76: "އިންސާން",
    77: "މުރްސަލާތު",
    78: "ނަބަޢު",
    79: "ނާޒިޢާތު",
    80: "ޢަބަސަ",
    81: "ތަކްވީރު",
    82: "އިންފިޠާރު",
    83: "މުޠައްފިފީން",
    84: "އިންޝިގާގު",
    85: "ބުރޫޖު",
    86: "ޠާރިގު",
    87: "އަޢުލާ",
    88: "ޣާޝިޔާ",
    89: "ފަޖްރު",
    90: "ބަލަދު",
    91: "ޝަމްސު",
    92: "ލައިލު",
    93: "ޟުޙާ",
    94: "ޝަރްޙު",
    95: "ތީން",
    96: "ޢަލަގު",
    97: "ގަދްރު",
    98: "ބައްޔިނާ",
    99: "ޒަލްޒަލާ",
    100: "ޢާދިޔާތު",
    101: "ގާރިޢާ",
    102: "ތަކާޘުރު",
    103: "ޢަޞްރު",
    104: "ހުމަޒާ",
    105: "ފީލު",
    106: "ގުރައިޝް",
    107: "މާޢޫން",
    108: "ކައުޘަރު",
    109: "ކާފިރޫން",
    110: "ނަޞްރު",
    111: "މަސަދު",
    112: "އިޚްލާޞް",
    113: "ފަލަގު",
    114: "ނާސް",
  },
  englishSurahNames = {
    1: "Fatihah",
    2: "Baqarah",
    3: "AalImran",
    4: "Nisa",
    5: "Maidah",
    6: "An'am",
    7: "A'raf",
    8: "Anfal",
    9: "Taubah",
    10: "Yunus",
    11: "Hud",
    12: "Yusuf",
    13: "Ra'd",
    14: "Ibrahim",
    15: "Hijr",
    16: "Nahl",
    17: "Isra",
    18: "Kahf",
    19: "Maryam",
    20: "Taha",
    21: "Anbiya",
    22: "Hajj",
    23: "Muminun",
    24: "Nur",
    25: "Furqan",
    26: "Shu'ara",
    27: "Naml",
    28: "Qasas",
    29: "Ankabut",
    30: "Rum",
    31: "Luqman",
    32: "Sajdah",
    33: "Ahzab",
    34: "Saba",
    35: "Fatir",
    36: "Ya Seen",
    37: "Saffat",
    38: "Sad",
    39: "Zumar",
    40: "Ghafir",
    41: "Fussilat",
    42: "Shura",
    43: "Zukhruf",
    44: "Dukhan",
    45: "Jathiyah",
    46: "Ahqaf",
    47: "Muhammad",
    48: "Fath",
    49: "Hujurat",
    50: "Qaf",
    51: "Dhariyat",
    52: "Tur",
    53: "Najm",
    54: "Qamar",
    55: "Rahman",
    56: "Waqiah",
    57: "Hadid",
    58: "Mujadilah",
    59: "Hashr",
    60: "Mumtahanah",
    61: "Saff",
    62: "Jumu'ah",
    63: "Munafiqun",
    64: "Taghabun",
    65: "Talaq",
    66: "Tahrim",
    67: "Mulk",
    68: "Qalam",
    69: "Haqqah",
    70: "Ma'arij",
    71: "Nuh",
    72: "Jinn",
    73: "Muzzammil",
    74: "Muddaththir",
    75: "Qiyamah",
    76: "Insan",
    77: "Mursalat",
    78: "Naba",
    79: "Nazi'at",
    80: "'Abasa",
    81: "Takwir",
    82: "Infitar",
    83: "Mutaffifin",
    84: "Inshiqaq",
    85: "Buruj",
    86: "Tariq",
    87: "A'la",
    88: "Ghashiyah",
    89: "Fajr",
    90: "Balad",
    91: "Shams",
    92: "Lail",
    93: "Dhuha",
    94: "Sharh",
    95: "Theen",
    96: "'Alaq",
    97: "Qadr",
    98: "Bayyinah",
    99: "Zalzalah",
    100: "'Adiyat",
    101: "Qari'ah",
    102: "Takathur",
    103: "'Asr",
    104: "Humazah",
    105: "Feel",
    106: "Quraish",
    107: "Ma'un",
    108: "Kauthar",
    109: "Kafirun",
    110: "Nasr",
    111: "Masad",
    112: "Ikhlas",
    113: "Falaq",
    114: "Nas",
  },
  maxSurah = 114,
  maxJuz = 30,
  baseColumns = [
    { data: "0", title: "ޖުޒް", visible: !1 },
    { data: "1", title: "ސޫރަތް", visible: !1 },
    { data: "2", title: "އާޔަތް #", visible: !1 },
    { data: "3", title: "ބިސްމި", visible: !0 },
    {
      data: "4",
      title: "އާޔަތް (އިމްލާއީ)",
      visible: !0,
      render: function (a, e, t) {
        return replaceDigitsWithArabic(
          (a =
            "﴿" +
            (a = a.replace(/\s([\u0660-\u0669]+)/, " ")) +
            " " +
            t[2] +
            "﴾")
        );
      },
    },
    {
      data: "5",
      title: "ރަސްމު އުޘްމާނީ",
      visible: !1,
      render: function (a, e, t) {
        return replaceDigitsWithArabic(
          (a =
            "﴿" +
            (a = a.replace(/\s([\u0660-\u0669]+)/, " ")) +
            " " +
            t[2] +
            "﴾")
        );
      },
    },
  ],
  additionalJsons = [
    { name: "quranHadithmv", columns: [0], title: "ޙަދީޘްއެމްވީ ތަރުޖަމާ:" },
    { name: "quranRasmee", columns: [0, 1], title: "ރަސްމީ ތަރުޖަމާ:" },
    { name: "quranBakurube", columns: [0, 1], title: "ބަކުރުބެ ތަރުޖަމާ:" },
    { name: "quranJaufar", columns: [0, 1], title: "ޖަޢުފަރު ތަފްސީރު:" },
    { name: "quranSoabuni", columns: [0, 1, 3, 4], title: "ޞ ތަފްސީރު:" },
    { name: "quranMukhtasar", columns: [0], title: "مختصر التفسير:" },
    { name: "quranMuyassar", columns: [0], title: "التفسير الميسر:" },
  ],
  defaultAdditionalJson = currentFileName;
let currentSurah = 1,
  currentAyah = 1,
  currentJuz = 1,
  currentFocus = -1,
  additionalColumns = [],
  translationStates = {},
  initialTranslationStates = {},
  lastFocusedItems = { surah: -1, ayah: -1, juz: -1 },
  searchInputValues = { surah: "", ayah: "", juz: "" };
function replaceDigitsWithArabic(a) {
  return a.replace(/[0-9]/g, function (a) {
    return arabicDigits[a];
  });
}
function removeDiacritics(a) {
  return a.replace(/[َُِّْٰۡۚٓـًٌٍّٔ]/g, "");
}
function cleanSurahText(a) {
  return removeDiacritics(a)
    .replace(/سورة\s*/, "")
    .trim();
}
function QtoggleDropdown(a) {
  var e = $(`#${a}Dropdown`);
  if (($(".q-dropdown").not(e).hide(), e.toggle(), e.is(":visible"))) {
    var t = parseInt($(`#${a}Value`).text());
    const n = e.find(".q-dropdown-item");
    (t = n.filter(`[data-value="${t}"]`)).length
      ? ((currentFocus = n.index(t)),
        (lastFocusedItems[a] = currentFocus),
        addActive(n),
        t[0].scrollIntoView({ block: "center" }))
      : ((currentFocus =
          void 0 !== lastFocusedItems[a] ? lastFocusedItems[a] : 0),
        (-1 === currentFocus || currentFocus >= n.length) && (currentFocus = 0),
        addActive(n)),
      (e = e.find(".q-dropdown-search")).val(searchInputValues[a]).focus(),
      e.trigger("input");
  }
}
function QnavigateArrow(a, e) {
  if ("surah" === a)
    var t = currentSurah,
      n = 114;
  else
    "ayah" === a
      ? ((t = currentAyah), (n = ayahCounts[currentSurah] || 1))
      : "juz" === a && ((t = currentJuz), (n = 30));
  "prev" === e
    ? 1 > --t &&
      ("ayah" === a
        ? (currentSurah--,
          1 > currentSurah && (currentSurah = 114),
          updateAyahDropdown(),
          (t = ayahCounts[currentSurah] || 1))
        : (t = n))
    : ++t > n &&
      ("ayah" === a &&
        (currentSurah++,
        currentSurah > 114 && (currentSurah = 1),
        updateAyahDropdown()),
      (t = 1)),
    updateQValue(a, t);
}
function navigateToVerse() {
  const a = table
    .rows()
    .indexes()
    .filter(
      (a) => (
        (a = table.row(a).data()),
        null !== currentJuz
          ? parseInt(a[0]) === currentJuz
          : null !== currentSurah &&
            null !== currentAyah &&
            parseInt(a[1]) === currentSurah &&
            parseInt(a[2]) === currentAyah
      )
    );
  if (0 < a.length) {
    var e = table.page.info();
    table.page(Math.floor(a[0] / e.length)).draw(!1),
      (e = table.row(a[0]).node()) &&
        e.scrollIntoView({ behavior: "smooth", block: "center" }),
      updateAllQValues(table.row(a[0]).data());
  }
}
function updateQValue(a, e) {
  e = parseInt(e);
  const t = $(`#${a}Value`);
  switch (a) {
    case "surah":
      t.text(`${e} ${arabicSurahNames[e]}`),
        (currentSurah = e),
        (currentAyah = 1),
        initializeQDropdown("ayah", 1, ayahCounts[currentSurah]),
        $("#ayahValue").text(currentAyah),
        (currentJuz = null);
      break;
    case "ayah":
      (currentAyah = e), t.text(e), (currentJuz = null);
      break;
    case "juz":
      (currentJuz = e), t.text(e), (currentAyah = currentSurah = null);
  }
  navigateToVerse(),
    (a = $(`#${a}Dropdown`).find(".q-dropdown-item")),
    (currentFocus = a.index(a.filter(`[data-value="${e}"]`)));
}
function updateAllQValues(a) {
  (currentJuz = parseInt(a[0])),
    (currentSurah = parseInt(a[1])),
    (currentAyah = parseInt(a[2])),
    $("#juzValue").text(currentJuz),
    $("#surahValue").text(`${currentSurah} ${arabicSurahNames[currentSurah]}`),
    $("#ayahValue").text(currentAyah);
}
function updateAyahDropdown() {
  initializeQDropdown("ayah", 1, ayahCounts[currentSurah] || 1),
    $("#ayahValue").text("1");
}
function initializeQDropdown(a, e, t) {
  const n = $(`#${a}Dropdown`);
  for (
    n.empty(),
      n.append(
        '<input type="text" class="q-dropdown-search" placeholder="ލިޔޭ ނޫނީ ތިރިއަށް ފިތާ">'
      ),
      "ayah" === a && (t = ayahCounts[currentSurah]);
    e <= t;
    e++
  ) {
    let t = e;
    "surah" === a &&
      (t = `${e} ${arabicSurahNames[e]} ${dhivehiSurahNames[e]} ${englishSurahNames[e]}`),
      n.append(`<div class="q-dropdown-item" data-value="${e}">${t}</div>`);
  }
  n.on("click", ".q-dropdown-item", function () {
    const e = $(this).data("value");
    updateQValue(a, e),
      (lastFocusedItems[a] = n.find(".q-dropdown-item").index(this)),
      n.hide();
  }),
    (t = n.find(".q-dropdown-search")).on("input", function () {
      const e = $(this).val().toLowerCase(),
        t = "surah" === a ? cleanSurahText(e) : e;
      n.find(".q-dropdown-item").each(function () {
        var e = $(this).text().toLowerCase();
        (e = "surah" === a ? cleanSurahText(e) : e),
          $(this).toggle(e.includes(t));
      }),
        (currentFocus = -1);
    }),
    t.on("keydown", function (e) {
      const t = n.find(".q-dropdown-item:visible");
      switch (e.keyCode) {
        case 40:
          e.preventDefault(),
            (currentFocus = currentFocus < t.length - 1 ? currentFocus + 1 : 0);
          break;
        case 38:
          e.preventDefault(),
            (currentFocus = 0 < currentFocus ? currentFocus - 1 : t.length - 1);
          break;
        case 13:
          return (
            e.preventDefault(),
            void (-1 < currentFocus
              ? t.length && t[currentFocus].click()
              : t.length && t[0].click())
          );
      }
      (lastFocusedItems[a] = currentFocus), addActive(t);
    });
}
function addActive(a) {
  if (!a) return !1;
  removeActive(a),
    $(a[currentFocus]).addClass("active"),
    $(a[currentFocus])[0].scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
}
function removeActive(a) {
  a.removeClass("active");
}
function getAllColumnDefinitions() {
  const a = additionalJsons.flatMap((a) => [
    {
      title: `<strong>${a.title}</strong>`,
      data: null,
      name: `${a.name}-title`,
      visible: !1,
      render: function (e, t, n) {
        return `<strong>${a.title}</strong>`;
      },
    },
    ...a.columns.map((e, t) => ({
      title: `${t + 1}`,
      data: null,
      name: `${a.name}-${e}`,
      visible: !1,
      render: function (t, n, r) {
        return r[a.name] ? r[a.name][e] : "Loading...";
      },
    })),
  ]);
  return [...baseColumns, ...a];
}
function toggleTranslation(a, e) {
  var t = additionalJsons.find((e) => e.name === a);
  const n = getColumnIndices(a),
    r = n[0],
    i = n[e + 1],
    l = table.page();
  additionalColumns.includes(a)
    ? ((t = t.columns.filter((a, e) => table.column(n[e + 1]).visible())),
      table.column(r).visible(!(1 === t.length && e === t[0] - 1)),
      table.column(i).visible(!table.column(i).visible()),
      table.draw(),
      table.page(l).draw("page"))
    : (additionalColumns.push(a),
      $.getJSON(`${baseJsonUrl}${a}.json`, function (e) {
        const t = table.data().toArray();
        t.forEach((t, n) => {
          t[a] = e[n];
        }),
          table.clear().rows.add(t).draw(),
          table.column(r).visible(!0),
          table.column(i).visible(!0),
          table.page(l).draw("page");
      }).fail(function (a, e, t) {
        console.error("Error loading translation:", t);
      }));
}
function getColumnIndices(a) {
  let e = baseColumns.length;
  for (
    let t = 0;
    t < additionalJsons.length && additionalJsons[t].name !== a;
    t++
  )
    e += additionalJsons[t].columns.length + 1;
  return [
    e,
    ...additionalJsons
      .find((e) => e.name === a)
      .columns.map((a, t) => e + t + 1),
  ];
}
function showAllTranslations() {
  document
    .querySelectorAll('#translationList input[type="checkbox"]')
    .forEach((a) => {
      (a.checked = !0), (translationStates[a.value] = !0);
    });
}
function initializeTranslationSelector() {
  const a = document.getElementById("translationList"),
    e = document.getElementById("translationToggleBtn"),
    t = document.getElementById("translationDropdown"),
    n = document.getElementById("applyTranslations"),
    r = document.getElementById("resetTranslations"),
    i = document.getElementById("showAllTranslations");
  e && t
    ? (baseColumns.forEach((e, t) => {
        addTranslationItem(a, e.title, t, e.visible);
      }),
      additionalJsons.forEach((e) => {
        e.columns.forEach((t, n) => {
          addTranslationItem(
            a,
            `${e.title} ${n + 1}`,
            `${e.name}-${t}`,
            e.name === defaultAdditionalJson && 0 === n
          );
        });
      }),
      e.addEventListener("click", (a) => {
        a.stopPropagation(),
          (t.style.display = "block" === t.style.display ? "none" : "block");
      }),
      document.addEventListener("click", (a) => {
        a.target.closest(".translation-selector") ||
          "block" !== t.style.display ||
          (applyTranslations(), (t.style.display = "none"));
      }),
      n.addEventListener("click", () => {
        applyTranslations(), (t.style.display = "none");
      }),
      r.addEventListener("click", resetTranslations),
      i.addEventListener("click", showAllTranslations))
    : console.error("Toggle button or dropdown not found");
}
function addTranslationItem(a, e, t, n) {
  const r = document.createElement("div");
  (r.className = "translation-item"),
    (t = String(t)).includes("-title") ||
      ((r.innerHTML = `\n      <input type="checkbox" id="trans-${t}" value="${t}" ${
        n ? "checked" : ""
      }>\n      <label for="trans-${t}">${e}</label>\n  `),
      a.appendChild(r),
      (translationStates[t] = n),
      (initialTranslationStates[t] = n));
}
function applyTranslations() {
  const a = table.page();
  document
    .querySelectorAll('#translationList input[type="checkbox"]')
    .forEach((a) => {
      const e = a.value;
      if (((a = a.checked), "string" == typeof e && e.includes("-"))) {
        const [t, n] = e.split("-");
        a !== table.column(getColumnIndices(t)[parseInt(n) + 1]).visible() &&
          toggleTranslation(t, parseInt(n));
      } else table.column(parseInt(e)).visible(a);
      translationStates[e] = a;
    }),
    additionalJsons.forEach((a) => {
      const e = getColumnIndices(a.name)[0];
      (a = getColumnIndices(a.name)
        .slice(1)
        .some((a) => table.column(a).visible())),
        table.column(e).visible(a);
    }),
    table.draw(),
    table.page(a).draw("page");
}
function resetTranslations() {
  document
    .querySelectorAll('#translationList input[type="checkbox"]')
    .forEach((a) => {
      a.checked = initialTranslationStates[a.value] || !1;
    });
}
function toggleBaseColumn(a) {
  const e = table.column(a);
  e.visible(translationStates[a]), (baseColumns[a].visible = e.visible());
}
function initializeNavigationBoxes() {
  initializeQDropdown("surah", 1, 114),
    initializeQDropdown("juz", 1, 30),
    updateAyahDropdown(),
    $(".q-nav-value").on("click", function () {
      QtoggleDropdown($(this).attr("id").replace("Value", ""));
    }),
    $(".q-nav-arrow").on("click", function () {
      QnavigateArrow($(this).data("type"), $(this).data("direction"));
    }),
    $(document).on("click", function (a) {
      $(a.target).closest(".q-nav-box").length || $(".q-dropdown").hide();
    }),
    $(".q-dropdown").on("hide", function () {
      var a = $(this).attr("id").replace("Dropdown", "");
      searchInputValues[a] = $(this).find(".q-dropdown-search").val();
    });
}
