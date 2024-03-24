package org.dj.auth.endoint;


import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

import static java.lang.StringTemplate.STR;

@RestController
@RequestMapping("/")
public class AuthEndpoint {


    String auth_url = "http://localhost:8080/realms/test-dj-realm/protocol/openid-connect/auth";
    String token_url = "http://localhost:8080/realms/test-dj-realm/protocol/openid-connect/token";
    String client_id = "test-dj-client";
    final Set<String> nonceUsed = new HashSet<>();
    final Set<String> expectedState = new HashSet<>();

    public AuthEndpoint(){
        client = HttpClient
                .newBuilder()
                .build();
    }
    HttpClient client;

    @GetMapping(value="/auth")
    public void implicit(HttpServletResponse response) throws IOException {
        var nonce = UUID.randomUUID();
        var state = UUID.randomUUID();
        expectedState.add(state.toString());
        var uri = UriComponentsBuilder
                .fromUriString(auth_url)
                .queryParam("client_id", client_id)
                .queryParam("redirect_uri", "http://localhost:8081/callback")
                .queryParam("response_type","code")
                .queryParam("nonce", nonce)
                .queryParam("state", state)
                .queryParam("scope","openid")
                .build();
        response.sendRedirect(uri.toString());
    }

    @GetMapping(value="/callback")
    public ResponseEntity<String> callback(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException, InterruptedException {

        // csrf attach coverage
        var state = params.get("state");
        if(! expectedState.contains(state))
            return ResponseEntity.status(401).body("not authorized");

        expectedState.remove(state);

        var accessCode = params.get("code");
        var postParams = STR."client_id=\{client_id}&code=\{accessCode}&grant_type=authorization_code&redirect_uri=http://localhost:8081/callback";


        var request = HttpRequest.newBuilder()
                .uri(URI.create(token_url))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(postParams))
                .build();
        var exchangeResponse = client.send(request, HttpResponse.BodyHandlers.ofString());

        var body = exchangeResponse.body();
        System.out.println(body);

        var jsonParser =  JsonParserFactory.getJsonParser();
        var jsonMap = jsonParser.parseMap(body);

        if(jsonMap.containsKey("error")) {
            return ResponseEntity.status(401).body(STR."not authorized: \{jsonMap.get("error")}");
        }

        // replay attack coverage
        var accessToken = (String)jsonMap.get("access_token");
        if(isReplayCodeExchange(accessToken)) {
            return ResponseEntity.status(401).body("not authorized: code replay");
        }

        return ResponseEntity.ok().body(accessToken);
    }

    private boolean isReplayCodeExchange(String accessToken) {
        var payload = accessToken.split("\\.")[1];
        var codeBytes = Base64.getUrlDecoder().decode(payload);
        var codeStr = new String(codeBytes);
        var jsonMap = JsonParserFactory.getJsonParser().parseMap(codeStr);
        var nonce = (String)jsonMap.get("nonce");
        return !nonceUsed.add(nonce);
    }
}