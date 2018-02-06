package org.data.gtfs;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.data.utils.StreamIO;

public class GTFSZipLoader {
	
	private File baseDir;
	
	public GTFSZipLoader(File dir) {
		if(!dir.exists() || !dir.isDirectory()) throw new IllegalArgumentException("File must denote to an existing directory.");
		
		baseDir = dir;
	}
	
	public File load(String uri) throws MalformedURLException, IOException {
		URL url = new URL(uri);
		File zipFile = new File(baseDir, "gtfs-data.zip");
		if(!zipFile.exists()) zipFile.createNewFile();
		
		StreamIO.writeStreamToFile(url.openStream(), zipFile);
		return zipFile;
	}
	
	public void uncompress(File f) throws IOException {
		ZipInputStream in = new ZipInputStream(new FileInputStream(f));
		ZipEntry entry = null;
		File nDir = new File(baseDir, f.getName().replace(".zip", "/"));
		nDir.mkdir();
		
		while((entry = in.getNextEntry()) != null) {
			File newFile = new File(nDir, entry.getName());
			newFile.createNewFile();
			
			StreamIO.writeStreamToFile(in, newFile);
		}
	}
	
	private static final String GTFS_MAIN_URL = "http://data.foli.fi/gtfs/gtfs.zip";
	public static void main(String[] args) {
		GTFSZipLoader test = new GTFSZipLoader(new File("../../otp-data/"));
		try {
			test.load(GTFS_MAIN_URL);
			test.uncompress(new File(test.baseDir, "gtfs-data.zip"));
			
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
	
}
