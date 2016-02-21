define(['module', 'dojo/dom-attr', 'dojo/json', 'dojox/html/entities'], function(module, domAttr, json, entities) {
  //Getting arguments from dom as Json
  // reads html attribute data-dojo-args as json object "id:'12',name:'name1'" not include "{}"
  module.exports.parseArgs = function(dom) {
    var __textValue = null;
    var __objectValue = null;

    __textValue = domAttr.get(dom, 'data-dojo-args');
    __textValue = entities.decode(__textValue);
    if (__textValue!=null && __textValue!=="") {
      __objectValue = (new Function("return {" + (__textValue) + "}; ")).apply();
  }
  
    return __objectValue
  };
  //Setting jso to dom as argument
  module.exports.saveArgs = function(dom, value) {
      var __valueAsJSONString = null;
      var __valueEncoded = null;
      
      __valueAsJSONString=json.stringify(value);
      __valueEncoded=entities.encode(__valueAsJSONString);
      __valueEncoded=__valueEncoded.replace(/(^\{)(.*)(\}$)/ig,"$2");
      domAttr.set(dom,'data-dojo-args',__valueEncoded)
  };
  //Setting jso to dom as argument
  module.exports.hasArgs = function(dom) {
      return domAttr.has(dom,'data-dojo-args')
  };
});