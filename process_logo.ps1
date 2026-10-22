# Generates assets/logo-icon.png and assets/logo-mark.png from original Canva source assets
$script = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class AssetGenerator
{
    public static void GenerateIcon(string whitePath, string blackPath, string outPath, int minX, int minY, int w, int h)
    {
        using (Bitmap bmpW = new Bitmap(whitePath))
        using (Bitmap bmpB = new Bitmap(blackPath))
        using (Bitmap outBmp = new Bitmap(w, h, PixelFormat.Format32bppArgb))
        {
            Rectangle rect = new Rectangle(minX, minY, w, h);
            BitmapData dataW = bmpW.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
            BitmapData dataB = bmpB.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
            BitmapData dataOut = outBmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

            byte[] rowW = new byte[dataW.Stride];
            byte[] rowB = new byte[dataB.Stride];
            byte[] rowOut = new byte[dataOut.Stride];

            for (int y = 0; y < h; y++)
            {
                Marshal.Copy((IntPtr)((long)dataW.Scan0 + y * dataW.Stride), rowW, 0, dataW.Stride);
                Marshal.Copy((IntPtr)((long)dataB.Scan0 + y * dataB.Stride), rowB, 0, dataB.Stride);

                for (int x = 0; x < w; x++)
                {
                    int idxRGB = x * 3;
                    int idxARGB = x * 4;

                    byte bW = rowW[idxRGB];
                    byte gW = rowW[idxRGB + 1];
                    byte rW = rowW[idxRGB + 2];

                    byte bB = rowB[idxRGB];
                    byte gB = rowB[idxRGB + 1];
                    byte rB = rowB[idxRGB + 2];

                    double dR = (rW - rB) / 255.0;
                    double dG = (gW - gB) / 255.0;
                    double dB = (bW - bB) / 255.0;

                    double diff = (dR + dG + dB) / 3.0;
                    double a = 1.0 - diff;
                    if (a < 0.0) a = 0.0;
                    if (a > 1.0) a = 1.0;

                    byte alpha = (byte)Math.Round(a * 255.0);

                    if (alpha < 3)
                    {
                        rowOut[idxARGB] = 0;
                        rowOut[idxARGB + 1] = 0;
                        rowOut[idxARGB + 2] = 0;
                        rowOut[idxARGB + 3] = 0;
                    }
                    else
                    {
                        double r = rB / a;
                        double g = gB / a;
                        double b = bB / a;

                        if (r > 255.0) r = 255.0;
                        if (g > 255.0) g = 255.0;
                        if (b > 255.0) b = 255.0;

                        rowOut[idxARGB] = (byte)Math.Round(b);
                        rowOut[idxARGB + 1] = (byte)Math.Round(g);
                        rowOut[idxARGB + 2] = (byte)Math.Round(r);
                        rowOut[idxARGB + 3] = alpha;
                    }
                }

                Marshal.Copy(rowOut, 0, (IntPtr)((long)dataOut.Scan0 + y * dataOut.Stride), dataOut.Stride);
            }

            bmpW.UnlockBits(dataW);
            bmpB.UnlockBits(dataB);
            outBmp.UnlockBits(dataOut);

            outBmp.Save(outPath, ImageFormat.Png);
        }
    }

    public static void GenerateMark(string whitePath, string outPath)
    {
        using (Bitmap bmpW = new Bitmap(whitePath))
        using (Bitmap outBmp = new Bitmap(bmpW.Width, bmpW.Height, PixelFormat.Format32bppArgb))
        {
            Rectangle rect = new Rectangle(0, 0, bmpW.Width, bmpW.Height);
            BitmapData dataW = bmpW.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
            BitmapData dataOut = outBmp.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

            byte[] rowW = new byte[dataW.Stride];
            byte[] rowOut = new byte[dataOut.Stride];

            for (int y = 0; y < bmpW.Height; y++)
            {
                Marshal.Copy((IntPtr)((long)dataW.Scan0 + y * dataW.Stride), rowW, 0, dataW.Stride);

                for (int x = 0; x < bmpW.Width; x++)
                {
                    int idxRGB = x * 3;
                    int idxARGB = x * 4;

                    byte bW = rowW[idxRGB];
                    byte gW = rowW[idxRGB + 1];
                    byte rW = rowW[idxRGB + 2];

                    if (rW >= 245 && gW >= 245 && bW >= 245)
                    {
                        rowOut[idxARGB] = 0;
                        rowOut[idxARGB + 1] = 0;
                        rowOut[idxARGB + 2] = 0;
                        rowOut[idxARGB + 3] = 0;
                    }
                    else
                    {
                        int minC = Math.Min(rW, Math.Min(gW, bW));
                        double a = 1.0;
                        if (minC > 220)
                        {
                            a = (255.0 - minC) / 35.0;
                            if (a < 0) a = 0;
                            if (a > 1) a = 1;
                        }

                        byte alpha = (byte)Math.Round(a * 255.0);
                        rowOut[idxARGB] = bW;
                        rowOut[idxARGB + 1] = gW;
                        rowOut[idxARGB + 2] = rW;
                        rowOut[idxARGB + 3] = alpha;
                    }
                }

                Marshal.Copy(rowOut, 0, (IntPtr)((long)dataOut.Scan0 + y * dataOut.Stride), dataOut.Stride);
            }

            bmpW.UnlockBits(dataW);
            outBmp.UnlockBits(dataOut);

            outBmp.Save(outPath, ImageFormat.Png);
        }
    }
}
"@

Add-Type -TypeDefinition $script -ReferencedAssemblies "System.Drawing.dll"

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $baseDir) { $baseDir = "c:\Users\Aditya\Website-ideas" }

[AssetGenerator]::GenerateIcon(
    "$baseDir\assets\logo-original-icon.png",
    "$baseDir\assets\logo-original-dark.png",
    "$baseDir\assets\logo-icon.png",
    688, 464, 599, 784
)

[AssetGenerator]::GenerateMark(
    "$baseDir\assets\logo-original-white.png",
    "$baseDir\assets\logo-mark.png"
)

Write-Host "Successfully generated logo-icon.png and logo-mark.png"
