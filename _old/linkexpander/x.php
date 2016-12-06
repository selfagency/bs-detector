<?php

$parts = parse_url($_SERVER['REQUEST_URI']);
parse_str($parts['query'], $query);
$urlQuery = $query['url'];
$urls = explode(',', $urlQuery);

function expandUrl($url, $hops = 5)
{
    if ($hops == MAX_URL_HOPS) {
        throw new Exception('TOO_MANY_HOPS');
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HEADER, 1);
    curl_setopt($ch, CURLOPT_NOBODY, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    $r = curl_exec($ch);

    if (preg_match('/Location: (?P<url>.*)/i', $r, $match)) {
        return expandUrl($match['url'], $hops + 1);
    }

    return rtrim($url);
}

echo '[';
foreach ($urls as $shortUrl) {
    $longUrl = expandUrl($shortUrl);
    $output = $output . '{"shortUrl": "' . $shortUrl . '", "longUrl": "' . $longUrl . '"},';
}
$output = rtrim($output, ',');
echo $output;
echo ']';
