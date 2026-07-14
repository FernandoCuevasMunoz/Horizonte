package com.horizonteinmobiliario.model;

import jakarta.persistence.*;

@Entity
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String title;
    private String type;
    private String operation;
    private String location;
    private String region;
    private String price;
    private Double numericPrice;
    private Integer beds;
    private Integer baths;
    private Integer parking;
    private Integer area;
    @Column(name = "land_area")
    private Integer landArea;
    private String image;
    private String neighborhood;
    private String city;
    private Double lat;
    private Double lng;
    private String expenses;
    private String contributions;
    @Column(name = "built_year")
    private Integer builtYear;
    private String orientation;
    private String floor;
    private String buildingFloors;
    private Integer rooms;
    @Column(name = "pets_allowed")
    private Boolean petsAllowed;
    private Boolean furnished;
    private Integer warehouses;
    private String recentWork;
    private String nearby;
    @Column(length = 2000)
    private String equipment;
    @Column(length = 2000)
    private String community;
    private Boolean featured;
    @Column(length = 5000)
    private String gallery;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
    public Double getNumericPrice() { return numericPrice; }
    public void setNumericPrice(Double numericPrice) { this.numericPrice = numericPrice; }
    public Integer getBeds() { return beds; }
    public void setBeds(Integer beds) { this.beds = beds; }
    public Integer getBaths() { return baths; }
    public void setBaths(Integer baths) { this.baths = baths; }
    public Integer getParking() { return parking; }
    public void setParking(Integer parking) { this.parking = parking; }
    public Integer getArea() { return area; }
    public void setArea(Integer area) { this.area = area; }
    public Integer getLandArea() { return landArea; }
    public void setLandArea(Integer landArea) { this.landArea = landArea; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getNeighborhood() { return neighborhood; }
    public void setNeighborhood(String neighborhood) { this.neighborhood = neighborhood; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }
    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
    public String getExpenses() { return expenses; }
    public void setExpenses(String expenses) { this.expenses = expenses; }
    public String getContributions() { return contributions; }
    public void setContributions(String contributions) { this.contributions = contributions; }
    public Integer getBuiltYear() { return builtYear; }
    public void setBuiltYear(Integer builtYear) { this.builtYear = builtYear; }
    public String getOrientation() { return orientation; }
    public void setOrientation(String orientation) { this.orientation = orientation; }
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
    public String getBuildingFloors() { return buildingFloors; }
    public void setBuildingFloors(String buildingFloors) { this.buildingFloors = buildingFloors; }
    public Integer getRooms() { return rooms; }
    public void setRooms(Integer rooms) { this.rooms = rooms; }
    public Boolean getPetsAllowed() { return petsAllowed; }
    public void setPetsAllowed(Boolean petsAllowed) { this.petsAllowed = petsAllowed; }
    public Boolean getFurnished() { return furnished; }
    public void setFurnished(Boolean furnished) { this.furnished = furnished; }
    public Integer getWarehouses() { return warehouses; }
    public void setWarehouses(Integer warehouses) { this.warehouses = warehouses; }
    public String getRecentWork() { return recentWork; }
    public void setRecentWork(String recentWork) { this.recentWork = recentWork; }
    public String getNearby() { return nearby; }
    public void setNearby(String nearby) { this.nearby = nearby; }
    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
    public String getCommunity() { return community; }
    public void setCommunity(String community) { this.community = community; }
    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public String getGallery() { return gallery; }
    public void setGallery(String gallery) { this.gallery = gallery; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
