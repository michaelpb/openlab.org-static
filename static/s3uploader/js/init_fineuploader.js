/*
 * Copyright 2015 michaelb
 * LGPL 3.0
 */

(function ($) {
    var prepare = function (i, e) {
        var $e = $(e);
        var variables = null;

        var a = function (attr, is_json) {
            val = $e.attr('data-fu-'+attr);
            if (is_json) {
                val = $.parseJSON(val);
            }
            return val;
        };


        var create_key_url = a('create-key');
        var csrf_token = a('csrf');
        var config_name = a('config-name') || null;

        var opts = {
            request: {
                endpoint: a('endpoint'),
                accessKey: a('aws-public-access-key')
            },
            signature: {
                endpoint: a('signature-endpoint'),
                customHeaders: {
                    'X-CSRFToken': csrf_token
                }
            },
            uploadSuccess: {
                endpoint: a('success-endpoint'),
                customHeaders: {
                    'X-CSRFToken': csrf_token
                }
            },
            iframeSupport: {
                localBlankPagePath: a('blankpage')
            },
            objectProperties: {
                key: function(file_id) {
                    var promise = new qq.Promise(),
                        filename = $e.fineUploader("getName", file_id),
                        data = {
                            filename: filename,
                            csrfmiddlewaretoken: csrf_token,

                            // Following two are put here in lieu of placement as custom headers
                            config_name: config_name,
                            variables: variables
                        };

                    $.post(create_key_url, data)
                        .done(function (data) {
                            if (!data.key) {
                                console.error("Key not specified in data return value");
                                console.log("(return data at window.__rdata for inspection)");
                                window.__rdata = data;
                                promise.failure();
                            } else {
                                promise.success(data.key);
                            }
                        })
                        .fail(function () {
                            console.error("Object post key create doesnt work");
                            promise.failure();
                        });
        
                    return promise;
                }
            }
        };

        if (config_name) {
            var config_name_http_header = a('config-name-http-header') || null;
            opts.signature.customHeaders[config_name_http_header] = config_name;
            opts.uploadSuccess.customHeaders[config_name_http_header] = config_name;
        }

        if (a('params')) {
            opts.request.params = a('params', true);
        }

        if (a('validation')) {
            opts.validation = a('validation', true);
        }

        if (a('paste')) {
            opts.paste = a('validation', true);
            opts.paste.targetElement = $(opts.paste.targetElement);
        }

        if (a('variables')) {
            variables = a('variables');
            var variables_name_http_header = a('variables-name-http-header') || null;
            opts.signature.customHeaders[variables_name_http_header] = variables;
            opts.uploadSuccess.customHeaders[variables_name_http_header] = variables;
        }

        // Extend with any additional options
        $.extend(opts, a('options', true));

        if (window.S3_OPTIONS) {
            $.extend(opts, window.S3_OPTIONS);
        }

        $e.fineUploaderS3(opts);
    };

    $(document).ready(function () {
        $('.django-s3uploader').each(prepare);
    });
})(jQuery);

