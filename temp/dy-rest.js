(function() {
    var Console = require('$svr/utils/log.js');

    return {
        post: function(req, $script, $header, $reqHeader) {
            var console = new Console($reqHeader);

            /*/ will-be-replaced-by-service-code /*/

            return "提示：在Awade上编写Rest服务的逻辑时，必须使用return关键字返回一笔数据给页面！";

        }
    }

})();
