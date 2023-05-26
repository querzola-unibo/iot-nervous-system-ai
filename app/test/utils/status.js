const getRandomValue = (max, min = 0) => {
  return Math.floor((Math.random() * (max - min)) + min);
}

const getStatus = () => ({
	rooms: [
  	{
    	_id: "6454e5e79969b261acbc6361",
    	name: "Salotto",
    	type: "living-room",
    	deviceIds: []
  	},
  	{
    	_id: "6454e5fa9969b261acbc6362",
    	name: "Camera Manu",
    	type: "bedroom",
    	deviceIds: ['645e0a8b66a101b8f82b7285']
  	},
  	{
    	_id: "6454e6049969b261acbc6363",
    	name: "Camera Fede",
    	type: "bedroom",
    	deviceIds: ['645e0a8b66a101b8f82b7277']
  	}
  ],
	devices: [
    {
  	  _id: "645e0a8b66a101b8f82b7285",
    	name: "Illumination",
    	type: "hybrid",
    	element: "light",
    	deviceId: "Qeg35onj54AH42451",
    	actuators: [
        {
    	    label: "Curtain",
      	  key: "curtain",
      	  type: "range",
	        min: 0,
  	      max: 100,
    	    iconMin: "moon",
      	  iconMax: "sun-bright",
					threshold: 10
        },
        {
        	label: "Light",
	        key: "light",
  	      type: "boolean"
        }
      ],
    sensors: [
        {
	        label: "Brightness",
  	      key: "brightness",
    	    type: "text",
					threshold: 250
        }
      ],
    params: {
				brightness: getRandomValue(5000, 1000),
    	  light: true,
      	curtain: getRandomValue(101)
			}
    },
		{
  	  _id: "645e0a8b66a101b8f82b7277",
    	name: "Illumination",
    	type: "hybrid",
    	element: "light",
    	deviceId: "Qeg35onj54AH42452",
    	actuators: [
        {
    	    label: "Curtain",
      	  key: "curtain",
      	  type: "range",
	        min: 0,
  	      max: 100,
    	    iconMin: "moon",
      	  iconMax: "sun-bright",
					threshold: 10
        },
        {
        	label: "Light",
	        key: "light",
  	      type: "boolean"
        }
      ],
    sensors: [
        {
	        label: "Brightness",
  	      key: "brightness",
    	    type: "text",
					threshold: 250
        }
      ],
    params: {
				brightness: getRandomValue(5000, 1000),
    	  light: true,
      	curtain: getRandomValue(101)
			}
    }
  ]
})

module.exports = {
	getStatus
}