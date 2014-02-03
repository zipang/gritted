(function(w, $) {

	if ($.fn.gritted) { // is our plugin defined ?

		var namespace = $.fn.gritted("namespace"); // where to store the filters

		namespace.filters = $.extend(namespace.filters, {

			slideLeft: function($grid, $elt, i) {
				return {
					left: -Math.floor(Math.random()*$grid.width()) - $elt.width()
				}
			},
			slideRight: function($grid, $elt, i) {
				return {
					left: $grid.width() + Math.floor(Math.random()*$grid.width())
				}
			},
			slideUp: function($grid, $elt, i) {
				return {
					top: -Math.floor(Math.random()*$grid.height()) - $elt.height()
				}
			},
			slideDown: function($grid, $elt, i) {
				return {
					top: $grid.height() + Math.floor(Math.random()*$grid.height())
				}
			},
			explode: function($grid, $elt, i) {
				var w = $grid.width(), h = $grid.height();
				return {
					top:  random([[-0.5*h, -0.1*h], [1.1*h, 1.5*h]]),
					left: random([[-0.5*w, -0.1*w], [1.1*w, 1.3*w]])
				};
			},
			implode: function() {
				var midX = Math.floor($grid.width()/2), midY = Math.floor($grid.height()/2);
				return {
					top:  midY, left: midX,
					width: 0, height: 0
				};
			}
		});
	}
})(window, jQuery || Zepto);