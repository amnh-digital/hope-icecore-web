class AppAnalytics{

	constructor(){
		this.event = 'interactionEvent';
		this.eventCategory = 'hopeIcecore';
	}

	push(action, label){
		let data = {
			'event': this.event,
			'eventCategory': this.eventCategory,
			'eventAction': action,
			'eventLabel': label
		}
		//dataLayer.push(data);
	}

}

var Analytics = new AppAnalytics();

// module.exports = new Analytics;
