package org.data.utils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class StreamIO {
	
	public static void writeStreamToFile(InputStream in, File f) throws IOException {
		try(FileOutputStream fos = new FileOutputStream(f)) {
			move(in, fos);
		}
	}
	
	public static void move(InputStream in, OutputStream out) throws IOException {
		byte[] data = new byte[4096];
		int bytesRead = -1;
		while((bytesRead = in.read(data)) != -1) {
			out.write(data, 0, bytesRead);
		}
		out.flush();
	}
	
}
