package org.data.gtfs;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.zip.GZIPInputStream;

public class GTFSFileLoader {
	private String baseUrl;
	
	
	public GTFSFileLoader(String burl) {
		baseUrl = burl;
		if(baseUrl.charAt(baseUrl.length() - 1) != '/') baseUrl += '/';
	}
	
	public void load(String subPath, File f) throws MalformedURLException, IOException {
		URL url = new URL(baseUrl + subPath);
		File tempLoadedFile = new File("../.temp-download-file");
		if(!tempLoadedFile.exists()) tempLoadedFile.createNewFile();
		if(!f.exists()) f.createNewFile();
		
		boolean comp = writeStreamToFile(url.openStream(), tempLoadedFile);
		
		if(comp) {
			decompress(tempLoadedFile, f);
			
		} else {
			try(FileInputStream fis = new FileInputStream(tempLoadedFile);
					FileOutputStream fos = new FileOutputStream(f)) {
				move(fis, fos);
			}
			
		}
	}
	
	public static boolean writeStreamToFile(InputStream in, File f) throws IOException {
		boolean isCompressed = false;
		boolean firstDataSet = true;
		
		try(FileOutputStream fos = new FileOutputStream(f)) {
			byte[] data = new byte[4096];
			int bytesRead = -1;
			while((bytesRead = in.read(data)) != -1) {
				if(firstDataSet) {
					isCompressed = isCompressed(data);
					firstDataSet = false;
				}
				
				fos.write(data, 0, bytesRead);
			}
			fos.flush();
		}
		
		return isCompressed;
	}
	
	public static void decompress(File in, File out) throws IOException {
		try(GZIPInputStream gzis = new GZIPInputStream(new FileInputStream(in));
				FileOutputStream fos = new FileOutputStream(out)) {
			
			move(gzis, fos);
		}
	}
	
	public static void move(InputStream in, OutputStream out) throws IOException {
		byte[] data = new byte[4096];
		int bytesRead = -1;
		while((bytesRead = in.read(data)) != -1) {
			out.write(data, 0, bytesRead);
		}
	}
	
	private static final byte[] compressedStartBytes = new byte[] { 0x1F, -0x75, 0x08, 0x0, 0x0, 0x0, 0x0, 0x0, 0x04, 0x03 };
	private static boolean isCompressed(byte[] b) {
		if(b.length < compressedStartBytes.length) return false;
		for(int i = 0; i < b.length && i < compressedStartBytes.length; i++) {
			if(b[i] != compressedStartBytes[i]) return false;
		}
		return true;
	}
	
	public static void main(String[] a) {
		try {
			writeStreamToFile(new URL("http://data.foli.fi/gtfs/v0/20180119-100304/stops").openStream(), new File("../../gtfs-data/test"));
			//decompress(new File("../../gtfs-data/test"), new File("../../gtfs-data/test_out"));
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
	
}
