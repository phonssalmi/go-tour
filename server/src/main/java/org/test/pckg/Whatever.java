package org.test.pckg;

import java.io.File;

import org.opentripplanner.standalone.CommandLineParameters;
import org.opentripplanner.standalone.OTPMain;

public class Whatever {
	
	private static final String DATA_DIR = "../../otp-data/";
	private static final String GTFS_MAIN_URL = "http://data.foli.fi/gtfs";
	
	private OTPMain otp;
	
	public Whatever() {
		CommandLineParameters conf = new CommandLineParameters();
		conf.build = new File(DATA_DIR);
		conf.inMemory = true;
		otp = new OTPMain(conf);
		
	}
	
	private void run() {
		otp.run();
	}
	
	public static void main(String[] args) {
		new Whatever().run();
	}
	
}
