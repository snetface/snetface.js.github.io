window.bloomreach = { init: initBloomreach, trackVisit: trackVisit };

function initBloomreach( sitecore_data )
{
  return scheduleInit( getInitializer( sitecore_data || getSitecoreData()));
}

function trackVisit( sitecore_data )
{ 
  exponea.track( "page_visit", getPageProps( sitecore_data || getSitecoreData()));
}

function getSitecoreData()
{
  return document && JSON.parse( _get( "__JSS_STATE__.innerHTML", window ) || "{}" ).sitecore || {};
}

function getInitializer( sitecore )
{ 
  const bloomreach = sitecore && sitecore.context && sitecore.context.bloomreach || {};
  return function(){ initFramework( bloomreach.target, bloomreach.token, getPageProps( sitecore )); }
}

function scheduleInit( initialize )
{
  return isMarketingCookieAcceptanceOkay() ? initialize() : document.addEventListener( "CookiebotOnAccept", initialize );
}

function _get( path, source )
{
  return ( path || "" ).split( "." ).reduce( function( target, entry ){ return target && target[ entry ]; }, source );
}

function getPageProps( sitecore_data, mixin )
{
  const sitecore = sitecore_data || {};
  const route = sitecore.route || {};

  return Object.assign({}, sitecore.tags || {}, mixin || {}, {
    title: route.name,
    title_local: _get( "fields.title.value", route ),
    domain: location.hostname,
    page_type: route.templateName,
    language: ( sitecore.context || {}).language
  });
}

function isMarketingCookieAcceptanceOkay(){
  const consent_cookie = ( document.cookie.split( "CookieConsent=" )[ 1 ] || "" ).split( ";" )[ 0 ] || "";
  return consent_cookie.indexOf( "marketing:true" ) > -1;
};

function initFramework( target, token, page_props ){
  if (typeof document !== "undefined") {
    if (!window.exponea)
      window.exponea = function (...args) {
        var queue = [].concat(args);
      };
    !(function (e, n, t, i, o, r) {
      function c(e) {
        if ("number" != typeof e) return e;
        var n = new Date();
        return new Date(n.getTime() + 1e3 * e);
      }
      var a = 4e3,
        s = "xnpe_async_hide";
      function p(e) {
        return e.reduce(
          function (e, n) {
            return (
              (e[n] = function () {
                e._.push([n.toString(), arguments]);
              }),
              e
            );
          },
          { _: [] }
        );
      }
      function m(e, n, t) {
        var i = t.createElement(n);
        i.src = e;
        var o = t.getElementsByTagName(n)[0];
        return o.parentNode.insertBefore(i, o), i;
      }
      function u(e) {
        return "[object Date]" === Object.prototype.toString.call(e);
      }
      (r.target = r.target || "https://api.exponea.com"),
        (r.file_path = r.file_path || r.target + "/js/exponea.min.js"),
        (o[n] = p([
          "anonymize",
          "initialize",
          "identify",
          "update",
          "track",
          "trackLink",
          "trackEnhancedEcommerce",
          "getHtml",
          "showHtml",
          "showBanner",
          "showWebLayer",
          "ping",
          "getAbTest",
          "loadDependency",
          "getRecommendation",
          "reloadWebLayers",
        ])),
        (o[n].notifications = p([
          "isAvailable",
          "isSubscribed",
          "subscribe",
          "unsubscribe",
        ])),
        (o[n]["snippetVersion"] = "v2.3.0"),
        (function (e, n, t) {
          (e[n]["_" + t] = {}),
            (e[n]["_" + t].nowFn = Date.now),
            (e[n]["_" + t].snippetStartTime = e[n]["_" + t].nowFn());
        })(o, n, "performance"),
        (function (e, n, t, i, o, r) {
          e[o] = {
            sdk: e[i],
            sdkObjectName: i,
            skipExperiments: !!t.new_experiments,
            sign: t.token + "/" + (r.exec(n.cookie) || ["", "new"])[1],
            path: t.target,
          };
        })(o, e, r, n, i, RegExp("__exponea_etc__" + "=([\\w-]+)")),
        (function (e, n, t) {
          m(e.file_path, n, t);
        })(r, t, e),
        (function (e, n, t, i, o, r, p) {
          if (e.new_experiments) {
            !0 === e.new_experiments && (e.new_experiments = {});
            var f,
              l = e.new_experiments.hide_class || s,
              _ = e.new_experiments.timeout || a,
              d = encodeURIComponent(r.location.href.split("#")[0]);
            e.cookies &&
              e.cookies.expires &&
              ("number" == typeof e.cookies.expires || u(e.cookies.expires)
                ? (f = c(e.cookies.expires))
                : e.cookies.expires.tracking &&
                  ("number" == typeof e.cookies.expires.tracking ||
                    u(e.cookies.expires.tracking)) &&
                  (f = c(e.cookies.expires.tracking))),
              f && f < new Date() && (f = void 0);
            var x =
              e.target +
              "/webxp/" +
              n +
              "/" +
              r[t].sign +
              "/modifications.min.js?http-referer=" +
              d +
              "&timeout=" +
              _ +
              "ms" +
              (f ? "&cookie-expires=" + Math.floor(f.getTime() / 1e3) : "");
            "sync" === e.new_experiments.mode &&
            r.localStorage.getItem("__exponea__sync_modifications__")
              ? (function (e, n, t, i, o) {
                  (t[o][n] = "<" + n + ' src="' + e + '"></' + n + ">"),
                    i.writeln(t[o][n]),
                    i.writeln(
                      "<" +
                        n +
                        ">!" +
                        o +
                        ".init && document.writeln(" +
                        o +
                        "." +
                        n +
                        '.replace("/' +
                        n +
                        '/", "/' +
                        n +
                        '-async/").replace("><", " async><"))</' +
                        n +
                        ">"
                    );
                })(x, n, r, p, t)
              : (function (e, n, t, i, o, r, c, a) {
                  r.documentElement.classList.add(e);
                  var s = m(t, i, r);
                  function p() {
                    o[a].init ||
                      m(t.replace("/" + i + "/", "/" + i + "-async/"), i, r);
                  }
                  function u() {
                    r.documentElement.classList.remove(e);
                  }
                  (s.onload = p),
                    (s.onerror = p),
                    o.setTimeout(u, n),
                    (o[c]._revealPage = u);
                })(l, _, x, n, r, p, o, t);
          }
        })(r, t, i, 0, n, o, e),
        (function (e, n, t) {
          e[n].start = function (i) {
            i &&
              Object.keys(i).forEach(function (e) {
                return (t[e] = i[e]);
              }),
              e[n].initialize(t);
          };
        })(o, n, r);
    })(document, "exponea", "script", "webxpClient", window, {
      target,
      token,
      service_worker_path: "/dist/velux-marketing/service-worker.js",
      // Both target and token need to be variables that can be changed depending on site and enviroment,
      new_experiments: { mode: "async" },
      utm_always: true,
      utm_params: [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "campaign_id",
        "brspace",
        "brproject",
      ],
      debug: false,
      track: {
        auto: false,
        visits: true,
        visits_query_params: ["test", "brspace", "brproject"],
        activity: false,
        unloads: false,
        google_analytics: true,
        default_properties: page_props,
      },
      ping: {
        enabled: true,
        interval: "120", //How often, in seconds, SDK pings our servers while the customer is active.
        //properties: ['brspace', 'brproject'],
      },
      webOptimization: {
        experiments: true,
        tagManager: true,
        webLayers: true,
      },
      spa_reloading: {
        on_hash_change: true,
        on_url_change: true,
        banners: true,
        experiments: true,
        tags: true,
        visits: true,
        automatic_tracking: false,
      },
    });
    exponea.start();
  }
};
