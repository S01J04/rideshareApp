{stops &&
  stops.map((stop, index) => (
    <Marker
      key={`${stop.type}-${index}`}
      coordinate={stop.location}
      title={stop.label || ""}
    >
      <View style={{ alignItems: "center", justifyContent: "center", minHeight: 60 }}>
        {/* Passenger picture overlay (above marker) */}
        {stop.showPicture && stop.passenger?.userDetails?.profilePicture && (
          <View style={{ alignItems: "center", position: "absolute", top: -38, zIndex: 2 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                overflow: "hidden",
                borderWidth: 2,
                borderColor: "#3B82F6",
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Image
                source={{ uri: stop.passenger.userDetails.profilePicture }}
                style={{ width: 36, height: 36 }}
                resizeMode="cover"
              />
            </View>
          </View>
        )}
        {/* Circle marker with label */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: stop.status === "completed" ? "#10B981" : stop.iconColor,
            borderWidth: 2,
            borderColor: "white",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <Text
            style={{
              color: "black",
              fontWeight: "bold",
              fontSize: 14,
            }}
          >
            {stop.type === "pickup"
              ? "P"
              : stop.type === "dropoff"
              ? "D"
              : stop.type === "start"
              ? "S"
              : "E"}
          </Text>
        </View>
        {/* Pointed Tail (triangle) below marker */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 8,
            borderRightWidth: 8,
            borderTopWidth: 10,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: stop.status === "completed" ? "#10B981" : stop.iconColor,
            marginTop: -2,
            zIndex: 0,
          }}
        />
      </View>
    </Marker>
  ))} 