'use strict';

$(function () {
  window.sidebarSplitter && sidebarSplitter.initMobile();
});

$(window).on("resize", function () {
  //$(document.body).find('table.dataTable').DataTable().draw(false);
  $(document.body).find('table.dataTable').DataTable().columns.adjust();
});

// COMMON HELPER

window.commonHelper = {

  formatFileSize: function (size) {
    if (size > 1048576) return parseInt(size / 1048576) + ' Мб';
    if (size > 1024) return parseInt(size / 1024) + ' Кб';
    return size + ' байт';
  }
};

// OBJECT HELPER

window.objectHelper = {

  indexArray: function (items, key) {
    var index = {};
    if (items instanceof Array) {
      for (var i = 0; i < items.length; ++i) {
        index[items[i][key]] = items[i];
      }
    } else if (items && typeof items === 'object') {
      index[items[key]] = items;
    }
    return index;
  },

  unsetKeys: function (object, keys) {
    for (var i = 0; i < keys.length; ++i) {
      delete object[keys[i]];
    }
  },

  removeByKeyValues: function (objects, key, values) {
    for (var i = objects.length - 1; i >= 0; --i) {
      if (values.indexOf(objects[i][key]) > -1) {
        objects.splice(i, 1);
      }
    }
  },

  replaceInArray: function (objects, target, key) {
    for (var i = 0; i < objects.length; ++i) {
      if (objects[i][key] == target[key]) {
        objects.splice(i, 1, target);
        break;
      }
    }
  },
  // get [ key: value, ... ] from object array
  mapArray: function (items, key, value) {
    var maps = [];
    if (items instanceof Array) {
      for (var i = 0; i < items.length; ++i) {
        var map = {};
        map[items[i][key]] = items[i][value];
        maps.push(map);
      }
    } else {
      throw new Error("mapArray");
    }
    return maps;
  }
};

// MESSAGE CALLOUT

window.messageCallout = (function () {

  var $callout = $("#message-callout");

  function show (type, message, title) {
    var $title = $callout.find('.message-callout-title');
    title ? $title.html(title).show() : $title.hide();
    $callout.removeClass('alert-info alert-success alert-warning alert-danger').addClass('alert-'+ type);
    var $content = $callout.find('.message-callout-content');
    message ? $content.html(message).show() : $content.hide();
    $callout.show();
  }
  return {
    info: function (message, title) {
      show("info", message, title);
    },

    success: function (message, title) {
      show("success", message, title);
    },

    warning: function (message, title) {
      show("warning", message, title);
    },

    error: function (message, title) {
      show("danger", message, title);
    },

    hide: function () {
      $callout.hide();
    }
  };
})();

// DATE PICKER

if ($.fn.datepicker) {
  $.extend($.fn.datepicker.defaults, {
    autoclose: true,
    format: 'dd.mm.yyyy',
    language: 'ru',
    todayHighlight: true
  });
}

if ($.fn.datetimepicker) {
  $.fn.datetimepicker.defaultOpts = {
    locale: 'ru',
    sideBySide: false,
    showClear: true,
    showClose: true,
    ignoreReadonly: true
  };
}

// DATA TABLES

if ($.fn.dataTable) {
  $.extend($.fn.dataTable.defaults, {
    "paging": true,
    "scrollX": true,
    "lengthChange": true,
    "searching": true,
    "ordering": true,
    "info": true,
    "autoWidth": false,
    "sDom": "<'row'<'col-sm-6'f><'col-sm-6'l>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
    "language": {
      "processing": "Подождите...",
      "search": "Поиск:",
      "lengthMenu": "Показать по _MENU_",
      "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
      "infoEmpty": "Записи с 0 до 0 из 0 записей",
      "infoFiltered": "(всего _MAX_)",
      "infoPostFix": "",
      "loadingRecords": "Загрузка записей...",
      "zeroRecords": "Записи отсутствуют.",
      "emptyTable": "В таблице отсутствуют данные",
      "paginate": {
        "first": "<<",
        "previous": "<",
        "next": ">",
        "last": ">>"
      },
      "aria": {
        "sortAscending": ": активировать для сортировки столбца по возрастанию",
        "sortDescending": ": активировать для сортировки столбца по убыванию"
      }
    }
  });
  $.fn.dataTable.ext.errMode = 'none';

  window.customizeDatatable = function (manager) {
    var $table = manager.$table;
    var dt = manager.dt;
    var id = '#' + $table.attr('id');
    var info = dt.page.info();
    var total = info.recordsTotal;
    var $length = $(id + '_length');

    $length.toggle(total > 10);
    $length.find('option[value="25"]').toggle(total > 10);
    $length.find('option[value="50"]').toggle(total > 25);
    $length.find('option[value="100"]').toggle(total > 50);

    $(id + '_paginate').toggle(info.pages > 1);
    $(id + '_info').toggle(info.pages > 1);
  }
}

// SELECT2

if ($.fn.select2) {
  $.fn.select2.defaults.set('language', 'ru');
}

// SIDEBAR MENU

function initSelect(element, sub_nav, caption) {
  var dt = [];
  for(var i = 0; i < sub_nav.length; i++){
    dt[dt.length] = {"id":sub_nav[i].id, "text": (sub_nav[i].hint || sub_nav[i].caption), "nav_element": sub_nav[i]};
  }
  element.select2({
    data: dt,
    placeholder: caption,
    tags: false
  });
  var selected = element.data("selected");
  if (selected) {
    element.val(selected).trigger("change");
  }
  element.on("select2:select", function (e) {
    element.nextAll('.menu-select').each(function(index, element){
      $(element).select2("destroy").remove();
    });
    var nav_element = e.params.data.nav_element;
    if(nav_element.nodes.length) {
      var new_sel = $('<select id="n_' + nav_element.id.replace('.', '_')
        + '" class="menu-select" style="width: 95%"><option></option></select>').insertAfter(element.next(".select2"));
      initSelect(new_sel, nav_element.nodes, nav_element.hint || nav_element.caption);
    } else if (nav_element.url) {
      window.open(nav_element.url, '_self');
    }
  });
}

(function () {
  var $sidenav = $("#sideBarNav");
  var url = decodeURIComponent(location.pathname + location.search);
  var hasDefaultUrl = false;
  $sidenav.find('.menu-link').each(function () {
    var $item = $(this);
    if ($item.attr('href') === url) {
      hasDefaultUrl = true;
    }
  });
  $sidenav.find('.menu-select').each(function () {
    var sel = $(this), nd = sel.data('selection');
    initSelect(sel, nd.nodes, nd.hint || nd.caption);
  });
  var items = {};
  if (!hasDefaultUrl) {
    $sidenav.find('.treeview-link').each(function (index) {
      items[this.id] = index === 0;
    });
  }
  $sidenav.on('click', '.treeview-link', function () {
    items[this.id] = !items[this.id];
    store.set('sideBarNav', items);
  });
  var stored = store.get('sideBarNav') || {};
  if (Object.keys(stored).join() === Object.keys(items).join()) {
    items = stored;
  }
  for (var id in items) {
    // items[id] && $('#'+id).parent().addClass("menu-open");
  }
})();

// IMODAL

(function () {
  var EVENT_PREFIX = 'imodal:';
  var $overlay = $('#global-overlay');
  var $frame = $('#imodal-frame');
  var $imodal = $('#imodal');
  var params = {};
  var imodalWindow = null;

  $imodal.find('.imodal-close').click(function () {
    parent.imodal.close();
  });

  function setHistory () {
    imodalWindow.history.pushState(null, imodalWindow.document.title, imodalWindow.location.href + '#imodal');
    $(imodalWindow).off('popstate').on('popstate', function (event) {
      imodal.forceClose();
    });
  }

  window.imodal = {

    getParams: function (key) {
      return key ? params[key] : params;
    },

    setParams: function (key, value) {
      params[key] = value;
    },

    getWindow: function () {
      return imodalWindow;
    },

    getFrame: function () {
      return $frame.get(0);
    },

    getDocument: function () {
      return $frame.get(0).contentDocument || $frame.get(0).contentWindow.document;
    },

    getEventId: function (name) {
      return EVENT_PREFIX + name;
    },

    init: function (params) {
      this.trigger('init', params);
    },

    load: function (url, data, cb) {
      cb = typeof data === 'function' ? data : cb;
      url = this.getDataUrl(data, url);
      $frame.addClass('active').detach().attr('src', url);
      $(document.body).append($frame);
      return $frame.off('load').load(function () {
        $overlay.hide();
        $frame.removeClass('transparent');
        $frame.parent().addClass('hidden-overflow');
        imodalWindow = $frame.addClass('loaded').get(0).contentWindow;
        setHistory();
        if (typeof cb === 'function') {
          cb(imodalWindow);
        }
      });
    },

    post: function(url, data, cb) {
      var form = $('<form action="' + url + '" target="'
        + this.getFrame().name + '" method="post" style="display:none;"></form>');

      function addInput(values, context) {
        for (let nm in values) {
          if (values.hasOwnProperty(nm)) {
            if (values[nm] && typeof values[nm] === 'object') {
              addInput(values[nm], context ? context + '[' + nm + ']' : nm);
            } else {
              $("<input type='hidden'/>")
                .attr("name", context ? context + '[' + nm + ']' : nm)
                .attr("value", values[nm])
                .appendTo(form);
            }
          }
        }
      }
      addInput(data);
      $frame.addClass('active').detach();
      $(document.body).append($frame);
      $(document.body).append(form);
      form.submit();
      return $frame.off('load').load(function () {
        form.remove();
        $overlay.hide();
        $frame.removeClass('transparent');
        $frame.parent().addClass('hidden-overflow');
        imodalWindow = $frame.addClass('loaded').get(0).contentWindow;
        setHistory();
        if (typeof cb === 'function') {
          cb(imodalWindow);
        }
      });
    },

    close: function () {
      var event = this.createEvent('beforeClose');
      $frame.trigger(event);
      if (event.isPropagationStopped()) {
        return false;
      } else {
        imodalWindow.history.back();
        this.forceClose();
        return true;
      }
    },

    forceClose: function () {
      if (imodalWindow) {
        if (this.getParams('reopen')) {
          $frame.addClass('transparent');
          $overlay.show();
        }
        setTimeout(function () {
          $frame.trigger(imodal.getEventId('close'));
          $frame.off('load').removeClass('active loaded').detach().attr('src', $frame.data('blank'));
          $(document.body).append($frame);
          $frame.parent().removeClass('hidden-overflow');
          imodalWindow = null;
          params = {};
        }, 0);
      }
    },

    createEvent: function (name) {
      return $.Event(this.getEventId(name));
    },

    on: function (name, handler) {
      $frame.on(this.getEventId(name), handler);
    },

    off: function (name, handler) {
      $frame.off(this.getEventId(name), handler);
    },

    trigger: function (name, params) {
      $frame.trigger(this.getEventId(name), params);
    },

    triggerParent: function (name, params) {
      if (window.parent && window.parent.imodal) {
        window.parent.imodal.trigger(name, params);
      }
    },

    getDataUrl: function (data, url) {
      data = typeof data !== 'object' ? {} : data;
      data = $.param(data);
      return data ? (url + (url.indexOf('?') > 0 ? '&' : '?') + data) : url;
    }
  };
})();

$('.default-icheck').iCheck({
  checkboxClass: 'icheckbox_flat',
  radioClass: 'iradio_flat',
  indeterminateClass: 'indeterminate-checkbox'
});

// INPUTMASK ALIASES

if (window.Inputmask) {
  Inputmask.extendAliases({
    email: {
      definitions: {
        "*": {
          validator: "[а-яА-Я0-9A-Za-z!#$%&'*+/=?^_`{|}~-]",
          cardinality: 1,
          casing: "lower"
        },
        "-": {
          validator: "[а-яА-Я0-9A-Za-z-]",
          cardinality: 1,
          casing: "lower"
        }
      }
    }
  });
}

// YMAP LOAD

(function () {
  var loading = false;
  var listeners = [];
  window.getYmaps = function (cb) {
    if (window.ymaps) {
      return cb(ymaps);
    }
    listeners.push(cb);
    if (!loading) {
      loading = true;
      $.getScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU&coordorder=longlat', function () {
        for (var i = 0; i < listeners.length; ++i) {
          listeners[i](ymaps);
        }
      });
    }
  };
})();

function processAjaxError (xhr) {
  var $loader = $('#global-loader');
  var frame = imodal.getFrame();
  if (xhr.status === 401) {
    messageCallout.hide();
    imodal.load('auth').load(function (event) {
      var doc = imodal.getDocument();
      if (doc.getElementById('authbutton')) {
        doc.forms[0].addEventListener('submit', function (event) {
          event.preventDefault();
          $loader.show();
          $(frame).addClass('imodal-frame-transparent');
          setTimeout(function () {
            doc.forms[0].submit();
          }, 0);
        });
      } else {
        imodal.close();
      }
      $(frame).removeClass('imodal-frame-transparent');
      $loader.hide();
    });
  }
}