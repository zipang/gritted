(function(w, $) {

	var filters = {

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
		disappear: function($grid, $elt, i) {
			var pos = $elt.position(),
				w = $elt.width(),
				h = $elt.height();
			return {
				top:  pos.top + h/2,
				left: pos.left + w/2,
				width: 0, height: 0
			};
		},
		explode: function($grid, $elt, i) {
			var w = $grid.width(), 
				h = $grid.height();
			return {
				top:  inside([[-0.5*h, -0.1*h], [1.1*h, 1.5*h]]),
				left: inside([[-0.5*w, -0.1*w], [1.1*w, 1.3*w]])
			};
		},
		implode: function($grid, $elt, i) {
			var midX = Math.floor($grid.width()/2), midY = Math.floor($grid.height()/2);
			return {
				top:  midY, left: midX,
				width: 0, height: 0
			};
		},
		random: function($grid, $elt, i) {
			return filters[Object.keys(filters).random()]($grid, $elt, i);
		}
	} // filters

	Array.prototype.random = function() {
		return this[Math.floor(Math.random() * this.length)]
	}

	function inside(plages) {
		var plage = plages.random(),
			min = plage[0], max = plage[1];

		return min + Math.floor(Math.random()*(max - min));
	}

	if ($.fn.gritted) { // is our plugin defined ?

		var namespace = $.fn.gritted("namespace"); // where to store the filters

		namespace.filters = $.extend(namespace.filters, filters);
	}

})(window, jQuery || Zepto);