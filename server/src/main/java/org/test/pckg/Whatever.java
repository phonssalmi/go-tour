package org.test.pckg;

import java.io.File;

import org.opentripplanner.standalone.CommandLineParameters;
import org.opentripplanner.standalone.OTPMain;

public class Whatever {
	
	private static final String DATA_DIR = "/opt/otp-data/otp-data/";
	private static final String GTFS_MAIN_URL = "http://data.foli.fi/gtfs";
	
	private OTPMain otp;
	
	//URL to request routes:
	//http://localhost:8080/otp/routers/default/plan?fromPlace=60.442529151721295,22.288427352905273&toPlace=60.451123027562986,22.267313003540036&time=11:15am&date=01-26-2018&mode=TRANSIT,WALK&maxWalkDistance=804.672&arriveBy=false&wheelchair=false&locale=en
	
	public Whatever() {
		CommandLineParameters conf = new CommandLineParameters();
		conf.build = new File(DATA_DIR);
		conf.inMemory = true;
		conf.preFlight = true;
		conf.server = true;
		conf.port = 8080;
		conf.securePort = 8443;
		//conf.graphDirectory = new File(DATA_DIR, "otp-cache/");
		otp = new OTPMain(conf);
		
	}
	
	private void run() {
		otp.run();
	}
	
	public static void main(String[] args) {
		//new Whatever().run();
	}
	
}
