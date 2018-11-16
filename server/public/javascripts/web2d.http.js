var http = {
    /**
     * @method
     */
    xhr: function () {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }

        let versions = [
            "MSXML2.XmlHttp.6.0",
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];

        let xhr;
        for (let i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) { }
        }

        return xhr;
    },
    /**
     * @method
     */
    send: function (url, method, data) {
        let that = this;
        return new Promise((resolve, reject) => {
            let x = that.xhr();

            if (method === "DOWNLOAD") {
                x.open("GET", url);
                x.responseType = 'blob';
            } else {
                x.overrideMimeType("application/text");
                x.open(method, url);
            }

            x.onreadystatechange = function () {
                if (x.readyState == 4) {
                    let data = null;
                    if (method === "DOWNLOAD") {
                        data = x.response;
                    } else {
                        data = x.responseText;
                        try {
                            data = JSON.parse(x.responseText);
                        } catch (e) {
                            // Skip and just use raw text
                        }
                    }

                    resolve(data);
                }
            };

            if (method === "POST") {
                if (typeof data === "string") {
                    x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                } else {
                    x.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
                    data = JSON.stringify(data);
                }
            }

            x.send(data);
        });
    },
    /**
     * @method
     */
    request: function (url, data, type) {
        if (type == "GET") {
            let query = [];

            if (data) {
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        query.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
                    }
                }
            }

            if (url.indexOf("?") >= 0) {
                url += (query.length ? "&" + query.join("&") : "");
            } else {
                url += (query.length ? "?" + query.join("&") : "");
            }

            data = query.join("&");
        }

        return this.send(url, type, data);
    },
    /**
     * @method
     */
    get: function (url, data) {
        return this.request(url, data, "GET");
    },
    /**
     * @method
     */
    post: function (url, data) {
        return this.request(url, data, "POST");
    },
    /**
     * @method
     */
    put: function (url, data) {
        return this.request(url, data, "PUT");
    },
    /**
     * @method
     */
    delete: function (url, data) {
        return this.request(url, data, "DELETE");
    },
    /**
     * @method
     */
    download: function (url) {
        return this.request(url, null, "DOWNLOAD");
    }
};