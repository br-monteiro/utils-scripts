### Beacon Conversion
#### Solution
Script usado para capturar os dados necessário na [API de Conversão do Facebook](https://developers.facebook.com/docs/marketing-api/conversions-api) usando a [Beaco API](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API)

#### Implementation
```javascript
window.mappingFacebookAttributes = {
  initialized: false,
  count: 0,
  dataLocation: {},
  url: 'https://www.rdstation.com.br/api/1.3/conversions',
  token: '',
  identificador: 'capturing-facebook-attributes-blk',
  selector: 'form#conversion-form,form.mkt-form,form#contactform-contact,form#form-jumpstep-signup',
  headers: {
    type: 'application/json'
  },
  init: function (force) {
    if (!this.initialized || force) {
      this.count += 1;
      this.token = this.getToken();
      this.initialized = true;
      this.run();
    }
  },
  executer: function (callback, when, stop, frequency) {
    if (typeof callback !== 'function') {
      throw new Error('The "callback" is not a function');
    }
    var currentExecution = 1;
    frequency = frequency || 0;
    frequency = (typeof when === 'number' && parseInt(when, 10)) || frequency;
    stop = (typeof stop === 'function' && stop) || function () { return true; };
    when = (typeof when === 'function' && when) || function () { return true; };
    var interval = setInterval(function handlerInterval() {
      var resultOfWhenFunction = when();
      if (resultOfWhenFunction) {
        callback(resultOfWhenFunction);
      }
      if (stop(currentExecution, resultOfWhenFunction)) {
        clearInterval(interval);
      }
      currentExecution += 1;
    }, frequency);
  },
  getToken: function () {
    var href = window.location.href;
    if (/(\/\/materiales\.)|com\/(es|mx|co)\//.test(href)) {
      return '399ed981053f5a142893fbb7431e9606';
    } else if (/(\/\/materiais\..+?\.com\/)|com\/(pt)\//.test(href)) {
      return 'a744a87a638516c3fd3094f166f4a38b'
    }
    return '4ac98d510af23fd1b39770575544b8e0'
  },
  getCookie: function (key, fallback) {
    var defaultValue = typeof fallback !== 'undefined' ? fallback : '';
    var matches = (new RegExp('\\b' + key + '=(.*?)($|;\\s)', 'g'))
      .exec(decodeURIComponent(document.cookie));
    return matches ? matches[1] : defaultValue;
  },
  getFbExternalId: function () {
    var fbutrk = this.getCookie('fb_external_id');
    if (fbutrk) {
      return fbutrk;
    }
    var value = 'trk' + Date.now();
    var date = new Date();

    date.setTime(date.getTime() + 600000); // 10*60*1000 = 600000
    document.cookie = 'fb_external_id=' + value + ';expires=' + date.toUTCString() + ';path=/';

    return value;
  },
  sendBeaconConversion: function (form) {
    var dataFromEntries = Object.fromEntries(new FormData(form));
    var data = Object.assign(dataFromEntries, {
      identificador: this.identificador,
      token_rdstation: this.token
    });
    window.navigator.sendBeacon(this.url, new Blob([JSON.stringify(data)], this.headers));
  },
  updateInputForm: function (form, inputName, value) {
    var input = form.querySelector('[name=' + inputName + ']');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = inputName;
      form.appendChild(input);
    }
    input.value = value;
  },
  isActionToSignup: function (form) {
    return /\.com(\.br)?\/signup/.test(form.action);
  },
  buildFacebookData: function () {
    var data = {
      fbc: this.getCookie('_fbc'),
      fbp: this.getCookie('_fbp'),
      external_id: this.getCookie('fb_external_id', this.getFbExternalId()),
      ip: this.dataLocation.ip || '',
      city: this.dataLocation.city || '',
      country: this.dataLocation.country_code || '',
      zip: this.dataLocation.zip || '',
      user_agent: window.navigator.userAgent
    };

    return window.btoa(JSON.stringify(data));
  },
  bindSubmit: function (context) {
    return function submit (form) {
      form.addEventListener('submit', function (event) {
        debugger;
        var isActionToSignup = context.isActionToSignup(this);

        if (this.checkValidity()) {
          if (isActionToSignup) {
            event.preventDefault();
          }

          context.updateInputForm(this, 'facebook_data', context.buildFacebookData());

          if (form.action === window.location.href) {
            context.sendBeaconConversion(this);
          }

          if (isActionToSignup) {
            context.sendBeaconConversion(this);
            this.submit();
          }
        }
      });
    };
  },
  run: function () {
    try {
      var forms = document.querySelectorAll(this.selector);
      forms.forEach(this.bindSubmit(this));

      this.getFbExternalId();
      this.executer((function () {
        try {
          this.dataLocation = new window.IPLocation().getSyncIpLocation();
        } catch (_) { }
      }).bind(this),
      function () {
        return window.IPLocation;
      },
      function (i, w) {
        return i === 20 || w;
      }, 500);
      console.log('Number of forms listened:', forms.length);
    } catch (e) {
      console.log('Error: conversion data could not be sent');
      console.log(e);
    }
  }
};

window.mappingFacebookAttributes.init();
```

#### File
código-fonte: [beacon-conversion.js](beacon-conversion.js)
