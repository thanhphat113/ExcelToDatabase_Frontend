function Button({label, action}) {
	return ( 
		<div onClick={action} className="group z-0 cursor-pointer relative  w-full rounded-[30px] h-full transition-all duration-500 bg-gradient-to-l  from-[#d4d5d5] to-[#a4a4a6] ">
			<div className="absolute z-[-1] rounded-[30px] w-full h-full transition-all duration-500  bg-gradient-to-r from-[#d4d5d5] to-[#a4a4a6] opacity-0 shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:opacity-100"></div>
			<p className="w-full text-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">{label}</p>
		</div>
	 );
}

export default Button;