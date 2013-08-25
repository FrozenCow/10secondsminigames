define(function() {
	var required = function(requirements) {
		return function(g,ready) {
			var ok = (/Chrome|Firefox/g).test(navigator.userAgent);
			if (ok) { return; }

			var d = document.createElement('div');
			d.style.position = 'absolute';
			d.style.width = '400px';
			d.style.height = '150px';
			d.style.left = '50%';
			d.style.top = '50%';
			d.style.marginTop = '-75px';
			d.style.marginLeft = '-200px';
			d.style.border = '1px solid #ddd';
			d.style.borderRadius = '10px';
			d.style.boxShadow = '10px 10px 5px #888888';
			d.style.padding = '5px';
			d.style.zIndex = '999';
			d.style.textAlign = 'center';

			function createRow(content) {
				var row = document.createElement('div');
				row.appendChild(content);
				row.style.textAlign = 'center';
				row.style.margin = '5px';
				d.appendChild(row);
				return row;
			}

			createRow(document.createTextNode('Google Chrome is the recommended browser to play this game')).style.padding = '10px 30px';

			var a = document.createElement('a');
			a.href = 'https://chrome.google.com/';
			a.target = '_blank';
			a.className = 'button';
			a.textContent = 'Download Google Chrome';
			createRow(a);

			var continueButton = document.createElement('button');
			continueButton.textContent = 'Continue anyway';
			continueButton.onclick = function() {
				document.body.removeChild(d);
				g.canvas.style.visibility = '';
				ready();
			};
			createRow(continueButton);

			g.canvas.style.visibility = 'hidden';
			document.body.appendChild(d);


			return ready;
		};
	};
	return required;
});