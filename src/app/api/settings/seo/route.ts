import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/settings/seo`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        seoSettings: data.seoSettings || data
      });
    }

    // Return defaults if fetch fails
    return NextResponse.json({
      success: true,
      seoSettings: {
        metaDescriptionAr: 'تسوّق أونلاين أحدث الجلابيات المغربية والثياب العصرية الرجالية من رِداء. خامات فاخرة، تفصيل دقيق، وخيارات مقاسات وألوان تناسب كل المناسبات مع شحن سريع داخل مصر.',
        metaDescriptionEn: 'Shop premium Moroccan djellabas and modern modest wear for men at Ridaa. High‑quality fabrics, elegant tailoring and fast delivery across Egypt.',
        keywords: 'رِداء, رداء, جلابية مغربية, جلابيات رجالي, ملابس إسلامية, ثياب رجالية, djellaba, moroccan djellaba, islamic clothing, thobes, modest wear'
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      seoSettings: {
        metaDescriptionAr: 'تسوّق أونلاين أحدث الجلابيات المغربية والثياب العصرية الرجالية من رِداء. خامات فاخرة، تفصيل دقيق، وخيارات مقاسات وألوان تناسب كل المناسبات مع شحن سريع داخل مصر.',
        metaDescriptionEn: 'Shop premium Moroccan djellabas and modern modest wear for men at Ridaa. High‑quality fabrics, elegant tailoring and fast delivery across Egypt.',
        keywords: 'رِداء, رداء, جلابية مغربية, جلابيات رجالي, ملابس إسلامية, ثياب رجالية, djellaba, moroccan djellaba, islamic clothing, thobes, modest wear'
      }
    });
  }
}

