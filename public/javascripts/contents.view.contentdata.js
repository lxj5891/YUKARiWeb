var $contents = $contents || {};
$contents.view = $contents.view || {};

$contents.view.contentData = {
  contents: []
  ,add: function(content) {
    this.contents.push(content);
  }
  ,remove: function(id) {
    this.contents = _.reject(this.contents, function(c){ return c.id  == id; });
  }
  ,get: function(id) {
    for(var index in this.contents) {
      var c = this.contents[index];
      if(c.id == id)
        return c;
    }
    return null;
  }
  ,getByIndex: function(index) {
    return this.contents[index];
  }
  ,addWidget: function(content_id, widget) {
    var content = this.get(content_id);
    if(content) {
      content.widget = content.widget || [];
      content.widget.push(widget);
    }
  }
  ,getWidget: function(content_id, widget_id) {
    var content = this.get(content_id);
    if(content) {
      content.widget = content.widget || [];
      for(var index in content.widget) {
        var w = content.widget[index];
        if(w.id == widget_id)
          return w;
      }
    }
    return null;
  },removeWidget: function(content_id, widget_id) {
    var content = this.get(content_id);
    if(content) {
      content.widget = content.widget || [];
      content.widget = _.reject(content.widget, function(w){ return w.id  == widget_id; });
    }
  }
};